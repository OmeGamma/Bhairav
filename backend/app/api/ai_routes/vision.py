from fastapi import APIRouter
from typing import Dict, Any
from app.schemas.ai_schemas import VideoAnalyzeResponse
from app.services.video_engine import analyze_video_payload

router = APIRouter()


@router.post("/video/analyze", response_model=VideoAnalyzeResponse)
async def analyze_video(payload: Dict[str, Any]):
    """
    BHAIRAV Video Intelligence Engine (real OpenCV).

    Runs Canny edge detection, color histogram analysis, and HOG person
    detection on a deterministic synthetic frame. See app.services.video_engine
    for details. Frame is synthetic so results are reproducible.
    """
    return analyze_video_payload(payload)


@router.post("/video/frame")
async def analyze_frame(payload: Dict[str, Any]):
    """
    Single-frame analysis - delegates to the same engine.
    """
    payload.setdefault("frame_index", payload.get("frame_number", 0))
    result = analyze_video_payload(payload)
    return {
        "status": "Frame processed",
        "camera_id": result.camera_id,
        "severity": result.event.severity if result.event else "INFO",
        "event_type": result.event.type if result.event else "scene_normal",
        "detections": [d.model_dump() for d in result.detections],
        "model_info": result.model_info,
    }
