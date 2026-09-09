import os
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
from models.video_report import create_video_report, get_video_reports_collection
from services.cloudinary_service import upload_image
from services.telegram_service import send_telegram_photo
from models.media_file import create_media_file

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
    full_frame_bytes: Optional[bytes],
    person_crop_bytes: Optional[bytes],
    case_id: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    if is_suppressed(track_id, source_type, source_name):
        mark_seen(track_id, source_type, source_name)
        return None

    mark_seen(track_id, source_type, source_name)

    # 1. Upload to Cloudinary & Create MediaFiles
    full_frame_file_id = None
    full_frame_url = None
    person_crop_file_id = None
    person_crop_url = None

    if full_frame_bytes:
        res = upload_image(full_frame_bytes, folder="bhairav/video-evidence")
        if res:
            doc = create_media_file({
                "originalName": f"full_frame_{timestamp}.jpg",
                "mimeType": "image/jpeg",
                "resourceType": "image",
                "cloudinaryPublicId": res.get("public_id"),
                "cloudinaryAssetId": res.get("asset_id"),
                "secureUrl": res.get("secure_url"),
                "format": res.get("format"),
                "bytes": res.get("bytes"),
                "folder": "bhairav/video-evidence",
                "caseId": case_id,
                "eventId": track_id,
                "dataClassification": "EVIDENCE"
            })
            full_frame_file_id = doc["fileId"]
            full_frame_url = doc["secureUrl"]

    if person_crop_bytes:
        res = upload_image(person_crop_bytes, folder="bhairav/video-evidence")
        if res:
            doc = create_media_file({
                "originalName": f"person_crop_{timestamp}.jpg",
                "mimeType": "image/jpeg",
                "resourceType": "image",
                "cloudinaryPublicId": res.get("public_id"),
                "cloudinaryAssetId": res.get("asset_id"),
                "secureUrl": res.get("secure_url"),
                "format": res.get("format"),
                "bytes": res.get("bytes"),
                "folder": "bhairav/video-evidence",
                "caseId": case_id,
                "eventId": track_id,
                "dataClassification": "EVIDENCE"
            })
            person_crop_file_id = doc["fileId"]
            person_crop_url = doc["secureUrl"]

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
        "fullFrameUrl": full_frame_url,
        "personCropUrl": person_crop_url,
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

    # Telegram Alert
    telegram_caption = (
        f"⚠️ <b>BHAIRAV VIDEO ALERT</b>\n\n"
        f"Person detected in live camera.\n\n"
        f"<b>Source:</b> {source_name}\n"
        f"<b>Confidence:</b> {int(confidence*100)}%\n"
        f"<b>Track ID:</b> {track_id}\n\n"
        f"Review required."
    )
    # Prefer person crop for telegram
    photo_bytes = person_crop_bytes if person_crop_bytes else full_frame_bytes
    if photo_bytes:
        send_telegram_photo(photo_bytes, telegram_caption)

    return report

