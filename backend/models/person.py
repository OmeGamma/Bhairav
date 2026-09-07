from . import create_person_document, serialize_doc
from typing import Optional, List, Dict, Any

def get_persons_collection():
    from config.database import get_collection
    return get_collection("persons")

def create_person(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_person_document(data)
    collection = get_persons_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_persons_by_case(case_id: str) -> List[Dict[str, Any]]:
    collection = get_persons_collection()
    return [serialize_doc(doc) for doc in collection.find({"caseId": case_id})]

def search_persons(query: str) -> List[Dict[str, Any]]:
    collection = get_persons_collection()
    regex = {"$regex": query, "$options": "i"}
    return [serialize_doc(doc) for doc in collection.find({"name": regex})]
