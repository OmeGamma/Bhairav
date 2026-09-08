from datetime import datetime
from typing import Optional, List, Dict, Any
from models.video_report import (
    create_video_report,
    get_all_video_reports,
    get_video_report_by_id,
    get_video_reports_by_case,
    update_video_report,
    delete_video_report,
    get_video_report_stats,
)
from models.notification import create_notification

def create_video_report_event(
    event_type: str = "PERSON_DETECTED",
    source_type: str = "CAMERA",
    source_name: str = "Laptop Camera",
    confidence: float = 0.0,
    bounding_box: Dict[str, int] = None,
    track_id: Optional[int] = None,
    frame_number: Optional[int] = None,
    timestamp: str = None,
    video_timestamp: str = None,
    full_frame_file_id: Optional[str] = None,
    person_crop_file_id: Optional[str] = None,
    case_id: Optional[str] = None,
    data_classification: str = "LIVE_VIDEO_EVENT",
) -> Dict[str, Any]:
    now = datetime.utcnow()
    report = create_video_report({
        "eventType": event_type,
        "sourceType": source_type,
        "sourceName": source_name,
        "sourceFileId": None,
        "videoFileId": None,
        "caseId": case_id,
        "timestamp": timestamp or now.isoformat(),
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
        "dataClassification": data_classification,
    })
    return report

def query_video_reports(
    filters: Dict[str, Any] = None,
    sort_by: str = "createdAt",
    sort_order: int = -1,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    return get_all_video_reports(filters=filters, sort_by=sort_by, sort_order=sort_order, limit=limit)

def get_video_report(report_id: str) -> Optional[Dict[str, Any]]:
    return get_video_report_by_id(report_id)

def get_reports_by_case(case_id: str) -> List[Dict[str, Any]]:
    return get_video_reports_by_case(case_id)

def update_report(report_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    return update_video_report(report_id, data)

def delete_report(report_id: str) -> bool:
    return delete_video_report(report_id)

def get_stats(user_id: str = "Officer") -> Dict[str, Any]:
    return get_video_report_stats(user_id)

def link_report_to_case(report_id: str, case_id: str) -> Optional[Dict[str, Any]]:
    updated = update_video_report(report_id, {"caseId": case_id})
    if updated:
        create_notification({
            "type": "VIDEO_REPORT_LINKED",
            "title": "Video Report Linked",
            "message": f"Video report {report_id} linked to case {case_id}.",
            "caseId": case_id,
            "userId": "Officer",
        })
    return updated
