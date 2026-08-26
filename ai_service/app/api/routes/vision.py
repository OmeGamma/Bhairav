from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime
from app.models.schemas import VideoAnalyzeResponse, Detection, BBox, VideoEvent
from app.core.config import settings
import uuid

router = APIRouter()

@router.post("/video/analyze", response_model=VideoAnalyzeResponse)
async def analyze_video(payload: Dict[str, Any]):
    """
    Mock AI Service for Video / CCTV Analysis.
    Returns structured synthetic intelligence data.
    """
    camera_id = payload.get("camera_id", "CAM-DEMO")
    
    # Generate synthetic response
    response = VideoAnalyzeResponse(
        camera_id=camera_id,
        timestamp=datetime.utcnow().isoformat(),
        detections=[
            Detection(
                type="person",
                confidence=0.92,
                bbox=BBox(x1=100.5, y1=150.0, x2=200.0, y2=450.5),
                track_id=str(uuid.uuid4())[:8]
            )
        ],
        event=VideoEvent(
            type="restricted_zone_entry",
            severity="HIGH"
        ),
        model_info={
            "model": settings.vision_model,
            "version": "1.0",
            "processing_mode": "synthetic"
        }
    )
    return response

@router.post("/video/frame")
async def analyze_frame(payload: Dict[str, Any]):
    """
    Endpoint for individual frame analysis (e.g. from local video stream).
    """
    return {"status": "Frame processed", "mock": True}
