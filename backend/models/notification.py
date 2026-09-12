from . import create_notification_document, serialize_doc
from typing import Optional, List, Dict, Any

def get_notifications_collection():
    from config.database import get_collection
    return get_collection("notifications")

def create_notification(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_notification_document(data)
    collection = get_notifications_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_all_notifications(user_id: str = "Officer") -> List[Dict[str, Any]]:
    collection = get_notifications_collection()
    return [serialize_doc(doc) for doc in collection.find({"userId": user_id}).sort("createdAt", -1)]

def mark_notification_read(notification_id: str) -> Optional[Dict[str, Any]]:
    collection = get_notifications_collection()
    result = collection.find_one_and_update(
        {"notificationId": notification_id},
        {"$set": {"isRead": True}},
        return_document=True
    )
    return serialize_doc(result) if result else None

def mark_all_notifications_read(user_id: str = "Officer") -> int:
    collection = get_notifications_collection()
    result = collection.update_many({"userId": user_id, "isRead": False}, {"$set": {"isRead": True}})
    return result.modified_count

def delete_notifications_by_case(case_id: str) -> int:
    collection = get_notifications_collection()
    result = collection.delete_many({"caseId": case_id})
    return result.deleted_count
