from typing import Dict, Any, List, Optional
from . import create_audit_log_document, serialize_doc

def get_audit_logs_collection():
    from config.database import get_collection
    return get_collection("auditLogs")

def create_audit_log(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_audit_log_document(data)
    collection = get_audit_logs_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_audit_logs(entity_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
    collection = get_audit_logs_collection()
    query = {}
    if entity_id:
        query["entityId"] = entity_id
    return [serialize_doc(doc) for doc in collection.find(query).sort("timestamp", -1).limit(limit)]
