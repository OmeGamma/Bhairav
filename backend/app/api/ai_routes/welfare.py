from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas.ai_schemas import WelfareResponse
from app.core.config import settings
import uuid

router = APIRouter()

@router.post("/welfare/analyze", response_model=WelfareResponse)
async def analyze_welfare(payload: Dict[str, Any]):
    """
    Mock AI Service for Welfare Analytics.
    """
    personnel_id = payload.get("personnel_id", str(uuid.uuid4()))
    
    response = WelfareResponse(
        personnel_id=personnel_id,
        status="SUPPORT RECOMMENDED",
        indicators=[
            {"metric": "workload", "value": "HIGH", "trend": "increasing"},
            {"metric": "rest", "value": "LOW", "trend": "decreasing"}
        ],
        model_info={
            "model": "statistical-welfare-v1",
            "version": "1.0",
            "processing_mode": "synthetic"
        }
    )
    return response
