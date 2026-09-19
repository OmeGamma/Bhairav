import datetime
from typing import Dict, Any
from models.synthetic import (
    create_synthetic_identity,
    create_synthetic_sim,
    create_synthetic_bank_account,
    create_synthetic_tower_event,
    delete_all_synthetic_data
)
from models.case import create_case
from models.audit_log import create_audit_log

def generate_demo_dataset() -> Dict[str, Any]:
    """
    Clears old synthetic data and seeds deterministic demo data as per the SIH scenario.
    """
    delete_all_synthetic_data()
    now_iso = datetime.datetime.utcnow().isoformat()
    
    # 1. Create a synthetic case for the demo
    case_data = {
        "caseNumber": "BRH-DEMO-001",
        "title": "Synthetic AI Intelligence Scenario",
        "description": "Demo scenario for SIH Presentation",
        "status": "OPEN",
        "dataClassification": "DEMO_SYNTHETIC"
    }
    case_result = create_case(case_data)
    case_id = str(case_result.get("_id", "mock_case_id"))

    # 2. Create the primary Demo Person A
    demo_identity = {
        "identityId": "ID-DEMO-001",
        "syntheticAadhaarId": "DEMO-AADHAAR-000001",
        "maskedAadhaar": "XXXX-XXXX-0001",
        "name": "Demo Person A",
        "dateOfBirth": "01/01/1995",
        "gender": "M",
        "address": "123 Synthetic Lane",
        "city": "Mumbai",
        "state": "Maharashtra",
        "photoUrl": "https://res.cloudinary.com/dsfmygafj/image/upload/v1700000000/demo-person.jpg",
        "caseIds": [case_id],
        "criminalCaseStatus": "CASE-ASSOCIATED"
    }
    identity_result = create_synthetic_identity(demo_identity)
    identity_db_id = str(identity_result.get("_id"))
    
    # Generate 9 other random identities
    for i in range(2, 11):
        create_synthetic_identity({
            "identityId": f"ID-DEMO-{i:03d}",
            "syntheticAadhaarId": f"DEMO-AADHAAR-{i:06d}",
            "maskedAadhaar": f"XXXX-XXXX-{i:04d}",
            "name": f"Demo Person {chr(65+i)}",
            "dateOfBirth": f"0{i%9+1}/0{i%9+1}/199{i%10}",
            "gender": "M" if i%2==0 else "F",
            "address": "Synthetic Ave",
            "city": "Delhi",
            "state": "Delhi",
            "caseIds": [],
            "criminalCaseStatus": "NONE"
        })

    # 3. Create 3 synthetic SIMs for Demo Person A
    sims = [
        {"simId": "SIM-001", "maskedPhoneNumber": "+91 XXXXX 1023", "operator": "Demo Telecom", "status": "ACTIVE"},
        {"simId": "SIM-002", "maskedPhoneNumber": "+91 XXXXX 7741", "operator": "Demo Telecom", "status": "ACTIVE"},
        {"simId": "SIM-003", "maskedPhoneNumber": "+91 XXXXX 8820", "operator": "Demo Telecom", "status": "SUSPENDED"},
    ]
    for sim in sims:
        sim["syntheticAadhaarId"] = "DEMO-AADHAAR-000001"
        sim["caseLinked"] = True
        create_synthetic_sim(sim)
        
    # Generate random SIMs for others
    for i in range(4, 21):
        create_synthetic_sim({
            "simId": f"SIM-{i:03d}",
            "maskedPhoneNumber": f"+91 XXXXX 10{i:02d}",
            "operator": "Demo Telecom",
            "syntheticAadhaarId": f"DEMO-AADHAAR-{i%10+1:06d}",
            "status": "ACTIVE"
        })

    # 4. Create 2 synthetic Bank accounts for Demo Person A
    banks = [
        {"bankAccountId": "BANK-001", "maskedAccountNumber": "XXXX XXXX 4821", "bankName": "Demo Bank", "status": "ACTIVE"},
        {"bankAccountId": "BANK-002", "maskedAccountNumber": "XXXX XXXX 9932", "bankName": "Demo Bank", "status": "ACTIVE"},
    ]
    for bank in banks:
        bank["syntheticAadhaarId"] = "DEMO-AADHAAR-000001"
        bank["linkedCases"] = [case_id]
        create_synthetic_bank_account(bank)

    # Generate random banks for others
    for i in range(3, 16):
        create_synthetic_bank_account({
            "bankAccountId": f"BANK-{i:03d}",
            "maskedAccountNumber": f"XXXX XXXX {1000+i}",
            "bankName": "Demo Bank",
            "syntheticAadhaarId": f"DEMO-AADHAAR-{i%10+1:06d}",
            "status": "ACTIVE"
        })

    # 5. Create synthetic Tower Events for Demo Person A
    import datetime
    today = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    events = [
        {"time": "10:15", "towerName": "Tower A", "lat": 19.0760, "lng": 72.8777},
        {"time": "10:47", "towerName": "Tower B", "lat": 19.0800, "lng": 72.8800},
        {"time": "11:21", "towerName": "Tower C", "lat": 19.0850, "lng": 72.8850},
        {"time": "12:08", "towerName": "Tower C", "lat": 19.0850, "lng": 72.8850}, # Post-video detection
    ]
    
    for i, evt in enumerate(events):
        hours, mins = map(int, evt["time"].split(":"))
        ts = today.replace(hour=hours, minute=mins).isoformat()
        create_synthetic_tower_event({
            "eventId": f"TWR-EVT-{i+1:03d}",
            "identityId": "ID-DEMO-001",
            "towerId": f"TWR-{i+1:03d}",
            "towerName": evt["towerName"],
            "timestamp": ts,
            "latitude": evt["lat"],
            "longitude": evt["lng"]
        })
        
    # Random tower events for others
    for i in range(5, 21):
        create_synthetic_tower_event({
            "eventId": f"TWR-EVT-{i:03d}",
            "identityId": f"ID-DEMO-{i%9+2:03d}",
            "towerId": f"TWR-{i:03d}",
            "towerName": "Tower X",
            "timestamp": now_iso,
            "latitude": 19.0000,
            "longitude": 72.0000
        })

    create_audit_log({
        "action": "DATASET_GENERATED",
        "entityType": "SYSTEM",
        "description": "Generated SIH Demo Synthetic Dataset",
        "userId": "System"
    })
    
    return {
        "status": "success",
        "message": "Generated 10 identities, 20 SIMs, 15 banks, 20 tower events, 1 synthetic case."
    }
