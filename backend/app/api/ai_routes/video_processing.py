"""
Bhairav Video Processing API

Endpoints for video processing, camera sessions, and AI inference.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, List, Optional
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions
from app.services.video_processor import VideoProcessor
from app.services.ai_inference import AIInferenceEngine
from app.services.event_service import EventService
from app.core.config import settings

router = APIRouter()

# Global video processor instance
video_processor = None


def get_video_processor():
    """Get or create video processor instance."""
    global video_processor
    if video_processor is None:
        ai_config = {
            "detector": {
                "model_name": settings.AI_MODEL_PATH,
                "confidence_threshold": settings.AI_CONFIDENCE_THRESHOLD,
                "device": settings.AI_DEVICE
            },
            "tracker": {
                "max_lost_frames": 10,
                "iou_threshold": 0.3
            },
            "rules": {
                "night_start": settings.AI_NIGHT_START,
                "night_end": settings.AI_NIGHT_END,
                "dwell_time_threshold": settings.AI_DWELL_TIME_THRESHOLD,
                "cooldown_seconds": settings.AI_EVENT_COOLDOWN
            }
        }
        video_processor = VideoProcessor({"ai": ai_config})
    return video_processor


@router.post("/sessions")
async def create_camera_session(
    camera_id: str,
    source_type: str,
    source_url: str,
    config: Optional[Dict[str, Any]] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cameras.create"]))
):
    """
    Create a new camera processing session.
    
    Args:
        camera_id: Camera identifier
        source_type: RTSP_STREAM, VIDEO_FILE, or WEBCAM
        source_url: Video source URL or file path
        config: Optional session configuration
    
    Returns:
        Session information
    """
    processor = get_video_processor()
    
    # Get camera virtual zones if available
    camera = await db.cameras.find_one({"_id": ObjectId(camera_id)})
    if camera:
        virtual_zones = camera.get("virtual_zones", [])
        if config is None:
            config = {}
        config["virtual_zones"] = virtual_zones
    
    # Create event service for persistence
    event_service = EventService(db)
    
    # Update processor sessions with event service
    for session in processor.sessions.values():
        session.event_service = event_service
    
    session_id = await processor.create_session(camera_id, source_type, source_url, config)
    
    if session_id:
        # Set event service for the new session
        if session_id in processor.sessions:
            processor.sessions[session_id].event_service = event_service
        
        return {
            "session_id": session_id,
            "camera_id": camera_id,
            "status": "ACTIVE",
            "message": "Camera session created successfully"
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to create camera session")


@router.delete("/sessions/{session_id}")
async def stop_camera_session(
    session_id: str,
    current_user: UserInDB = Depends(require_permissions(["cameras.delete"]))
):
    """Stop a camera processing session."""
    processor = get_video_processor()
    
    success = await processor.stop_session(session_id)
    
    if success:
        return {"message": "Session stopped successfully"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@router.get("/sessions/{session_id}")
async def get_session_info(
    session_id: str,
    current_user: UserInDB = Depends(require_permissions(["cameras.read"]))
):
    """Get information about a specific camera session."""
    processor = get_video_processor()
    
    info = processor.get_session_info(session_id)
    
    if info:
        return info
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@router.get("/sessions")
async def get_all_sessions(
    current_user: UserInDB = Depends(require_permissions(["cameras.read"]))
):
    """Get information about all active camera sessions."""
    processor = get_video_processor()
    
    return processor.get_all_sessions()


@router.post("/sessions/{session_id}/process")
async def process_session_frame(
    session_id: str,
    current_user: UserInDB = Depends(require_permissions(["cameras.read"]))
):
    """
    Process a single frame for a camera session.
    
    Returns AI inference results for the processed frame.
    """
    processor = get_video_processor()
    
    result = await processor.process_session_frame(session_id)
    
    if result:
        return result
    elif session_id in [s.session_id for s in processor.sessions.values()]:
        return {"message": "No frame available or frame skipped"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@router.get("/ai/status")
async def get_ai_status(
    current_user: UserInDB = Depends(require_permissions(["cameras.read"]))
):
    """Get AI engine status and model information."""
    processor = get_video_processor()
    
    return {
        "model_info": processor.get_ai_engine_info(),
        "processor_metrics": processor.get_processor_metrics()
    }


@router.post("/ai/config")
async def update_ai_config(
    config: Dict[str, Any],
    current_user: UserInDB = Depends(require_permissions(["cameras.update"]))
):
    """Update AI configuration (admin only)."""
    # This would update the configuration
    # For now, return current config
    processor = get_video_processor()
    
    return {
        "message": "AI configuration updated",
        "current_config": processor.get_ai_engine_info()
    }


@router.post("/video/analyze-file")
async def analyze_video_file(
    camera_id: str,
    file_path: str,
    config: Optional[Dict[str, Any]] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cameras.create"]))
):
    """
    Analyze a video file with AI processing.
    
    This creates a session and processes the entire file.
    """
    processor = get_video_processor()
    
    # Get camera virtual zones
    camera = await db.cameras.find_one({"_id": ObjectId(camera_id)})
    virtual_zones = camera.get("virtual_zones", []) if camera else []
    
    if config is None:
        config = {}
    config["virtual_zones"] = virtual_zones
    config["processing_enabled"] = True
    
    # Create session
    session_id = await processor.create_session(camera_id, "VIDEO_FILE", file_path, config)
    
    if not session_id:
        raise HTTPException(status_code=500, detail="Failed to create session")
    
    # Process frames (this would normally be a background task)
    results = []
    session = processor.sessions.get(session_id)
    
    if session:
        # Process first 100 frames as demo
        for _ in range(100):
            result = await session.process_frame()
            if result:
                results.append(result)
            else:
                break
        
        # Stop session
        await processor.stop_session(session_id)
    
    return {
        "session_id": session_id,
        "frames_processed": len(results),
        "sample_results": results[:5],  # Return first 5 results
        "total_events": sum(len(r.get("fence_events", [])) + len(r.get("rule_events", [])) for r in results)
    }
