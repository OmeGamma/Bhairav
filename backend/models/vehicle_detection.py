from typing import Dict, Any, List, Optional
from datetime import datetime
from . import serialize_doc

def get_vehicle_detections_collection():
    from config.database import get_collection
    return get_collection("vehicle_detections")

def create_vehicle_detection_document(data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "vehicleNumber": data.get("vehicleNumber"),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "locationName": data.get("locationName", ""),
        "timestamp": data.get("timestamp", datetime.utcnow().isoformat()),
        "sourceType": data.get("sourceType", "UNKNOWN"),
        "sourceId": data.get("sourceId", ""),
        "confidence": data.get("confidence", 0.0),
        "caseIds": data.get("caseIds", []),
        "evidenceId": data.get("evidenceId", None),
        "createdAt": datetime.utcnow().isoformat()
    }

def create_vehicle_detection(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_vehicle_detection_document(data)
    collection = get_vehicle_detections_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_detections_by_vehicle(vehicle_number: str) -> List[Dict[str, Any]]:
    collection = get_vehicle_detections_collection()
    docs = collection.find({"vehicleNumber": vehicle_number}).sort("timestamp", 1)
    return [serialize_doc(doc) for doc in docs]
