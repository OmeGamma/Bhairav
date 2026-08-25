from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Vision / Video Intelligence ---

class BBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class Detection(BaseModel):
    type: str
    confidence: float
    bbox: BBox
    track_id: Optional[str] = None

class VideoEvent(BaseModel):
    type: str
    severity: str

class VideoAnalyzeResponse(BaseModel):
    camera_id: str
    timestamp: str
    detections: List[Detection]
    event: Optional[VideoEvent] = None
    model_info: Dict[str, Any]

# --- Document / OCR ---

class FieldExtraction(BaseModel):
    name: str
    value: str
    confidence: float

class DocumentAnalyzeResponse(BaseModel):
    document_id: str
    extracted_text: str
    fields: List[FieldExtraction]
    model_info: Dict[str, Any]

# --- Identity / Verification ---

class VerificationCheck(BaseModel):
    name: str
    status: str # PASS, FAIL, REVIEW

class VerificationResponse(BaseModel):
    verification_id: str
    status: str # PASS, FAIL, REVIEW_REQUIRED
    confidence: float
    checks: List[VerificationCheck]
    reasons: List[str]
    evidence: Optional[Dict[str, Any]] = None
    model_info: Dict[str, Any]

# --- Network Intelligence ---

class NetworkIndicator(BaseModel):
    type: str
    level: str # LOW, MEDIUM, HIGH
    evidence_count: int

class NetworkAnalyzeResponse(BaseModel):
    entity_id: str
    indicators: List[NetworkIndicator]
    related_entities: List[str]
    timeline: List[Dict[str, Any]]
    explanation: str

# --- Welfare Analytics ---

class WelfareResponse(BaseModel):
    personnel_id: str
    status: str # NORMAL, ATTENTION, SUPPORT RECOMMENDED, URGENT HUMAN REVIEW
    indicators: List[Dict[str, Any]]
    model_info: Dict[str, Any]

# --- AI Assistant (Chat) ---

class ChatRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    summary: str
    key_information: List[str]
    evidence: List[str]
    analysis: str
    limitations: str
    actions: List[str]
