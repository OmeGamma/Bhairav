import asyncio
import logging
import cv2
import os
from datetime import datetime
from typing import Dict, Optional, Any
from app.services.video_source import VideoSource, VideoFileSource, RTSPSource, WebcamSource, SimulatedSource
from app.services.video_engine import analyze_frame
from app.core.config import settings

logger = logging.getLogger(__name__)

class CameraManager:
    def __init__(self):
        self.active_sessions: Dict[str, asyncio.Task] = {}
        self.active_sources: Dict[str, VideoSource] = {}

    def get_source_for_type(self, source_type: str, stream_reference: str, camera_id: str) -> VideoSource:
        if source_type == "VIDEO_FILE":
            return VideoFileSource(stream_reference)
        elif source_type == "WEBCAM":
            return WebcamSource(stream_reference)
        elif source_type == "RTSP":
            return RTSPSource(stream_reference)
        else:
            return SimulatedSource(camera_id)

    async def start_session(self, camera_id: str, session_id: str, source_type: str, stream_reference: str, fps: int = 30):
        if camera_id in self.active_sessions:
            await self.stop_session(camera_id)

        source = self.get_source_for_type(source_type, stream_reference, camera_id)
        if not await source.open():
            logger.error(f"Failed to open source for {camera_id}")
            return False
            
        self.active_sources[camera_id] = source

        task = asyncio.create_task(self._processing_loop(camera_id, session_id, source, fps))
        self.active_sessions[camera_id] = task
        return True

    async def stop_session(self, camera_id: str):
        if camera_id in self.active_sessions:
            task = self.active_sessions[camera_id]
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            del self.active_sessions[camera_id]
            
        if camera_id in self.active_sources:
            await self.active_sources[camera_id].close()
            del self.active_sources[camera_id]

    async def _processing_loop(self, camera_id: str, session_id: str, source: VideoSource, target_fps: int):
        logger.info(f"Started processing loop for {camera_id}, session {session_id}")
        frame_idx = 0
        
        # Determine delay from fps
        delay = 1.0 / target_fps if target_fps > 0 else 0.033
        
        db = None
        try:
            from app.core.database import client
            if client:
                # Motor client is accessible synchronously as a property, we just need the DB name
                # settings.MONGODB_URI usually has a db, or we default
                db = client.get_default_database()
        except Exception as e:
            logger.error(f"Could not obtain DB connection in background task: {e}")
            return

        try:
            while True:
                loop_start = asyncio.get_event_loop().time()
                ret, frame = await source.read_frame()
                if not ret or frame is None:
                    logger.info(f"Source ended or failed for {camera_id}")
                    # Update session status
                    if db is not None:
                        await db.camera_sessions.update_one(
                            {"_id": session_id}, 
                            {"$set": {"status": "STOPPED", "ended_at": datetime.utcnow()}}
                        )
                    break

                # 1. Analyze frame
                analysis = analyze_frame(frame, camera_id, session_id, frame_idx)
                
                # 2. Extract events
                if analysis.event.severity in ["critical", "warning"]:
                    snapshot_id = f"snap_{camera_id}_{session_id}_{frame_idx}"
                    
                    # Save snapshot to disk (evidence storage)
                    snapshot_dir = os.path.join(settings.STORAGE_DIR, "snapshots")
                    os.makedirs(snapshot_dir, exist_ok=True)
                    snapshot_path = os.path.join(snapshot_dir, f"{snapshot_id}.jpg")
                    cv2.imwrite(snapshot_path, frame)
                    
                    event_doc = {
                        "event_type": analysis.event.type,
                        "severity": analysis.event.severity,
                        "description": f"Detected {len(analysis.detections)} entities.",
                        "camera_id": camera_id,
                        "session_id": session_id,
                        "status": "NEW",
                        "frame_number": frame_idx,
                        "snapshot_id": snapshot_id,
                        "timestamp": datetime.utcnow(),
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                    
                    # Persist Event
                    if db is not None:
                        result = await db.events.insert_one(event_doc)
                        
                        # Also create an Alert for critical events
                        if analysis.event.severity == "critical":
                            alert_doc = {
                                "event_id": str(result.inserted_id),
                                "camera_id": camera_id,
                                "severity": "critical",
                                "title": f"Critical: {analysis.event.type.capitalize()}",
                                "description": event_doc["description"],
                                "status": "NEW",
                                "created_at": datetime.utcnow(),
                                "updated_at": datetime.utcnow()
                            }
                            await db.alerts.insert_one(alert_doc)
                            
                # 3. Broadcast real-time telemetry/detections via WebSockets
                try:
                    from app.core.websocket import websocket_manager
                    await websocket_manager.broadcast_camera_telemetry(camera_id, {
                        "session_id": session_id,
                        "frame_number": frame_idx,
                        "timestamp": datetime.utcnow().isoformat(),
                        "detections": [d.model_dump() for d in analysis.detections],
                        "severity": analysis.event.severity,
                        "event_type": analysis.event.type,
                        "snapshot_id": snapshot_id if analysis.event.severity in ["critical", "warning"] else None
                    })
                except Exception as ws_err:
                    logger.error(f"WebSocket broadcast error: {ws_err}")

                frame_idx += 1
                
                # Periodically update session stats (every 30 frames)
                if frame_idx % 30 == 0 and db is not None:
                    await db.camera_sessions.update_one(
                        {"_id": session_id},
                        {"$set": {
                            "frames_processed": frame_idx,
                            "last_frame_at": datetime.utcnow(),
                            "status": "RUNNING"
                        }}
                    )
                
                # Regulate FPS
                elapsed = asyncio.get_event_loop().time() - loop_start
                sleep_time = max(0, delay - elapsed)
                await asyncio.sleep(sleep_time)

        except asyncio.CancelledError:
            logger.info(f"Processing loop cancelled for {camera_id}")
            if db is not None:
                await db.camera_sessions.update_one(
                    {"_id": session_id}, 
                    {"$set": {"status": "STOPPED", "ended_at": datetime.utcnow()}}
                )
        except Exception as e:
            logger.error(f"Error in processing loop for {camera_id}: {e}")
            if db is not None:
                await db.camera_sessions.update_one(
                    {"_id": session_id}, 
                    {"$set": {"status": "ERROR", "error": str(e), "ended_at": datetime.utcnow()}}
                )
        finally:
            if camera_id in self.active_sources:
                await self.active_sources[camera_id].close()
                del self.active_sources[camera_id]

camera_manager = CameraManager()
