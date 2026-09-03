"""Aggregated dashboard stats endpoint."""
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta

from app.core.database import get_db

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/dashboard")
async def dashboard_stats(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Aggregate counts for the command center dashboard.

    Returns live numbers where MongoDB has data, demo data otherwise.
    All response fields are non-negative integers.
    """
    now = datetime.utcnow()
    last_24h = now - timedelta(hours=24)
    last_7d = now - timedelta(days=7)

    async def count(coll: str, query: dict | None = None) -> int:
        try:
            return await db[coll].count_documents(query or {})
        except Exception:
            return 0

    cameras_total = await count("cameras")
    cameras_online = await count("cameras", {"status": "ACTIVE"})
    cameras_offline = max(cameras_total - cameras_online, 0)

    active_alerts = await count("alerts", {"status": "OPEN"})
    high_severity_alerts = await count("alerts", {"severity": {"$in": ["HIGH", "CRITICAL"]}, "status": "OPEN"})

    persons_count = await count("persons")
    vehicles_count = await count("vehicles")
    cases_active = await count("cases", {"status": "ACTIVE"})

    events_today = await count("events", {"timestamp": {"$gte": last_24h}})
    events_total = await count("events")

    relationships_count = await count("relationships")
    investigations_count = cases_active

    # Demo fallback so dashboard never shows all-zeros during prototype
    if all(v == 0 for v in [
        cameras_total, active_alerts, persons_count, vehicles_count, cases_active, events_total
    ]):
        return {
            "cameras_total": 4,
            "cameras_online": 3,
            "cameras_offline": 1,
            "active_alerts": 2,
            "high_severity_alerts": 1,
            "persons_count": 3,
            "vehicles_count": 3,
            "cases_active": 1,
            "events_today": 3,
            "events_total": 3,
            "relationships_count": 3,
            "investigations_count": 1,
            "is_demo_fallback": True,
        }

    return {
        "cameras_total": cameras_total,
        "cameras_online": cameras_online,
        "cameras_offline": cameras_offline,
        "active_alerts": active_alerts,
        "high_severity_alerts": high_severity_alerts,
        "persons_count": persons_count,
        "vehicles_count": vehicles_count,
        "cases_active": cases_active,
        "events_today": events_today,
        "events_total": events_total,
        "relationships_count": relationships_count,
        "investigations_count": investigations_count,
        "is_demo_fallback": False,
    }
