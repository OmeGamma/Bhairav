from pydantic import BaseModel
from typing import List, Optional
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
        orm_mode = True

class PersonResponse(BaseModel):
    id: str
    name: str
    role: str
    class Config:
        orm_mode = True

class VictimResponse(BaseModel):
    id: str
    name: str
    class Config:
        orm_mode = True

class EvidenceResponse(BaseModel):
    id: str
    evidenceId: str
    description: str
    class Config:
        orm_mode = True

class DocumentResponse(BaseModel):
    id: str
    documentId: str
    title: str
    class Config:
        orm_mode = True

class VideoResponse(BaseModel):
    id: str
    videoId: str
    title: str
    class Config:
        orm_mode = True

class VehicleResponse(BaseModel):
    id: str
    vehicleId: str
    makeModel: str
    class Config:
        orm_mode = True

class OrganizationResponse(BaseModel):
    id: str
    organizationId: str
    name: str
    class Config:
        orm_mode = True

class FIRResponse(BaseModel):
    id: str
    firId: str
    firNumber: str
    class Config:
        orm_mode = True

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
        orm_mode = True

class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    event_type: str
    user_name: str
    description: str
    case_id: Optional[str] = None
    class Config:
        orm_mode = True

class CaseListResponse(CaseBase):
    id: str
    date: datetime
    location: Optional[LocationResponse]
    class Config:
        orm_mode = True

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
        orm_mode = True

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
