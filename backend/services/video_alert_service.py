import os
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
from models.video_report import create_video_report, get_video_reports_collection

_cooldown_registry: Dict[str, float] = {}

def get_cooldown_seconds():
    return float(os.getenv("VIDEO_ALERT_COOLDOWN_SECONDS", "10"))

def _get_cooldown_key(track_id: Optional[int], source_type: str, source_name: str):
    if track_id is not None:
        return f"{source_type}:{source_name}:track:{track_id}"
    return f"{source_type}:{source_name}:generic"

def is_suppressed(track_id: Optional[int], source_type: str, source_name: str) -> bool:
    key = _get_cooldown_key(track_id, source_type, source_name)
    cooldown = get_cooldown_seconds()
    now = time.time()
    last_seen = _cooldown_registry.get(key)
    if last_seen is not None and (now - last_seen) < cooldown:
        return True
    return False

def mark_seen(track_id: Optional[int], source_type: str, source_name: str):
    key = _get_cooldown_key(track_id, source_type, source_name)
    _cooldown_registry[key] = time.time()

def clear_stale_entries(max_age_seconds: float = 3600):
    now = time.time()
    stale_keys = [k for k, v in _cooldown_registry.items() if (now - v) > max_age_seconds]
    for k in stale_keys:
        del _cooldown_registry[k]

def create_person_detection_alert(
    source_type: str,
    source_name: str,
    confidence: float,
    bounding_box: Dict[str, int],
    track_id: Optional[int],
    frame_number: Optional[int],
    timestamp: str,
    video_timestamp: str,
    full_frame_file_id: Optional[str],
    person_crop_file_id: Optional[str],
    case_id: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    if is_suppressed(track_id, source_type, source_name):
        mark_seen(track_id, source_type, source_name)
        return None

    mark_seen(track_id, source_type, source_name)

    from models.notification import create_notification

    report = create_video_report({
        "eventType": "PERSON_DETECTED",
        "sourceType": source_type,
        "sourceName": source_name,
        "sourceFileId": None,
        "videoFileId": None,
        "caseId": case_id,
        "timestamp": timestamp,
        "frameNumber": frame_number,
        "trackId": track_id,
        "confidence": round(confidence, 4),
        "className": "person",
        "boundingBox": bounding_box or {},
        "fullFrameFileId": full_frame_file_id,
        "personCropFileId": person_crop_file_id,
        "fullFrameUrl": f"/api/video-files/evidence/{full_frame_file_id}" if full_frame_file_id else None,
        "personCropUrl": f"/api/video-files/evidence/{person_crop_file_id}" if person_crop_file_id else None,
        "videoTimestamp": video_timestamp,
        "status": "NEW",
        "dataClassification": "LIVE_VIDEO_EVENT",
    })

    create_notification({
        "type": "PERSON_DETECTED",
        "title": "PERSON DETECTED",
        "message": "Someone is visible in the camera. Check Video Intelligence.",
        "caseId": case_id,
        "userId": "Officer",
    })

    return report
