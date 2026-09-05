"""
Bhairav AI Inference Engine - Main Interface

Provides modular AI/ML capabilities for video analytics.
Supports multiple model providers and inference engines.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
import numpy as np

from .detectors import ObjectDetector
from .trackers import ObjectTracker
from .anpr import ANPREngine
from .face import FaceDetector
from .virtual_fence import VirtualFence
from .rules import RuleEngine

logger = logging.getLogger(__name__)


class AIInferenceEngine:
    """
    Main AI inference engine that coordinates all AI/ML components.
    
    Architecture:
        Video Frame → ObjectDetector → Tracker → FaceDetector → ANPREngine
                  → VirtualFence → RuleEngine → Event → Alert → Evidence
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        
        # Initialize components
        self.detector = ObjectDetector(config.get("detector", {}))
        self.tracker = ObjectTracker(config.get("tracker", {}))
        self.face_detector = FaceDetector(config.get("face", {}))
        self.anpr_engine = ANPREngine(config.get("anpr", {}))
        self.virtual_fence = VirtualFence(config.get("virtual_fence", {}))
        self.rule_engine = RuleEngine(config.get("rules", {}))
        
        # Metrics
        self.metrics = {
            "frames_processed": 0,
            "detections": 0,
            "tracks": 0,
            "inference_time_ms": 0,
            "fps": 0.0,
        }
        
        logger.info("AIInferenceEngine initialized")
    
    async def process_frame(
        self,
        frame: np.ndarray,
        camera_id: str,
        session_id: str,
        frame_number: int,
        timestamp: datetime,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a single video frame through the complete AI pipeline.
        
        Args:
            frame: Video frame as numpy array (BGR format)
            camera_id: Camera identifier
            session_id: Video session identifier
            frame_number: Frame number in sequence
            timestamp: Frame timestamp
            metadata: Additional metadata (camera config, etc.)
        
        Returns:
            Complete inference results including detections, tracks, events, etc.
        """
        start_time = datetime.utcnow()
        metadata = metadata or {}
        
        try:
            # Step 1: Object Detection
            detections = await self.detector.detect(frame)
            
            # Step 2: Object Tracking
            tracks = await self.tracker.update(detections, frame_number, camera_id, session_id)
            
            # Step 3: Face Detection (on person detections)
            face_detections = []
            for detection in detections:
                if detection.label == "person":
                    person_faces = await self.face_detector.detect(frame, detection.bbox)
                    face_detections.extend(person_faces)
            
            # Step 4: ANPR (on vehicle detections)
            anpr_results = []
            for detection in detections:
                if detection.label in ["car", "truck", "bus", "motorcycle"]:
                    plate_result = await self.anpr_engine.process(frame, detection.bbox, detection.label)
                    if plate_result:
                        anpr_results.append(plate_result)
            
            # Step 5: Virtual Fence Evaluation
            fence_events = []
            if metadata.get("virtual_zones"):
                for track in tracks:
                    fence_event = await self.virtual_fence.evaluate(
                        track, metadata["virtual_zones"], camera_id, timestamp
                    )
                    if fence_event:
                        fence_events.append(fence_event)
            
            # Step 6: Rule Engine Evaluation
            rule_events = await self.rule_engine.evaluate(
                tracks, detections, metadata, camera_id, timestamp
            )
            
            # Update metrics
            self.metrics["frames_processed"] += 1
            self.metrics["detections"] += len(detections)
            self.metrics["tracks"] = len(tracks)
            
            inference_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            self.metrics["inference_time_ms"] = inference_time
            if self.metrics["frames_processed"] > 0:
                self.metrics["fps"] = 1000.0 / max(inference_time, 1)
            
            return {
                "camera_id": camera_id,
                "session_id": session_id,
                "frame_number": frame_number,
                "timestamp": timestamp.isoformat(),
                "detections": [d.model_dump() for d in detections],
                "tracks": [t.model_dump() for t in tracks],
                "face_detections": [f.model_dump() for f in face_detections],
                "anpr_results": [a.model_dump() for a in anpr_results],
                "fence_events": fence_events,
                "rule_events": rule_events,
                "metrics": {
                    "inference_time_ms": inference_time,
                    "detection_count": len(detections),
                    "track_count": len(tracks),
                },
                "model_info": self.get_model_info(),
            }
            
        except Exception as e:
            logger.error(f"Frame processing error: {e}")
            raise
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models."""
        return {
            "detector": self.detector.get_info(),
            "tracker": self.tracker.get_info(),
            "face_detector": self.face_detector.get_info(),
            "anpr_engine": self.anpr_engine.get_info(),
            "config": self.config,
        }
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get performance metrics."""
        return self.metrics.copy()
    
    def reset_metrics(self) -> None:
        """Reset performance metrics."""
        self.metrics = {
            "frames_processed": 0,
            "detections": 0,
            "tracks": 0,
            "inference_time_ms": 0,
            "fps": 0.0,
        }
