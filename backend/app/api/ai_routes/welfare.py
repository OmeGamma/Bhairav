from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Depends
from typing import Dict, Any

from app.schemas.ai_schemas import WelfareResponse
from app.core.database import get_db
from app.services.welfare_engine import analyze

router = APIRouter()


@router.post("/welfare/analyze", response_model=WelfareResponse)
async def analyze_welfare(
    payload: Dict[str, Any],
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    BHAIRAV Welfare Analytics Engine (real, rule-based + MongoDB history).

    Combines self-reported mood with keyword-based distress scoring and
    trend analysis from the last 10 check-ins. NOT a clinical model.
    """
    personnel_id = payload.get("personnel_id") or payload.get("check_in_id")
    if not personnel_id:
        raise HTTPException(status_code=400, detail="personnel_id is required")
    mood = payload.get("mood", "GOOD")
    notes = payload.get("notes", "") or ""

    result = await analyze(db, personnel_id, mood, notes)

    indicators = result["indicators"] + [
        {"type": "recommendation", "value": r} for r in result.get("recommendations", [])
    ]

    return WelfareResponse(
        personnel_id=result["personnel_id"],
        status=result["status"],
        indicators=indicators,
        model_info=result["model_info"],
    )
