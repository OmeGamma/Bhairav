import os
import time
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from models.video_report import create_video_report, get_video_reports_collection
from services.cloudinary_service import upload_image
from services.telegram_service import send_telegram_photo
from models.media_file import create_media_file

logger = logging.getLogger(__name__)

# State machine for deduplication based on person count
# Key: f"{source_type}:{source_name}"
# Value: {"count": int, "last_alert_time": float}
_alert_state: Dict[str, Dict[str, Any]] = {}

def get_cooldown_seconds():
    return float(os.getenv("VIDEO_ALERT_COOLDOWN_SECONDS", "10"))

def should_alert(source_type: str, source_name: str, current_count: int) -> bool:
    key = f"{source_type}:{source_name}"
    state = _alert_state.get(key)
    now = time.time()
    
    if current_count == 0:
        if state is not None and state["count"] > 0:
            _alert_state[key] = {"count": 0, "last_alert_time": now}
        return False
    
    if state is None:
        _alert_state[key] = {"count": current_count, "last_alert_time": now}
        return True
        
    previous_count = state["count"]
    last_alert = state["last_alert_time"]
    cooldown = get_cooldown_seconds()
    
    # Always enforce the cooldown strictly, regardless of count change
    if (now - last_alert) >= cooldown:
        _alert_state[key] = {"count": current_count, "last_alert_time": now}
        return True
        
    return False

def clear_stale_entries(max_age_seconds: float = 3600):
    now = time.time()
    stale_keys = [k for k, v in _alert_state.items() if (now - v.get("last_alert_time", 0)) > max_age_seconds]
    for k in stale_keys:
        del _alert_state[k]

def create_person_detection_alert(
    source_type: str,
    source_name: str,
    person_count: int,
    track_ids: List[int],
    confidence: float,
    bounding_box: Dict[str, int],
    frame_number: Optional[int],
    timestamp: str,
    video_timestamp: str,
    full_frame_bytes: Optional[bytes],
    person_crop_bytes: Optional[bytes],
    case_id: Optional[str] = None,
    class_name: str = "person",
    candidate_match: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    
    if not should_alert(source_type, source_name, person_count):
        return None

    logger.info(f"[Video Event] Count changed or cooldown expired. Persons detected: {person_count}")

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
                "dataClassification": "EVIDENCE"
            })
            full_frame_file_id = doc["fileId"]
            full_frame_url = doc["secureUrl"]
            logger.info(f"[Cloudinary] Full frame uploaded. Public ID: {res.get('public_id')}")
        else:
            logger.error("[Cloudinary] Full frame upload failed.")

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
                "dataClassification": "EVIDENCE"
            })
            person_crop_file_id = doc["fileId"]
            person_crop_url = doc["secureUrl"]
            logger.info(f"[Cloudinary] Person crop uploaded. Public ID: {res.get('public_id')}")
        else:
            logger.error("[Cloudinary] Person crop upload failed.")

    from models.notification import create_notification

    event_type = "PERSON_DETECTED"
    title = f"{person_count} PERSON{'S' if person_count > 1 else ''} DETECTED"
    message = f"{person_count} person{'s' if person_count > 1 else ''} detected in the camera. Check Video Intelligence."

    report = create_video_report({
        "eventType": event_type,
        "sourceType": source_type,
        "sourceName": source_name,
        "sourceFileId": None,
        "videoFileId": None,
        "caseId": case_id,
        "timestamp": timestamp,
        "frameNumber": frame_number,
        "trackId": track_ids[0] if track_ids else None,
        "humanCount": person_count,
        "confidence": round(confidence, 4),
        "className": class_name,
        "boundingBox": bounding_box or {},
        "fullFrameFileId": full_frame_file_id,
        "personCropFileId": person_crop_file_id,
        "fullFrameUrl": full_frame_url,
        "personCropUrl": person_crop_url,
        "videoTimestamp": video_timestamp,
        "status": "NEW",
        "dataClassification": "LIVE_VIDEO_EVENT",
        "candidateMatch": candidate_match,
    })

    create_notification({
        "type": event_type,
        "title": title,
        "message": message,
        "caseId": case_id,
        "userId": "Officer",
    })

    track_id_str = ", ".join([str(t) for t in track_ids if t is not None]) if track_ids else 'Unknown'
    
    if candidate_match:
        telegram_caption = (
            f"🚨 SYNTHETIC MATCH DETECTED 🚨\n"
            f"Camera: {source_name}\n"
            f"Matched Target: {candidate_match['name']}\n"
            f"Confidence: {candidate_match['confidence']}%\n"
            f"Associated Case: {case_id or 'Unknown'}\n"
            f"Time: {timestamp}\n"
            f"Location: {candidate_match.get('city', 'Unknown')}, {candidate_match.get('state', 'Unknown')}"
        )
    else:
        telegram_caption = (
            f"🚨 <b>BHAIRAV VIDEO INTELLIGENCE ALERT</b>\n\n"
            f"<b>Alert:</b> {person_count} PERSON{'S' if person_count > 1 else ''} DETECTED\n"
            f"<b>Source:</b> {source_name}\n"
            f"<b>Time:</b> {timestamp}\n"
            f"<b>Confidence:</b> {int(confidence*100)}%\n"
            f"<b>Track IDs:</b> {track_id_str}\n"
            f"<b>Status:</b> REVIEW REQUIRED\n\n"
            f"Evidence has been captured and stored."
        )
    
    photo_url = person_crop_url if person_crop_url else full_frame_url
    if photo_url:
        logger.info(f"[Telegram] Sending photo via URL: {photo_url}")
        sent = send_telegram_photo(photo_url, telegram_caption)
        logger.info(f"[Telegram] sendPhoto result: {sent}")
    else:
        photo_bytes = person_crop_bytes if person_crop_bytes else full_frame_bytes
        if photo_bytes:
            logger.info("[Telegram] Sending photo via bytes.")
            sent = send_telegram_photo(photo_bytes, telegram_caption)
            logger.info(f"[Telegram] sendPhoto result: {sent}")
        else:
            logger.warning("[Telegram] No photo available to send.")

    return report
