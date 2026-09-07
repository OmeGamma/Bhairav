from typing import Dict, Any, List, Optional
from . import create_evidence_document, serialize_doc

def get_evidence_collection():
    from config.database import get_collection
    return get_collection("evidence")

def create_evidence(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_evidence_document(data)
    collection = get_evidence_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_evidence_by_case(case_id: str) -> List[Dict[str, Any]]:
    collection = get_evidence_collection()
    return [serialize_doc(doc) for doc in collection.find({"caseId": case_id})]
