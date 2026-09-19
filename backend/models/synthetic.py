from typing import Optional, List, Dict, Any
from datetime import datetime

def get_collection_safe(collection_name: str):
    from config.database import get_collection
    return get_collection(collection_name)

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# --- Synthetic Identity ---

def create_synthetic_identity_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "identityId": data.get("identityId", f"ID-{int(now.timestamp())}"),
        "syntheticAadhaarId": data.get("syntheticAadhaarId", "DEMO-AADHAAR-000000"),
        "maskedAadhaar": data.get("maskedAadhaar", "XXXX-XXXX-0000"),
        "name": data.get("name", "Demo Person"),
        "dateOfBirth": data.get("dateOfBirth", "01/01/1990"),
        "gender": data.get("gender", "M"),
        "address": data.get("address", "Demo Address"),
        "city": data.get("city", "Demo City"),
        "state": data.get("state", "Demo State"),
        "photoUrl": data.get("photoUrl", ""),
        "caseIds": data.get("caseIds", []),
        "criminalCaseStatus": data.get("criminalCaseStatus", "CASE-ASSOCIATED"),
        "riskStatus": data.get("riskStatus", "MEDIUM"),
        "simIds": data.get("simIds", []),
        "bankAccountIds": data.get("bankAccountIds", []),
        "towerEvents": data.get("towerEvents", []),
        "digilockerAuth": data.get("digilockerAuth", True),
        "createdAt": data.get("createdAt", now),
        "updatedAt": now,
        "dataClassification": "DEMO_SYNTHETIC"
    }

def create_synthetic_identity(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_synthetic_identity_document(data)
    collection = get_collection_safe("synthetic_identities")
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return serialize_doc(doc)

def get_synthetic_identities(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    collection = get_collection_safe("synthetic_identities")
    return [serialize_doc(doc) for doc in collection.find(filters or {})]

def get_synthetic_identity_by_id(identity_id: str) -> Optional[Dict[str, Any]]:
    collection = get_collection_safe("synthetic_identities")
    doc = collection.find_one({"identityId": identity_id})
    return serialize_doc(doc) if doc else None

def get_synthetic_identity_by_aadhaar(aadhaar: str) -> Optional[Dict[str, Any]]:
    collection = get_collection_safe("synthetic_identities")
    doc = collection.find_one({"syntheticAadhaarId": aadhaar})
    return serialize_doc(doc) if doc else None

def search_synthetic_identities(query: str) -> List[Dict[str, Any]]:
    collection = get_collection_safe("synthetic_identities")
    regex = {"$regex": query, "$options": "i"}
    return [serialize_doc(doc) for doc in collection.find({
        "$or": [
            {"name": regex},
            {"identityId": regex},
            {"syntheticAadhaarId": regex},
            {"caseIds": regex}
        ]
    })]


# --- Synthetic SIM ---

def create_synthetic_sim_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "simId": data.get("simId", f"SIM-{int(now.timestamp())}"),
        "maskedPhoneNumber": data.get("maskedPhoneNumber", "+91 XXXXX XXXXX"),
        "operator": data.get("operator", "Demo Telecom"),
        "activationDate": data.get("activationDate", "01/01/2020"),
        "syntheticAadhaarId": data.get("syntheticAadhaarId", ""),
        "status": data.get("status", "ACTIVE"),
        "caseLinked": data.get("caseLinked", False),
        "createdAt": data.get("createdAt", now),
        "dataClassification": "DEMO_SYNTHETIC"
    }

def create_synthetic_sim(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_synthetic_sim_document(data)
    collection = get_collection_safe("synthetic_sims")
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return serialize_doc(doc)

def get_synthetic_sims_by_aadhaar(aadhaar: str) -> List[Dict[str, Any]]:
    collection = get_collection_safe("synthetic_sims")
    return [serialize_doc(doc) for doc in collection.find({"syntheticAadhaarId": aadhaar})]

def update_synthetic_sim_status(sim_id: str, status: str) -> Optional[Dict[str, Any]]:
    collection = get_collection_safe("synthetic_sims")
    collection.update_one({"simId": sim_id}, {"$set": {"status": status}})
    doc = collection.find_one({"simId": sim_id})
    return serialize_doc(doc) if doc else None


# --- Synthetic Bank Account ---

def create_synthetic_bank_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "bankAccountId": data.get("bankAccountId", f"BANK-{int(now.timestamp())}"),
        "maskedAccountNumber": data.get("maskedAccountNumber", "XXXX XXXX 0000"),
        "bankName": data.get("bankName", "Demo Bank"),
        "syntheticAadhaarId": data.get("syntheticAadhaarId", ""),
        "accountType": data.get("accountType", "SAVINGS"),
        "status": data.get("status", "ACTIVE"),
        "balance": data.get("balance", "₹0"),
        "linkedCases": data.get("linkedCases", []),
        "createdAt": data.get("createdAt", now),
        "dataClassification": "DEMO_SYNTHETIC"
    }

def create_synthetic_bank_account(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_synthetic_bank_document(data)
    collection = get_collection_safe("synthetic_banks")
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return serialize_doc(doc)

def get_synthetic_banks_by_aadhaar(aadhaar: str) -> List[Dict[str, Any]]:
    collection = get_collection_safe("synthetic_banks")
    return [serialize_doc(doc) for doc in collection.find({"syntheticAadhaarId": aadhaar})]

def update_synthetic_bank_status(bank_account_id: str, status: str) -> Optional[Dict[str, Any]]:
    collection = get_collection_safe("synthetic_banks")
    collection.update_one({"bankAccountId": bank_account_id}, {"$set": {"status": status}})
    doc = collection.find_one({"bankAccountId": bank_account_id})
    return serialize_doc(doc) if doc else None


# --- Synthetic Tower Events ---

def create_synthetic_tower_event_document(data: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.utcnow()
    return {
        "eventId": data.get("eventId", f"TWR-EVT-{int(now.timestamp())}"),
        "identityId": data.get("identityId", ""),
        "towerId": data.get("towerId", ""),
        "towerName": data.get("towerName", "Demo Tower"),
        "timestamp": data.get("timestamp", now.isoformat()),
        "latitude": data.get("latitude", 0.0),
        "longitude": data.get("longitude", 0.0),
        "syntheticAccuracy": data.get("syntheticAccuracy", 10.0),
        "source": data.get("source", "Synthetic Telecom Dataset"),
        "dataClassification": "DEMO_SYNTHETIC"
    }

def create_synthetic_tower_event(data: Dict[str, Any]) -> Dict[str, Any]:
    doc = create_synthetic_tower_event_document(data)
    collection = get_collection_safe("synthetic_tower_events")
    result = collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return serialize_doc(doc)

def get_synthetic_tower_events_by_identity(identity_id: str) -> List[Dict[str, Any]]:
    collection = get_collection_safe("synthetic_tower_events")
    # Sort by timestamp ascending
    return [serialize_doc(doc) for doc in collection.find({"identityId": identity_id}).sort("timestamp", 1)]

# Delete operation
def delete_all_synthetic_data():
    """Resets all the collections that are DEMO_SYNTHETIC."""
    get_collection_safe("synthetic_identities").delete_many({"dataClassification": "DEMO_SYNTHETIC"})
    get_collection_safe("synthetic_sims").delete_many({"dataClassification": "DEMO_SYNTHETIC"})
    get_collection_safe("synthetic_banks").delete_many({"dataClassification": "DEMO_SYNTHETIC"})
    get_collection_safe("synthetic_tower_events").delete_many({"dataClassification": "DEMO_SYNTHETIC"})

def delete_synthetic_identity(identity_id: str):
    """Deletes a specific synthetic identity and its associated records."""
    identity = get_synthetic_identity_by_id(identity_id)
    if not identity:
        return False
        
    aadhaar = identity.get("syntheticAadhaarId", "")
    
    get_collection_safe("synthetic_identities").delete_one({"identityId": identity_id})
    if aadhaar:
        get_collection_safe("synthetic_sims").delete_many({"syntheticAadhaarId": aadhaar})
        get_collection_safe("synthetic_banks").delete_many({"syntheticAadhaarId": aadhaar})
        
    get_collection_safe("synthetic_tower_events").delete_many({"identityId": identity_id})
    return True
