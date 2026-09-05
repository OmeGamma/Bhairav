"""
Bhairav Video Processing Pipeline

Integrates AI inference engine with camera infrastructure.
Handles VideoSource, CameraSession, and FrameProcessor.
"""

from typing import Dict, Any, List, Optional
import logging
import asyncio
import numpy as np
from datetime import datetime
import uuid
import cv2

from .ai_inference import AIInferenceEngine
from .event_service import EventService
from app.core.database import get_db

logger = logging.getLogger(__name__)


class VideoSource:
    """Represents a video source (camera, file, stream)."""
    
    def __init__(
        self,
        source_id: str,
        source_type: str,  # RTSP_STREAM, VIDEO_FILE, WEBCAM
        source_url: str,
        camera_id: Optional[str] = None
    ):
        self.source_id = source_id
        self.source_type = source_type
        self.source_url = source_url
        self.camera_id = camera_id
        self.is_active = False
        self.cap = None
    
    async def connect(self) -> bool:
        """Connect to video source."""
        try:
            if self.source_type == "RTSP_STREAM":
                self.cap = cv2.VideoCapture(self.source_url)
            elif self.source_type == "VIDEO_FILE":
                self.cap = cv2.VideoCapture(self.source_url)
            elif self.source_type == "WEBCAM":
                self.cap = cv2.VideoCapture(0)  # Default webcam
            else:
                logger.error(f"Unknown source type: {self.source_type}")
                return False
            
            if self.cap.isOpened():
                self.is_active = True
                logger.info(f"Connected to video source: {self.source_id}")
                return True
            else:
                logger.error(f"Failed to connect to video source: {self.source_id}")
                return False
                
        except Exception as e:
            logger.error(f"Video source connection error: {e}")
            return False
    
    async def disconnect(self) -> None:
        """Disconnect from video source."""
        if self.cap:
            self.cap.release()
            self.cap = None
        self.is_active = False
        logger.info(f"Disconnected from video source: {self.source_id}")
    
    async def read_frame(self) -> Optional[np.ndarray]:
        """Read a single frame from video source."""
        if not self.is_active or not self.cap:
            return None
        
        ret, frame = self.cap.read()
        if ret:
            return frame
        return None
    
    def get_info(self) -> Dict[str, Any]:
        """Get video source information."""
        info = {
            "source_id": self.source_id,
            "source_type": self.source_type,
            "source_url": self.source_url,
            "camera_id": self.camera_id,
            "is_active": self.is_active
        }
        
        if self.cap and self.is_active:
            info["fps"] = self.cap.get(cv2.CAP_PROP_FPS)
            info["width"] = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            info["height"] = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            info["frame_count"] = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        return info


class CameraSession:
    """
    Manages a video processing session for a camera.
    Coordinates video source, AI inference, and event generation.
    """
    
    def __init__(
        self,
        session_id: str,
        camera_id: str,
        video_source: VideoSource,
        ai_engine: AIInferenceEngine,
        event_service: Optional[EventService] = None,
        config: Optional[Dict[str, Any]] = None
    ):
        self.session_id = session_id
        self.camera_id = camera_id
        self.video_source = video_source
        self.ai_engine = ai_engine
        self.event_service = event_service
        self.config = config or {}
        
        # Session state
        self.is_active = False
        self.frame_number = 0
        self.start_time = None
        self.end_time = None
        
        # Processing configuration
        self.fps_limit = config.get("fps_limit", 15)
        self.frame_skip = config.get("frame_skip", 1)
        self.processing_enabled = config.get("processing_enabled", True)
        
        # Virtual zones (from camera config)
        self.virtual_zones = config.get("virtual_zones", [])
        
        # Event storage
        self.events: List[Dict[str, Any]] = []
        self.snapshots: List[Dict[str, Any]] = []
    
    async def start(self) -> bool:
        """Start the camera session."""
        try:
            # Connect to video source
            if not await self.video_source.connect():
                return False
            
            self.is_active = True
            self.start_time = datetime.utcnow()
            self.frame_number = 0
            
            logger.info(f"Camera session started: {self.session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start camera session: {e}")
            return False
    
    async def stop(self) -> None:
        """Stop the camera session."""
        self.is_active = False
        self.end_time = datetime.utcnow()
        await self.video_source.disconnect()
        logger.info(f"Camera session stopped: {self.session_id}")
    
    async def process_frame(self) -> Optional[Dict[str, Any]]:
        """
        Process a single frame through the AI pipeline.
        
        Returns:
            Complete inference result or None if no frame available
        """
        if not self.is_active:
            return None
        
        try:
            # Read frame
            frame = await self.video_source.read_frame()
            if frame is None:
                return None
            
            # Frame skipping for performance
            if self.frame_number % self.frame_skip != 0:
                self.frame_number += 1
                return None
            
            # Process through AI engine
            if self.processing_enabled:
                result = await self.ai_engine.process_frame(
                    frame=frame,
                    camera_id=self.camera_id,
                    session_id=self.session_id,
                    frame_number=self.frame_number,
                    timestamp=datetime.utcnow(),
                    metadata={
                        "virtual_zones": self.virtual_zones,
                        "restricted_zone": any(zone.get("type") == "RESTRICTED" for zone in self.virtual_zones)
                    }
                )
                
                # Persist results if event service is available
                if self.event_service:
                    try:
                        persisted_ids = await self.event_service.process_inference_result(result)
                        logger.debug(f"Persisted {sum(len(v) for v in persisted_ids.values())} items")
                    except Exception as e:
                        logger.error(f"Failed to persist inference result: {e}")
                
                # Store events locally
                if result.get("fence_events"):
                    self.events.extend(result["fence_events"])
                
                if result.get("rule_events"):
                    self.events.extend(result["rule_events"])
                
                # Generate snapshot for significant events
                if result.get("fence_events") or result.get("rule_events"):
                    snapshot = await self._generate_snapshot(frame, result)
                    if snapshot:
                        self.snapshots.append(snapshot)
                
                self.frame_number += 1
                return result
            else:
                self.frame_number += 1
                return None
                
        except Exception as e:
            logger.error(f"Frame processing error: {e}")
            return None
    
    async def _generate_snapshot(self, frame: np.ndarray, result: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Generate annotated snapshot for evidence."""
        try:
            # Create annotated frame
            annotated = frame.copy()
            
            # Draw bounding boxes
            for detection in result.get("detections", []):
                bbox = detection["bbox"]
                label = detection["label"]
                confidence = detection["confidence"]
                
                cv2.rectangle(
                    annotated,
                    (int(bbox["x1"]), int(bbox["y1"])),
                    (int(bbox["x2"]), int(bbox["y2"])),
                    (0, 255, 0), 2
                )
                
                cv2.putText(
                    annotated,
                    f"{label} {confidence:.2f}",
                    (int(bbox["x1"]), int(bbox["y1"]) - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2
                )
            
            # Convert to bytes for storage
            _, buffer = cv2.imencode('.jpg', annotated)
            snapshot_bytes = buffer.tobytes()
            
            return {
                "snapshot_id": str(uuid.uuid4()),
                "session_id": self.session_id,
                "camera_id": self.camera_id,
                "frame_number": self.frame_number,
                "timestamp": datetime.utcnow().isoformat(),
                "snapshot_data": snapshot_bytes,
                "event_count": len(result.get("fence_events", [])) + len(result.get("rule_events", []))
            }
            
        except Exception as e:
            logger.error(f"Snapshot generation error: {e}")
            return None
    
    def get_session_info(self) -> Dict[str, Any]:
        """Get session information."""
        duration = None
        if self.start_time:
            if self.end_time:
                duration = (self.end_time - self.start_time).total_seconds()
            else:
                duration = (datetime.utcnow() - self.start_time).total_seconds()
        
        return {
            "session_id": self.session_id,
            "camera_id": self.camera_id,
            "is_active": self.is_active,
            "frame_number": self.frame_number,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration_seconds": duration,
            "events_generated": len(self.events),
            "snapshots_generated": len(self.snapshots),
            "ai_metrics": self.ai_engine.get_metrics() if self.ai_engine else None
        }


class VideoProcessor:
    """
    Main video processing coordinator.
    Manages multiple camera sessions and coordinates with the AI engine.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        
        # AI Engine
        self.ai_engine = AIInferenceEngine(config.get("ai", {}))
        
        # Active sessions
        self.sessions: Dict[str, CameraSession] = {}
        
        # Session management
        self.max_concurrent_sessions = config.get("max_concurrent_sessions", 4)
    
    async def create_session(
        self,
        camera_id: str,
        source_type: str,
        source_url: str,
        config: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """
        Create a new camera session.
        
        Returns:
            Session ID if successful, None otherwise
        """
        if len(self.sessions) >= self.max_concurrent_sessions:
            logger.warning("Max concurrent sessions reached")
            return None
        
        try:
            session_id = str(uuid.uuid4())
            
            # Create video source
            video_source = VideoSource(
                source_id=f"{camera_id}_source",
                source_type=source_type,
                source_url=source_url,
                camera_id=camera_id
            )
            
            # Create session
            session = CameraSession(
                session_id=session_id,
                camera_id=camera_id,
                video_source=video_source,
                ai_engine=self.ai_engine,
                event_service=None,  # Will be set when database is available
                config=config
            )
            
            # Start session
            if await session.start():
                self.sessions[session_id] = session
                logger.info(f"Created camera session: {session_id}")
                return session_id
            else:
                return None
                
        except Exception as e:
            logger.error(f"Failed to create session: {e}")
            return None
    
    async def stop_session(self, session_id: str) -> bool:
        """Stop a camera session."""
        if session_id not in self.sessions:
            return False
        
        try:
            session = self.sessions[session_id]
            await session.stop()
            del self.sessions[session_id]
            logger.info(f"Stopped camera session: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to stop session: {e}")
            return False
    
    async def process_session_frame(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Process a single frame for a specific session."""
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        return await session.process_frame()
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific session."""
        if session_id not in self.sessions:
            return None
        
        return self.sessions[session_id].get_session_info()
    
    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """Get information about all active sessions."""
        return [session.get_session_info() for session in self.sessions.values()]
    
    def get_ai_engine_info(self) -> Dict[str, Any]:
        """Get AI engine information."""
        return self.ai_engine.get_model_info()
    
    def get_processor_metrics(self) -> Dict[str, Any]:
        """Get video processor metrics."""
        return {
            "active_sessions": len(self.sessions),
            "max_concurrent_sessions": self.max_concurrent_sessions,
            "ai_metrics": self.ai_engine.get_metrics()
        }
