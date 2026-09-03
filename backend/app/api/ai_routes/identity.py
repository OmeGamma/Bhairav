from fastapi import APIRouter
from typing import Dict, Any

from app.schemas.ai_schemas import VerificationResponse, VerificationCheck
from app.services.identity_engine import verify

router = APIRouter()


@router.post("/identity/analyze", response_model=VerificationResponse)
async def analyze_identity(payload: Dict[str, Any]):
    """
    BHAIRAV Identity Verification Engine (real, deterministic).

    Combines document field extraction with rule-based checks
    (name format, DOB plausibility, ID checksum). Confidence reflects
    rule-pass rate, not biometric match.
    """
    verification_id = payload.get("verification_id")
    text = payload.get("text") or payload.get("document_text") or ""
    expected = payload.get("expected") or payload.get("fields") or None

    result = verify(verification_id, text, expected)

    return VerificationResponse(
        verification_id=result["verification_id"],
        status=result["status"],
        confidence=result["confidence"],
        checks=[VerificationCheck(name=c["name"], status=c["status"]) for c in result["checks"]],
        reasons=result["reasons"],
        evidence=result["evidence"],
        model_info=result["model_info"],
    )
