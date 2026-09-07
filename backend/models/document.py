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
    return [serialize_doc(doc) for doc in collection.find({"caseId": case_id})]
