from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class LocationBase(BaseModel):
    country: Optional[str] = "India"
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    policeStation: Optional[str] = None

class LocationResponse(LocationBase):
    id: str
    class Config:
        from_attributes = True

class PersonResponse(BaseModel):
    id: str
    name: str
    role: str
    class Config:
        from_attributes = True

class VictimResponse(BaseModel):
    id: str
    name: str
    class Config:
        from_attributes = True

class EvidenceResponse(BaseModel):
    id: str
    evidenceId: str
    description: str
    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    documentId: str
    title: str
    class Config:
        from_attributes = True

class VideoResponse(BaseModel):
    id: str
    videoId: str
    title: str
    class Config:
        from_attributes = True

class VehicleResponse(BaseModel):
    id: str
    vehicleId: str
    makeModel: str
    class Config:
        from_attributes = True

class OrganizationResponse(BaseModel):
    id: str
    organizationId: str
    name: str
    class Config:
        from_attributes = True

class FIRResponse(BaseModel):
    id: str
    firId: str
    firNumber: str
    class Config:
        from_attributes = True

class CaseBase(BaseModel):
    case_number: str
    title: str
    status: str = "OPEN"
    crime_type: str
    priority: str = "MEDIUM"
    officer: str = "Unassigned"
    description: Optional[str] = None

class CaseCreate(CaseBase):
    location: Optional[LocationBase] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    crime_type: Optional[str] = None
    priority: Optional[str] = None
    officer: Optional[str] = None
    description: Optional[str] = None
    location: Optional[LocationBase] = None

class NotificationResponse(BaseModel):
    id: str
    title: str
    description: str
    timestamp: datetime
    read: bool
    case_id: Optional[str] = None
    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    event_type: str
    user_name: str
    description: str
    case_id: Optional[str] = None
    class Config:
        from_attributes = True

class CaseListResponse(CaseBase):
    id: str
    date: datetime
    location: Optional[LocationResponse]
    class Config:
        from_attributes = True

class CaseDetailResponse(CaseBase):
    id: str
    date: datetime
    ai_summary: Optional[str] = None
    location: Optional[LocationResponse]
    suspects: List[PersonResponse] = []
    persons: List[PersonResponse] = []
    victims: List[VictimResponse] = []
    evidences: List[EvidenceResponse] = []
    documents: List[DocumentResponse] = []
    videos: List[VideoResponse] = []
    vehicles: List[VehicleResponse] = []
    organizations: List[OrganizationResponse] = []
    firs: List[FIRResponse] = []

    class Config:
        from_attributes = True

class AnalyzeRequest(BaseModel):
    query: str

class AnalyzeResult(BaseModel):
    type: str
    id: str
    title: str
    description: str
    match_reason: str
    link: str

class AnalyzeResponse(BaseModel):
    summary: str
    results: List[AnalyzeResult]


class VideoReportBase(BaseModel):
    eventType: Optional[str] = "PERSON_DETECTED"
    sourceType: Optional[str] = "UPLOADED_VIDEO"
    sourceName: Optional[str] = ""
    confidence: Optional[float] = 0.0
    className: Optional[str] = "person"
    status: Optional[str] = "NEW"
    caseId: Optional[str] = None
    dataClassification: Optional[str] = "LIVE_VIDEO_EVENT"


class VideoReportResponse(VideoReportBase):
    id: str
    reportId: str
    timestamp: Optional[str] = None
    frameNumber: Optional[int] = None
    trackId: Optional[int] = None
    boundingBox: Optional[Dict[str, Any]] = None
    fullFrameFileId: Optional[str] = None
    personCropFileId: Optional[str] = None
    fullFrameUrl: Optional[str] = None
    personCropUrl: Optional[str] = None
    videoTimestamp: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
