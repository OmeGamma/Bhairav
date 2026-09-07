from . import create_case_document, serialize_doc
from typing import Optional, List, Dict, Any
from datetime import datetime

def get_cases_collection():
    from config.database import get_collection
    return get_collection("cases")

def build_case_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "caseNumber": data.get("caseNumber"),
        "firNumber": data.get("firNumber"),
        "title": data.get("title", ""),
        "crimeType": data.get("crimeType", ""),
        "status": data.get("status", "OPEN"),
        "priority": data.get("priority", "MEDIUM"),
        "filingDate": data.get("filingDate", now.isoformat()),
        "filingTime": data.get("filingTime", now.isoformat()),
        "date": data.get("date", now.isoformat()),
        "place": data.get("place", ""),
        "address": data.get("address", ""),
        "city": data.get("city") or (data.get("location") or {}).get("city", ""),
        "district": data.get("district") or (data.get("location") or {}).get("district", ""),
        "state": data.get("state") or (data.get("location") or {}).get("state", ""),
        "country": data.get("country", "India"),
        "policeStation": data.get("policeStation", ""),
        "latitude": data.get("latitude") or (data.get("location") or {}).get("latitude"),
        "longitude": data.get("longitude") or (data.get("location") or {}).get("longitude"),
        "suspect": data.get("suspect", ""),
        "accused": data.get("accused", []),
        "victim": data.get("victim", []),
        "gender": data.get("gender", ""),
        "age": data.get("age"),
        "description": data.get("description", ""),
        "incidentDetails": data.get("incidentDetails", ""),
        "modusOperandi": data.get("modusOperandi", ""),
        "notes": data.get("notes", ""),
        "investigatingOfficer": data.get("investigatingOfficer", "Unassigned"),
        "evidenceIds": data.get("evidenceIds", []),
        "documentIds": data.get("documentIds", []),
        "videoIds": data.get("videoIds", []),
        "tags": data.get("tags", []),
        "location": data.get("location"),
        "suspects": data.get("suspects", []),
        "persons": data.get("persons", []),
        "victims": data.get("victims", []),
        "evidences": data.get("evidences", []),
        "documents": data.get("documents", []),
        "videos": data.get("videos", []),
        "vehicles": data.get("vehicles", []),
        "organizations": data.get("organizations", []),
        "firs": data.get("firs", []),
        "ai_summary": data.get("ai_summary"),
        "createdAt": now,
        "updatedAt": now,
        "closedAt": None,
        "createdBy": data.get("createdBy", "Officer"),
        "updatedBy": data.get("updatedBy", "Officer"),
        "dataClassification": data.get("dataClassification", "DEMO_SYNTHETIC"),
    }

def create_case(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = build_case_document(data)
    collection = get_cases_collection()
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

def get_all_cases() -> List[Dict[str, Any]]:
    collection = get_cases_collection()
    return [serialize_doc(doc) for doc in collection.find().sort("createdAt", -1)]

def get_case_by_id(case_number: str) -> Optional[Dict[str, Any]]:
    collection = get_cases_collection()
    doc = collection.find_one({"caseNumber": case_number})
    return serialize_doc(doc) if doc else None

def update_case(case_number: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    collection = get_cases_collection()
    data["updatedAt"] = datetime.utcnow()
    result = collection.find_one_and_update(
        {"caseNumber": case_number},
        {"$set": data},
        return_document=True
    )
    return serialize_doc(result) if result else None

def close_case(case_number: str) -> Optional[Dict[str, Any]]:
    collection = get_cases_collection()
    now = datetime.utcnow().isoformat()
    result = collection.find_one_and_update(
        {"caseNumber": case_number},
        {"$set": {"status": "CLOSED", "closedAt": now, "updatedAt": now}},
        return_document=True
    )
    return serialize_doc(result) if result else None

def search_cases(query: str) -> List[Dict[str, Any]]:
    collection = get_cases_collection()
    regex = {"$regex": query, "$options": "i"}
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"caseNumber": regex},
                    {"firNumber": regex},
                    {"title": regex},
                    {"crimeType": regex},
                    {"description": regex},
                    {"city": regex},
                    {"district": regex},
                    {"state": regex},
                    {"country": regex},
                    {"place": regex},
                    {"address": regex},
                    {"policeStation": regex},
                    {"suspect": regex},
                    {"victim": regex},
                    {"tags": regex},
                ]
            }
        }
    ]
    return [serialize_doc(doc) for doc in collection.aggregate(pipeline)]

def get_cases_by_city() -> List[Dict[str, Any]]:
    collection = get_cases_collection()
    pipeline = [
        {"$group": {"_id": "$city", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    return [{"city": doc["_id"] or "Unknown", "count": doc["count"]} for doc in collection.aggregate(pipeline)]

def get_cases_by_crime_type() -> List[Dict[str, Any]]:
    collection = get_cases_collection()
    pipeline = [
        {"$group": {"_id": "$crimeType", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    return [{"crime_type": doc["_id"], "count": doc["count"]} for doc in collection.aggregate(pipeline)]

def get_cases_by_status() -> List[Dict[str, Any]]:
    collection = get_cases_collection()
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    return [{"status": doc["_id"], "count": doc["count"]} for doc in collection.aggregate(pipeline)]

def get_cases_by_priority() -> List[Dict[str, Any]]:
    collection = get_cases_collection()
    pipeline = [
        {"$group": {"_id": "$priority", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    return [{"priority": doc["_id"], "count": doc["count"]} for doc in collection.aggregate(pipeline)]

def get_monthly_trends() -> List[Dict[str, Any]]:
    collection = get_cases_collection()
    pipeline = [
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m", "date": "$createdAt"}},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    return [{"month": doc["_id"], "count": doc["count"]} for doc in collection.aggregate(pipeline)]
