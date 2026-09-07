from typing import Dict, Any, List, Optional
from . import create_vehicle_document, serialize_doc

def get_vehicles_collection():
    from config.database import get_collection
    return get_collection("vehicles")

def create_vehicle(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_vehicle_document(data)
    collection = get_vehicles_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_vehicles_by_case(case_id: str) -> List[Dict[str, Any]]:
    collection = get_vehicles_collection()
    return [serialize_doc(doc) for doc in collection.find({"caseId": case_id})]
