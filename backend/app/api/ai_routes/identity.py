from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas.ai_schemas import VerificationResponse, VerificationCheck
from app.core.config import settings
import uuid

router = APIRouter()

@router.post("/identity/analyze", response_model=VerificationResponse)
async def analyze_identity(payload: Dict[str, Any]):
    """
    Mock AI Service for Identity and Document Verification.
    """
    verification_id = payload.get("verification_id", str(uuid.uuid4()))
    
    response = VerificationResponse(
        verification_id=verification_id,
        status="REVIEW_REQUIRED",
        confidence=0.84,
        checks=[
            VerificationCheck(name="document_readability", status="PASS"),
            VerificationCheck(name="field_consistency", status="REVIEW")
        ],
        reasons=["Minor inconsistency between requested ID and extracted ID format."],
        evidence={
            "extracted_id": "123456",
            "expected_format": "XXXXXX"
        },
        model_info={
            "model": "rule-based-consistency + vision",
            "version": "1.0",
            "processing_mode": "synthetic"
        }
    )
    return response
