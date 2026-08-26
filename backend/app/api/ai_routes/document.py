from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.schemas.ai_schemas import DocumentAnalyzeResponse, FieldExtraction
from app.core.config import settings
import uuid

router = APIRouter()

@router.post("/document/analyze", response_model=DocumentAnalyzeResponse)
async def analyze_document(payload: Dict[str, Any]):
    """
    Mock AI Service for Document OCR and Understanding.
    """
    document_id = payload.get("document_id", str(uuid.uuid4()))
    
    response = DocumentAnalyzeResponse(
        document_id=document_id,
        extracted_text="MOCK DOCUMENT TEXT\nNAME: JOHN DOE\nID: 123456",
        fields=[
            FieldExtraction(name="Name", value="JOHN DOE", confidence=0.95),
            FieldExtraction(name="ID Number", value="123456", confidence=0.88),
        ],
        model_info={
            "model": settings.ocr_model,
            "version": "1.0",
            "processing_mode": "synthetic"
        }
    )
    return response
