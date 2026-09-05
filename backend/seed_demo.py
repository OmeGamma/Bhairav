"""
BHAIRAV demo data seeder.
Populates MongoDB with clearly synthetic sample data so the prototype UI is functional.

Run with:
    python -m seed_demo
"""
import asyncio
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from bson import ObjectId

# Add backend app dir to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import connect_to_mongo, close_mongo_connection, get_db  # noqa: E402


NOW = datetime.utcnow()


def iso(dt: datetime) -> str:
    return dt.isoformat()


async def seed():
    print("=" * 50)
    print("BHAIRAV DEMO DATA SEEDER")
    print("=" * 50)
    print("[DEMO] All data is synthetic. For authorized prototype use only.")

    await connect_to_mongo()
    db = get_db()
    if db is None:
        print("ERROR: Could not connect to MongoDB.")
        return

    # Clear existing demo data
    print("\nClearing existing demo collections...")
    for col in ["cameras", "security_zones", "events", "persons", "vehicles",
                "locations", "relationships", "cases", "incidents", "alerts",
                "network_entities", "evidence_files", "evidence_versions",
                "evidence_audit", "processing_jobs", "ingestion_results",
                "entities", "extracted_entities", "extracted_relationships"]:
        await db[col].delete_many({"_demo": True})

    # ---- Locations ----
    print("Seeding locations...")
    locations = [
        {"_id": ObjectId(), "name": "Sector X North Gate", "latitude": 28.6139, "longitude": 77.2090,
         "type": "CHECKPOINT", "status": "ACTIVE", "_demo": True},
        {"_id": ObjectId(), "name": "Sector Y Main Entrance", "latitude": 28.6150, "longitude": 77.2100,
         "type": "CHECKPOINT", "status": "ACTIVE", "_demo": True},
        {"_id": ObjectId(), "name": "Restricted Zone Alpha", "latitude": 28.6120, "longitude": 77.2050,
         "type": "RESTRICTED", "status": "ACTIVE", "_demo": True},
        {"_id": ObjectId(), "name": "Checkpoint Beta", "latitude": 28.6200, "longitude": 77.2150,
         "type": "CHECKPOINT", "status": "ACTIVE", "_demo": True},
    ]
    await db.locations.insert_many(locations)

    # ---- Security Zones ----
    print("Seeding security zones...")
    zone_alpha = {
        "name": "Zone Alpha — Restricted",
        "type": "RESTRICTED",
        "coordinates": [[28.6120, 77.2050], [28.6140, 77.2050],
                        [28.6140, 77.2070], [28.6120, 77.2070]],
        "status": "ACTIVE",
        "_demo": True,
    }
    await db.security_zones.insert_one(zone_alpha)

    # ---- Cameras ----
    print("Seeding cameras...")
    cameras = [
        {"name": "BOP-01 — North Gate", "location_id": str(locations[0]["_id"]),
         "status": "ACTIVE", "stream_reference": "demo://cam-01", "_demo": True,
         "created_at": NOW, "updated_at": NOW},
        {"name": "BOP-02 — Main Entrance", "location_id": str(locations[1]["_id"]),
         "status": "ACTIVE", "stream_reference": "demo://cam-02", "_demo": True,
         "created_at": NOW, "updated_at": NOW},
        {"name": "BOP-03 — Zone Alpha Perimeter", "location_id": str(locations[2]["_id"]),
         "status": "ACTIVE", "stream_reference": "demo://cam-03", "_demo": True,
         "created_at": NOW, "updated_at": NOW},
        {"name": "BOP-04 — Checkpoint Beta", "location_id": str(locations[3]["_id"]),
         "status": "MAINTENANCE", "stream_reference": "demo://cam-04", "_demo": True,
         "created_at": NOW, "updated_at": NOW},
    ]
    cam_result = await db.cameras.insert_many(cameras)
    cam_ids = [str(c) for c in cam_result.inserted_ids]

    # ---- Persons (synthetic) ----
    print("Seeding persons of interest...")
    persons = [
        {"name": "Person Alpha", "aliases": ["A. Singh"], "status": "OBSERVED",
         "risk": "MEDIUM", "_demo": True,
         "metadata": {"dob": "1985-04-12", "nationality": "IN"}},
        {"name": "Person Beta", "aliases": [], "status": "OBSERVED",
         "risk": "HIGH", "_demo": True,
         "metadata": {"dob": "1990-09-30", "nationality": "IN"}},
        {"name": "Person Gamma", "aliases": [], "status": "CONFIRMED",
         "risk": "LOW", "_demo": True,
         "metadata": {"dob": "1978-01-22", "nationality": "IN"}},
    ]
    person_result = await db.persons.insert_many(persons)
    person_ids = [str(p) for p in person_result.inserted_ids]

    # ---- Vehicles (synthetic) ----
    print("Seeding vehicles...")
    vehicles = [
        {"registration": "UP32AB1234", "type": "CAR", "color": "WHITE",
         "status": "OBSERVED", "associated_person_ids": [person_ids[0]],
         "_demo": True},
        {"registration": "DL05CD5678", "type": "MOTORCYCLE", "color": "BLACK",
         "status": "OBSERVED", "associated_person_ids": [person_ids[1]],
         "_demo": True},
        {"registration": "HR26EF9012", "type": "TRUCK", "color": "BLUE",
         "status": "CONFIRMED", "associated_person_ids": [person_ids[2]],
         "_demo": True},
    ]
    vehicle_result = await db.vehicles.insert_many(vehicles)
    vehicle_ids = [str(v) for v in vehicle_result.inserted_ids]

    # ---- Events ----
    print("Seeding events...")
    events = [
        {
            "event_type": "INTRUSION",
            "severity": "HIGH",
            "title": "Restricted zone entry",
            "description": "[DEMO] Person detected inside Zone Alpha perimeter.",
            "location_id": str(locations[2]["_id"]),
            "camera_id": cam_ids[2],
            "status": "NEW",
            "latitude": 28.6120,
            "longitude": 77.2050,
            "related_entities_count": 2,
            "source": "CCTV",
            "timestamp": NOW - timedelta(minutes=12),
            "_demo": True,
        },
        {
            "event_type": "VEHICLE_DETECTION",
            "severity": "MEDIUM",
            "title": "Known vehicle observed",
            "description": "[DEMO] Vehicle UP32AB1234 detected at North Gate.",
            "location_id": str(locations[0]["_id"]),
            "camera_id": cam_ids[0],
            "status": "ACKNOWLEDGED",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "related_entities_count": 1,
            "source": "CCTV",
            "timestamp": NOW - timedelta(hours=1),
            "_demo": True,
        },
        {
            "event_type": "SUSPICIOUS_MOVEMENT",
            "severity": "MEDIUM",
            "title": "Loitering detected",
            "description": "[DEMO] Same person observed at Main Entrance for > 15 min.",
            "location_id": str(locations[1]["_id"]),
            "camera_id": cam_ids[1],
            "status": "NEW",
            "latitude": 28.6150,
            "longitude": 77.2100,
            "related_entities_count": 0,
            "source": "CCTV",
            "timestamp": NOW - timedelta(minutes=45),
            "_demo": True,
        },
    ]
    await db.events.insert_many(events)

    # ---- Relationships ----
    print("Seeding relationships...")
    relationships = [
        {"source_type": "person", "source_id": person_ids[0],
         "relationship_type": "ASSOCIATED_WITH",
         "target_type": "person", "target_id": person_ids[1],
         "confidence": 0.62, "source": "ANALYST",
         "status": "INFERRED", "timestamp": NOW, "_demo": True},
        {"source_type": "person", "source_id": person_ids[0],
         "relationship_type": "USED",
         "target_type": "vehicle", "target_id": vehicle_ids[0],
         "confidence": 0.81, "source": "CCTV",
         "status": "OBSERVED", "timestamp": NOW - timedelta(days=2), "_demo": True},
        {"source_type": "person", "source_id": person_ids[1],
         "relationship_type": "LOCATED_AT",
         "target_type": "location", "target_id": str(locations[2]["_id"]),
         "confidence": 0.55, "source": "CCTV",
         "status": "OBSERVED", "timestamp": NOW - timedelta(hours=3), "_demo": True},
    ]
    await db.relationships.insert_many(relationships)

    # ---- Alerts (derived view) ----
    print("Seeding alerts...")
    alerts = [
        {"severity": "CRITICAL", "type": "INTRUSION", "title": "Restricted zone entry",
         "location": "Zone Alpha", "camera": "BOP-03", "status": "OPEN",
         "timestamp": NOW - timedelta(minutes=12), "_demo": True},
        {"severity": "HIGH", "type": "VEHICLE_DETECTION", "title": "Known vehicle observed",
         "location": "North Gate", "camera": "BOP-01", "status": "ACKNOWLEDGED",
         "timestamp": NOW - timedelta(hours=1), "_demo": True},
        {"severity": "MEDIUM", "type": "SUSPICIOUS_MOVEMENT", "title": "Loitering detected",
         "location": "Main Entrance", "camera": "BOP-02", "status": "OPEN",
         "timestamp": NOW - timedelta(minutes=45), "_demo": True},
    ]
    await db.alerts.insert_many(alerts)

    # ---- Cases (investigations) ----
    print("Seeding investigations...")
    cases = [
        {
            "title": "CASE BH-1024 — Sector X surveillance",
            "description": "[DEMO] Coordinated monitoring of activity in Sector X.",
            "status": "ACTIVE", "priority": "HIGH",
            "related_entities": [
                {"type": "person", "id": person_ids[0]},
                {"type": "person", "id": person_ids[1]},
                {"type": "vehicle", "id": vehicle_ids[0]},
            ],
            "_demo": True, "created_at": NOW, "updated_at": NOW,
        },
    ]
    await db.cases.insert_many(cases)

    # ---- Network entities (for the Network Intelligence graph) ----
    print("Seeding network entities...")
    person_id_strs = [str(p) for p in person_result.inserted_ids]
    vehicle_id_strs = [str(v) for v in vehicle_result.inserted_ids]
    location_id_strs = [str(l) for l in [loc["_id"] for loc in locations]]

    network_entities = [
        {"_id": ObjectId(), "entity_type": "PERSON", "reference_id": person_id_strs[0],
         "label": "Person Alpha", "metadata": {"status": "OBSERVED", "risk": "MEDIUM"}, "_demo": True},
        {"_id": ObjectId(), "entity_type": "PERSON", "reference_id": person_id_strs[1],
         "label": "Person Beta", "metadata": {"status": "OBSERVED", "risk": "HIGH"}, "_demo": True},
        {"_id": ObjectId(), "entity_type": "PERSON", "reference_id": person_id_strs[2],
         "label": "Person Gamma", "metadata": {"status": "CONFIRMED", "risk": "LOW"}, "_demo": True},
        {"_id": ObjectId(), "entity_type": "VEHICLE", "reference_id": vehicle_id_strs[0],
         "label": "UP32AB1234", "metadata": {"status": "OBSERVED", "type": "CAR"}, "_demo": True},
        {"_id": ObjectId(), "entity_type": "VEHICLE", "reference_id": vehicle_id_strs[1],
         "label": "DL05CD5678", "metadata": {"status": "OBSERVED", "type": "MOTORCYCLE"}, "_demo": True},
        {"_id": ObjectId(), "entity_type": "LOCATION", "reference_id": location_id_strs[0],
         "label": "Sector X North Gate", "metadata": {"status": "ACTIVE"}, "_demo": True},
        {"_id": ObjectId(), "entity_type": "LOCATION", "reference_id": location_id_strs[2],
         "label": "Zone Alpha", "metadata": {"status": "ACTIVE", "restricted": True}, "_demo": True},
        {"_id": ObjectId(), "entity_type": "CASE", "reference_id": "BH-1024",
         "label": "CASE BH-1024", "metadata": {"status": "ACTIVE", "priority": "HIGH"}, "_demo": True},
        {"_id": ObjectId(), "entity_type": "ORGANIZATION", "reference_id": "ORG-001",
         "label": "Demo Organization", "metadata": {"status": "OBSERVED"}, "_demo": True},
        {"_id": ObjectId(), "entity_type": "PHONE", "reference_id": "+91-XXXXX-12345",
         "label": "+91-XXXXX-12345", "metadata": {"status": "OBSERVED"}, "_demo": True},
        {"_id": ObjectId(), "entity_type": "EVENT", "reference_id": str(events[0].get("_id", "EVT-001")),
         "label": "Restricted zone entry", "metadata": {"status": "NEW", "severity": "HIGH"}, "_demo": True},
    ]
    ne_result = await db.network_entities.insert_many(network_entities)
    ne_ids = [str(n) for n in ne_result.inserted_ids]
    ne_by_label = {ne["label"]: str(ne["_id"]) for ne in network_entities}

    # ---- Wire graph relationships (use the new network_entities IDs) ----
    print("Seeding network relationships...")
    def nid(label: str) -> str:
        return ne_by_label[label]

    network_relationships = [
        {"source_entity_id": nid("Person Alpha"), "target_entity_id": nid("Person Beta"),
         "relationship_type": "ASSOCIATED_WITH",
         "confidence": 0.62, "source": "ANALYST", "status": "INFERRED",
         "timestamp": NOW, "_demo": True, "investigation_id": "BH-1024"},
        {"source_entity_id": nid("Person Beta"), "target_entity_id": nid("Person Gamma"),
         "relationship_type": "ASSOCIATED_WITH",
         "confidence": 0.45, "source": "CCTV", "status": "OBSERVED",
         "timestamp": NOW - timedelta(days=3), "_demo": True},
        {"source_entity_id": nid("Person Alpha"), "target_entity_id": nid("UP32AB1234"),
         "relationship_type": "USES",
         "confidence": 0.81, "source": "CCTV", "status": "OBSERVED",
         "timestamp": NOW - timedelta(days=2), "_demo": True, "investigation_id": "BH-1024"},
        {"source_entity_id": nid("Person Beta"), "target_entity_id": nid("DL05CD5678"),
         "relationship_type": "USES",
         "confidence": 0.75, "source": "CCTV", "status": "OBSERVED",
         "timestamp": NOW - timedelta(days=1), "_demo": True},
        {"source_entity_id": nid("UP32AB1234"), "target_entity_id": nid("Sector X North Gate"),
         "relationship_type": "DETECTED_AT",
         "confidence": 0.9, "source": "CCTV", "status": "OBSERVED",
         "timestamp": NOW - timedelta(hours=1), "_demo": True, "investigation_id": "BH-1024"},
        {"source_entity_id": nid("DL05CD5678"), "target_entity_id": nid("Zone Alpha"),
         "relationship_type": "DETECTED_AT",
         "confidence": 0.95, "source": "CCTV", "status": "OBSERVED",
         "timestamp": NOW - timedelta(minutes=12), "_demo": True},
        {"source_entity_id": nid("Person Beta"), "target_entity_id": nid("+91-XXXXX-12345"),
         "relationship_type": "CONTACTED",
         "confidence": 0.7, "source": "FIR", "status": "OBSERVED",
         "timestamp": NOW - timedelta(days=5), "_demo": True, "investigation_id": "BH-1024"},
        {"source_entity_id": nid("Person Alpha"), "target_entity_id": nid("Demo Organization"),
         "relationship_type": "MEMBER_OF",
         "confidence": 0.5, "source": "ANALYST", "status": "INFERRED",
         "timestamp": NOW - timedelta(days=7), "_demo": True},
        {"source_entity_id": nid("CASE BH-1024"), "target_entity_id": nid("Person Alpha"),
         "relationship_type": "MENTIONED_IN",
         "confidence": 1.0, "source": "ANALYST", "status": "CONFIRMED",
         "timestamp": NOW, "_demo": True, "investigation_id": "BH-1024"},
        {"source_entity_id": nid("CASE BH-1024"), "target_entity_id": nid("UP32AB1234"),
         "relationship_type": "MENTIONED_IN",
         "confidence": 1.0, "source": "ANALYST", "status": "CONFIRMED",
         "timestamp": NOW, "_demo": True, "investigation_id": "BH-1024"},
        {"source_entity_id": nid("CASE BH-1024"), "target_entity_id": nid("Sector X North Gate"),
         "relationship_type": "LOCATED_AT",
         "confidence": 1.0, "source": "ANALYST", "status": "CONFIRMED",
         "timestamp": NOW, "_demo": True, "investigation_id": "BH-1024"},
        {"source_entity_id": nid("Restricted zone entry"), "target_entity_id": nid("Zone Alpha"),
         "relationship_type": "LOCATED_AT",
         "confidence": 0.9, "source": "CCTV", "status": "CONFIRMED",
         "timestamp": NOW - timedelta(minutes=12), "_demo": True},
        {"source_entity_id": nid("Restricted zone entry"), "target_entity_id": nid("DL05CD5678"),
         "relationship_type": "INVOLVED",
         "confidence": 0.7, "source": "CCTV", "status": "OBSERVED",
         "timestamp": NOW - timedelta(minutes=12), "_demo": True},
    ]
    await db.network_relationships.insert_many(network_relationships) if False else await db.relationships.insert_many(network_relationships)

    # ---- Evidence Files ----
    print("Seeding evidence files...")
    import hashlib
    def sha256_of(text: str) -> str:
        return hashlib.sha256(text.encode()).hexdigest()

    evidence_files = [
        {
            "original_filename": "FIR_BH-2026-001.txt",
            "stored_filename": "fir_sample.txt",
            "mime_type": "text/plain",
            "extension": "txt",
            "size_bytes": 245,
            "storage_provider": "local",
            "storage_key": str(Path(__file__).resolve().parent.parent / "storage" / "evidence" / "documents" / "fir_sample.txt"),
            "checksum_sha256": sha256_of("FIR No. BH-2026-001\nDate: 2026-08-15\nComplainant: Person Alpha\nDescription: Intrusion detected at Restricted Zone Alpha. Vehicle UP32AB1234 observed.\nEvidence: CCTV footage from BOP-03.\n"),
            "source_type": "FIR",
            "classification": "RESTRICTED",
            "description": "[DEMO] First Information Report for case BH-2026-001 documenting intrusion at Zone Alpha.",
            "tags": ["BH-2026-001", "intrusion", "zone-alpha"],
            "case_id": str(cases[0]["_id"]) if cases else None,
            "investigation_id": "BH-1024",
            "processing_status": "PROCESSED",
            "version": 1,
            "is_original": True,
            "is_deleted": False,
            "uploaded_by": str(person_ids[0]),
            "uploaded_at": NOW - timedelta(days=5),
            "updated_at": NOW - timedelta(days=5),
            "created_at": NOW - timedelta(days=5),
            "_demo": True,
        },
        {
            "original_filename": "Surveillance_Report_SectorX.txt",
            "stored_filename": "surveillance_report.txt",
            "mime_type": "text/plain",
            "extension": "txt",
            "size_bytes": 198,
            "storage_provider": "local",
            "storage_key": str(Path(__file__).resolve().parent.parent / "storage" / "evidence" / "documents" / "surveillance_report.txt"),
            "checksum_sha256": sha256_of("SURVEILLANCE REPORT\nCase: BH-2026-001\nSubject: Person Beta\nLocation: Sector X North Gate\nObservations: Person Beta observed loitering for 15 minutes. Associated with vehicle DL05CD5678.\n"),
            "source_type": "SURVEILLANCE_REPORT",
            "classification": "INTERNAL",
            "description": "[DEMO] Surveillance report for Sector X North Gate.",
            "tags": ["BH-2026-001", "surveillance", "sector-x"],
            "case_id": str(cases[0]["_id"]) if cases else None,
            "investigation_id": "BH-1024",
            "processing_status": "PROCESSED",
            "version": 1,
            "is_original": True,
            "is_deleted": False,
            "uploaded_by": str(person_ids[1]),
            "uploaded_at": NOW - timedelta(days=4),
            "updated_at": NOW - timedelta(days=4),
            "created_at": NOW - timedelta(days=4),
            "_demo": True,
        },
        {
            "original_filename": "CDR_August_2026.csv",
            "stored_filename": "cdr_august.csv",
            "mime_type": "text/csv",
            "extension": "csv",
            "size_bytes": 156,
            "storage_provider": "local",
            "storage_key": str(Path(__file__).resolve().parent.parent / "storage" / "evidence" / "cdr" / "cdr_august.csv"),
            "checksum_sha256": sha256_of("caller,receiver,timestamp,duration,cell_tower,call_type\n+91-9876543210,+91-9876543211,2026-08-01T10:00:00Z,120,Tower-Alpha,OUTGOING\n+91-9876543211,+91-9876543210,2026-08-01T14:00:00Z,45,Tower-Beta,INCOMING\n+91-9876543210,+91-9876543212,2026-08-02T09:00:00Z,300,Tower-Gamma,OUTGOING\n"),
            "source_type": "CDR",
            "classification": "RESTRICTED",
            "description": "[DEMO] CDR data for August 2026 showing communication patterns.",
            "tags": ["BH-2026-001", "cdr", "communications"],
            "case_id": str(cases[0]["_id"]) if cases else None,
            "investigation_id": "BH-1024",
            "processing_status": "PROCESSED",
            "version": 1,
            "is_original": True,
            "is_deleted": False,
            "uploaded_by": str(person_ids[2]),
            "uploaded_at": NOW - timedelta(days=3),
            "updated_at": NOW - timedelta(days=3),
            "created_at": NOW - timedelta(days=3),
            "_demo": True,
        },
        {
            "original_filename": "Financial_Transactions_August.csv",
            "stored_filename": "transactions_august.csv",
            "mime_type": "text/csv",
            "extension": "csv",
            "size_bytes": 189,
            "storage_provider": "local",
            "storage_key": str(Path(__file__).resolve().parent.parent / "storage" / "evidence" / "financial" / "transactions_august.csv"),
            "checksum_sha256": sha256_of("transaction_id,sender,receiver,account,amount,timestamp,location,transaction_type\nTXN001,Person Alpha,Person Beta,ACC-1001,50000,2026-08-05T11:00:00Z,Delhi,TRANSFER\nTXN002,Person Beta,Org Orion,ACC-2002,120000,2026-08-10T16:00:00Z,Mumbai,CASH_DEPOSIT\n"),
            "source_type": "FINANCIAL_RECORD",
            "classification": "CONFIDENTIAL",
            "description": "[DEMO] Financial transaction records for August 2026.",
            "tags": ["BH-2026-001", "financial", "transactions"],
            "case_id": str(cases[0]["_id"]) if cases else None,
            "investigation_id": "BH-1024",
            "processing_status": "PROCESSED",
            "version": 1,
            "is_original": True,
            "is_deleted": False,
            "uploaded_by": str(person_ids[0]),
            "uploaded_at": NOW - timedelta(days=2),
            "updated_at": NOW - timedelta(days=2),
            "created_at": NOW - timedelta(days=2),
            "_demo": True,
        },
    ]
    ev_result = await db.evidence_files.insert_many(evidence_files)
    ev_ids = [str(e) for e in ev_result.inserted_ids]

    # ---- Processing Jobs ----
    print("Seeding processing jobs...")
    processing_jobs = []
    for ev_id in ev_ids:
        processing_jobs.append({
            "file_id": ev_id,
            "job_type": "FILE_VALIDATION",
            "status": "COMPLETED",
            "progress": 100.0,
            "created_by": str(person_ids[0]),
            "created_at": NOW - timedelta(days=5),
            "started_at": NOW - timedelta(days=5),
            "completed_at": NOW - timedelta(days=5),
            "_demo": True,
        })
    pj_result = await db.processing_jobs.insert_many(processing_jobs)
    pj_ids = [str(p) for p in pj_result.inserted_ids]

    # ---- Entities ----
    print("Seeding extracted entities...")
    entities = [
        {"entity_type": "PERSON", "canonical_name": "Person Alpha", "aliases": ["A. Singh"], "confidence": 0.9, "source_files": [ev_ids[0]], "_demo": True, "created_at": NOW, "updated_at": NOW},
        {"entity_type": "PERSON", "canonical_name": "Person Beta", "aliases": [], "confidence": 0.85, "source_files": [ev_ids[0], ev_ids[1]], "_demo": True, "created_at": NOW, "updated_at": NOW},
        {"entity_type": "VEHICLE", "canonical_name": "UP32AB1234", "confidence": 0.9, "source_files": [ev_ids[0]], "_demo": True, "created_at": NOW, "updated_at": NOW},
        {"entity_type": "VEHICLE", "canonical_name": "DL05CD5678", "confidence": 0.85, "source_files": [ev_ids[1]], "_demo": True, "created_at": NOW, "updated_at": NOW},
        {"entity_type": "PHONE", "canonical_name": "+91-9876543210", "confidence": 0.95, "source_files": [ev_ids[2]], "_demo": True, "created_at": NOW, "updated_at": NOW},
        {"entity_type": "PHONE", "canonical_name": "+91-9876543211", "confidence": 0.95, "source_files": [ev_ids[2]], "_demo": True, "created_at": NOW, "updated_at": NOW},
        {"entity_type": "ORGANIZATION", "canonical_name": "Org Orion", "confidence": 0.7, "source_files": [ev_ids[3]], "_demo": True, "created_at": NOW, "updated_at": NOW},
        {"entity_type": "LOCATION", "canonical_name": "Zone Alpha", "confidence": 0.8, "source_files": [ev_ids[0]], "_demo": True, "created_at": NOW, "updated_at": NOW},
        {"entity_type": "CASE", "canonical_name": "BH-2026-001", "confidence": 1.0, "source_files": [ev_ids[0], ev_ids[1]], "_demo": True, "created_at": NOW, "updated_at": NOW},
    ]
    ent_result = await db.entities.insert_many(entities)
    ent_ids = [str(e) for e in ent_result.inserted_ids]
    ent_by_name = {e["canonical_name"].upper(): str(e["_id"]) for e in entities}

    def eid(name: str) -> str:
        return ent_by_name.get(name.upper(), "")

    # ---- Relationships from entities ----
    print("Seeding entity relationships...")
    entity_relationships = [
        {"source_entity_id": eid("Person Alpha"), "target_entity_id": eid("Person Beta"), "relationship_type": "ASSOCIATED_WITH", "confidence": 0.7, "source_file_id": ev_ids[0], "_demo": True, "created_at": NOW},
        {"source_entity_id": eid("Person Alpha"), "target_entity_id": eid("UP32AB1234"), "relationship_type": "USES", "confidence": 0.8, "source_file_id": ev_ids[0], "_demo": True, "created_at": NOW},
        {"source_entity_id": eid("Person Beta"), "target_entity_id": eid("DL05CD5678"), "relationship_type": "USES", "confidence": 0.75, "source_file_id": ev_ids[1], "_demo": True, "created_at": NOW},
        {"source_entity_id": eid("Person Beta"), "target_entity_id": eid("+91-9876543211"), "relationship_type": "CALLED", "confidence": 0.7, "source_file_id": ev_ids[2], "_demo": True, "created_at": NOW},
        {"source_entity_id": eid("Person Alpha"), "target_entity_id": eid("Zone Alpha"), "relationship_type": "TRAVELLED_TO", "confidence": 0.6, "source_file_id": ev_ids[0], "_demo": True, "created_at": NOW},
        {"source_entity_id": eid("Person Beta"), "target_entity_id": eid("Org Orion"), "relationship_type": "WORKS_FOR", "confidence": 0.5, "source_file_id": ev_ids[3], "_demo": True, "created_at": NOW},
    ]
    await db.relationships.insert_many(entity_relationships)

    # ---- Extracted entities and relationships ----
    extracted_entities = [
        {"file_id": ev_ids[0], "job_id": pj_ids[1] if len(pj_ids) > 1 else None, "entity_type": "PERSON", "canonical_name": "Person Alpha", "confidence": 0.9, "extraction_method": "regex", "_demo": True, "created_at": NOW},
        {"file_id": ev_ids[0], "job_id": pj_ids[1] if len(pj_ids) > 1 else None, "entity_type": "PERSON", "canonical_name": "Person Beta", "confidence": 0.85, "extraction_method": "regex", "_demo": True, "created_at": NOW},
        {"file_id": ev_ids[2], "job_id": pj_ids[3] if len(pj_ids) > 3 else None, "entity_type": "PHONE", "canonical_name": "+91-9876543210", "confidence": 0.95, "extraction_method": "regex", "_demo": True, "created_at": NOW},
    ]
    await db.extracted_entities.insert_many(extracted_entities)

    extracted_rels = [
        {"file_id": ev_ids[0], "job_id": pj_ids[1] if len(pj_ids) > 1 else None, "source_entity_name": "Person Alpha", "target_entity_name": "Person Beta", "relationship_type": "ASSOCIATED_WITH", "confidence": 0.7, "_demo": True, "created_at": NOW},
        {"file_id": ev_ids[2], "job_id": pj_ids[3] if len(pj_ids) > 3 else None, "source_entity_name": "+91-9876543210", "target_entity_name": "+91-9876543211", "relationship_type": "CALLED", "confidence": 0.7, "_demo": True, "created_at": NOW},
    ]
    await db.extracted_relationships.insert_many(extracted_rels)

    # ---- Ingestion Results ----
    ingestion_results = [
        {"file_id": ev_ids[2], "job_id": pj_ids[2] if len(pj_ids) > 2 else None, "total_records": 3, "valid_records": 3, "invalid_records": 0, "duplicate_records": 0, "warnings": [], "errors": [], "_demo": True, "created_at": NOW},
        {"file_id": ev_ids[3], "job_id": pj_ids[3] if len(pj_ids) > 3 else None, "total_records": 2, "valid_records": 2, "invalid_records": 0, "duplicate_records": 0, "warnings": [], "errors": [], "_demo": True, "created_at": NOW},
    ]
    await db.ingestion_results.insert_many(ingestion_results)

    # ---- Evidence Audit ----
    print("Seeding evidence audit...")
    evidence_audit = []
    for idx, ev in enumerate(evidence_files):
        evidence_audit.append({
            "file_id": ev_ids[idx],
            "actor_user_id": str(person_ids[0]),
            "action": "FILE_UPLOADED",
            "resource_type": "evidence_file",
            "resource_id": ev_ids[idx],
            "metadata": {"filename": ev["original_filename"]},
            "timestamp": ev["uploaded_at"],
            "_demo": True,
        })
    await db.evidence_audit.insert_many(evidence_audit)

    # ---- Summary ----
    counts = {
        "locations": await db.locations.count_documents({"_demo": True}),
        "cameras": await db.cameras.count_documents({"_demo": True}),
        "persons": await db.persons.count_documents({"_demo": True}),
        "vehicles": await db.vehicles.count_documents({"_demo": True}),
        "events": await db.events.count_documents({"_demo": True}),
        "alerts": await db.alerts.count_documents({"_demo": True}),
        "network_entities": await db.network_entities.count_documents({"_demo": True}),
        "relationships": await db.relationships.count_documents({"_demo": True}),
        "cases": await db.cases.count_documents({"_demo": True}),
        "evidence_files": await db.evidence_files.count_documents({"_demo": True}),
        "evidence_versions": await db.evidence_versions.count_documents({"_demo": True}),
        "evidence_audit": await db.evidence_audit.count_documents({"_demo": True}),
        "processing_jobs": await db.processing_jobs.count_documents({"_demo": True}),
        "entities": await db.entities.count_documents({"_demo": True}),
        "extracted_entities": await db.extracted_entities.count_documents({"_demo": True}),
        "extracted_relationships": await db.extracted_relationships.count_documents({"_demo": True}),
        "ingestion_results": await db.ingestion_results.count_documents({"_demo": True}),
    }
    print("\n" + "=" * 50)
    print("SEED COMPLETE")
    print("=" * 50)
    for k, v in counts.items():
        print(f"  {k:18s} {v}")
    print("\n[DEMO] All records are tagged with _demo: True for traceability.")

    await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(seed())
