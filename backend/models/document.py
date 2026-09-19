from typing import Dict, Any, List, Optional
from . import create_document_document, serialize_doc

def get_documents_collection():
    from config.database import get_collection
    return get_collection("documents")

def create_document(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_document_document(data)
    collection = get_documents_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_documents_by_case(case_id: str) -> List[Dict[str, Any]]:
    collection = get_documents_collection()
    return [serialize_doc(doc) for doc in collection.find({"caseId": case_id, "deletedAt": {"$exists": False}})]

def soft_delete_document(document_id: str) -> Optional[Dict[str, Any]]:
    collection = get_documents_collection()
    from datetime import datetime
    now = datetime.utcnow()
    result = collection.find_one_and_update(
        {"documentId": document_id},
        {"$set": {"deletedAt": now}},
        return_document=True
    )
    if not result:
        result = collection.find_one_and_update(
            {"_id": document_id},
            {"$set": {"deletedAt": now}},
            return_document=True
        )
    return serialize_doc(result) if result else None

def get_deleted_documents() -> List[Dict[str, Any]]:
    collection = get_documents_collection()
    return [serialize_doc(doc) for doc in collection.find({"deletedAt": {"$exists": True}}).sort("deletedAt", -1)]

def permanent_delete_document(document_id: str, user_role: str = None, auth_token: str = None) -> Dict[str, Any]:
    from services.deletion_service import permanent_delete_document as svc_permanent_delete_document
    return svc_permanent_delete_document(document_id, user_role, auth_token)
