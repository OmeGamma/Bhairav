from typing import Dict, Any, List, Optional
from . import create_report_document, serialize_doc

def get_reports_collection():
    from config.database import get_collection
    return get_collection("reports")

def create_report(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_report_document(data)
    collection = get_reports_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_reports_by_case(case_id: str) -> List[Dict[str, Any]]:
    collection = get_reports_collection()
    return [serialize_doc(doc) for doc in collection.find({"caseId": case_id, "deletedAt": {"$exists": False}}).sort("generatedAt", -1)]

def get_all_reports() -> List[Dict[str, Any]]:
    collection = get_reports_collection()
    return [serialize_doc(doc) for doc in collection.find({"deletedAt": {"$exists": False}}).sort("generatedAt", -1)]

def soft_delete_report(report_id: str) -> Optional[Dict[str, Any]]:
    collection = get_reports_collection()
    from datetime import datetime
    now = datetime.utcnow()
    result = collection.find_one_and_update(
        {"reportId": report_id},
        {"$set": {"deletedAt": now}},
        return_document=True
    )
    if not result:
        result = collection.find_one_and_update(
            {"_id": report_id},
            {"$set": {"deletedAt": now}},
            return_document=True
        )
    return serialize_doc(result) if result else None

def get_deleted_reports() -> List[Dict[str, Any]]:
    collection = get_reports_collection()
    return [serialize_doc(doc) for doc in collection.find({"deletedAt": {"$exists": True}}).sort("deletedAt", -1)]

def permanent_delete_report(report_id: str, user_role: str = None, auth_token: str = None) -> Dict[str, Any]:
    from services.deletion_service import permanent_delete_report as svc_permanent_delete_report
    return svc_permanent_delete_report(report_id, user_role, auth_token)
