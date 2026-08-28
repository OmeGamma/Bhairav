import asyncio
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash

SYNTHETIC_EVENTS = [
    {
        "event_type": "PERSON_DETECTED",
        "title": "Unauthorized Personnel Detected",
        "severity": "HIGH",
        "description": "Unidentified individual detected in Sector X perimeter during restricted hours.",
        "location": "Sector X North Gate",
        "location_id": "LOC-001",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "camera_id": "CAM-17",
        "status": "NEW",
        "source": "SYNTHETIC_DEMO",
        "timestamp": datetime.utcnow() - timedelta(minutes=5),
        "related_entities_count": 3,
    },
    {
        "event_type": "VEHICLE_DETECTED",
        "title": "Unregistered Vehicle Spotted",
        "severity": "MEDIUM",
        "description": "Vehicle without valid checkpoint entry record detected near Main Checkpoint.",
        "location": "Sector Y Entrance",
        "location_id": "LOC-002",
        "latitude": 28.6150,
        "longitude": 77.2100,
        "camera_id": "CAM-08",
        "status": "ACKNOWLEDGED",
        "source": "SYNTHETIC_DEMO",
        "timestamp": datetime.utcnow() - timedelta(minutes=15),
        "related_entities_count": 1,
    },
    {
        "event_type": "RESTRICTED_ZONE",
        "title": "Restricted Zone Intrusion",
        "severity": "CRITICAL",
        "description": "Motion detected inside Zone Alpha restricted perimeter. Immediate verification required.",
        "location": "Zone Alpha",
        "location_id": "LOC-003",
        "latitude": 28.6120,
        "longitude": 77.2050,
        "camera_id": "CAM-22",
        "status": "NEW",
        "source": "SYNTHETIC_DEMO",
        "timestamp": datetime.utcnow() - timedelta(minutes=2),
        "related_entities_count": 5,
    },
    {
        "event_type": "SECURITY_ALERT",
        "title": "Perimeter Fence Tampering",
        "severity": "CRITICAL",
        "description": "Sensor array reports possible tampering at Sector X eastern fence line.",
        "location": "Sector X East",
        "location_id": "LOC-004",
        "latitude": 28.6145,
        "longitude": 77.2115,
        "camera_id": None,
        "status": "NEW",
        "source": "SYNTHETIC_DEMO",
        "timestamp": datetime.utcnow() - timedelta(minutes=8),
        "related_entities_count": 2,
    },
    {
        "event_type": "INCIDENT",
        "title": "Checkpoint Delay Reported",
        "severity": "LOW",
        "description": "Personnel reporting unusual delay at primary checkpoint. Possible congestion.",
        "location": "Main Checkpoint",
        "location_id": "LOC-005",
        "latitude": 28.6130,
        "longitude": 77.2080,
        "camera_id": "CAM-08",
        "status": "RESOLVED",
        "source": "SYNTHETIC_DEMO",
        "timestamp": datetime.utcnow() - timedelta(minutes=45),
        "related_entities_count": 0,
    },
    {
        "event_type": "PERSON_DETECTED",
        "title": "Crowd Anomaly Near Administration Block",
        "severity": "MEDIUM",
        "description": "AI vision model flags unusual gathering near administration block after hours.",
        "location": "Administration Block",
        "location_id": "LOC-006",
        "latitude": 28.6140,
        "longitude": 77.2070,
        "camera_id": "CAM-31",
        "status": "ACKNOWLEDGED",
        "source": "SYNTHETIC_DEMO",
        "timestamp": datetime.utcnow() - timedelta(minutes=22),
        "related_entities_count": 8,
    },
]

async def seed():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]
    
    # Ensure admin user exists for auth context
    existing_admin = await db.users.find_one({"email": "adminn@gmail.com"})
    if not existing_admin:
        await db.users.insert_one({
            "email": "adminn@gmail.com",
            "password_hash": get_password_hash("admin@123"),
            "name": "System Admin",
            "role_id": "admin",
            "status": "ACTIVE",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        print("Created admin user")
    
    # Ensure roles exist
    admin_role = await db.roles.find_one({"_id": "admin"})
    if not admin_role:
        await db.roles.insert_one({
            "_id": "admin",
            "name": "admin",
            "permissions": ["system.admin"]
        })
        print("Created admin role")
    
    officer_role = await db.roles.find_one({"_id": "officer"})
    if not officer_role:
        await db.roles.insert_one({
            "_id": "officer",
            "name": "officer",
            "permissions": [
                "cameras.read", "locations.read", "events.read", "incidents.read",
                "cases.read", "persons.read", "vehicles.read", "documents.read",
                "verification.read", "network.read", "personnel.read", "welfare.read",
                "support.read", "search.execute", "reports.read", "audit.read"
            ]
        })
        print("Created officer role")
    
    # Clear existing synthetic events
    await db.events.delete_many({"source": "SYNTHETIC_DEMO"})
    print("Cleared existing synthetic events")
    
    # Insert synthetic events
    result = await db.events.insert_many(SYNTHETIC_EVENTS)
    print(f"Inserted {len(result.inserted_ids)} synthetic events")
    
    # List them
    for evt in await db.events.find({"source": "SYNTHETIC_DEMO"}).to_list(100):
        print(f"  - {evt.get('_id')} | {evt.get('event_type')} | {evt.get('severity')} | {evt.get('status')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
