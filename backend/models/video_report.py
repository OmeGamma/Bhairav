from . import create_video_report_document, serialize_doc
from typing import Optional, List, Dict, Any
from datetime import datetime

def get_video_reports_collection():
    from config.database import get_collection
    return get_collection("video_reports")

def create_video_report(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_video_report_document(data)
    collection = get_video_reports_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_all_video_reports(filters: Dict[str, Any] = None, sort_by: str = "createdAt", sort_order: int = -1, limit: int = 100) -> List[Dict[str, Any]]:
    collection = get_video_reports_collection()
    query = filters or {}
    cursor = collection.find(query).sort(sort_by, sort_order).limit(limit)
    return [serialize_doc(doc) for doc in cursor]

def get_video_report_by_id(report_id: str) -> Optional[Dict[str, Any]]:
    collection = get_video_reports_collection()
    doc = collection.find_one({"reportId": report_id})
    if not doc:
        doc = collection.find_one({"_id": report_id})
    return serialize_doc(doc) if doc else None

def get_video_reports_by_case(case_id: str) -> List[Dict[str, Any]]:
    collection = get_video_reports_collection()
    return [serialize_doc(doc) for doc in collection.find({"caseId": case_id}).sort("createdAt", -1)]

def update_video_report(report_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    collection = get_video_reports_collection()
    data["updatedAt"] = datetime.utcnow()
    result = collection.find_one_and_update(
        {"reportId": report_id},
        {"$set": data},
        return_document=True
    )
    if not result:
        result = collection.find_one_and_update(
            {"_id": report_id},
            {"$set": data},
            return_document=True
        )
    return serialize_doc(result) if result else None

def delete_video_report(report_id: str) -> bool:
    collection = get_video_reports_collection()
    result = collection.delete_one({"reportId": report_id})
    if result.deleted_count == 0:
        result = collection.delete_one({"_id": report_id})
    return result.deleted_count > 0

def get_video_report_stats(user_id: str = "Officer") -> Dict[str, Any]:
    collection = get_video_reports_collection()
    total = collection.count_documents({})
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = collection.count_documents({"createdAt": {"$gte": today_start}})
    camera_count = collection.count_documents({"sourceType": "CAMERA"})
    upload_count = collection.count_documents({"sourceType": "UPLOADED_VIDEO"})
    reviewed = collection.count_documents({"status": "REVIEWED"})
    unreviewed = collection.count_documents({"status": "NEW"})
    return {
        "total_events": total,
        "today_events": today_count,
        "camera_events": camera_count,
        "upload_events": upload_count,
        "reviewed": reviewed,
        "unreviewed": unreviewed,
    }

def create_collection_indexes():
    collection = get_video_reports_collection()
    indexes = [
        ("createdAt", -1),
        ("timestamp", -1),
        ("sourceType", 1),
        ("status", 1),
        ("caseId", 1),
        ("trackId", 1),
    ]
    for field, direction in indexes:
        try:
            collection.create_index([(field, direction)])
        except Exception:
            pass
    print("Video report indexes verified/created.")
