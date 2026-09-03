from fastapi import APIRouter
from typing import Dict, Any
import uuid

from app.schemas.ai_schemas import DocumentAnalyzeResponse, FieldExtraction
from app.services.document_engine import extract_fields

router = APIRouter()


@router.post("/document/analyze", response_model=DocumentAnalyzeResponse)
async def analyze_document(payload: Dict[str, Any]):
    """
    BHAIRAV Document Intelligence Engine (real regex + validators).

    Performs deterministic field extraction (Aadhaar, PAN, passport, voter
    ID, DL, phone, email, name, address, amount) and validates structured
    IDs (Verhoeff for Aadhaar). Returns provenance (span + source excerpt)
    for every extracted field. NOT an OCR engine - the caller is expected
    to provide the document text.
    """
    document_id = payload.get("document_id", str(uuid.uuid4()))
    text = payload.get("text") or payload.get("document_text") or ""

    result = extract_fields(document_id, text)
    fields_pyd = [FieldExtraction(**f) for f in result["fields"]]

    return DocumentAnalyzeResponse(
        document_id=document_id,
        extracted_text=result["extracted_text"],
        fields=fields_pyd,
        document_type=result["document_type"],
        summary=result["summary"],
        model_info=result["model_info"],
    )
