from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

# --- Enums / Constants ---
EVIDENCE_SOURCE_TYPES = [
    "FIR",
    "POLICE_REPORT",
    "CDR",
    "FINANCIAL_RECORD",
    "SURVEILLANCE_REPORT",
    "INTELLIGENCE_REPORT",
    "SOCIAL_MEDIA_EXPORT",
    "CRIMINAL_HISTORY",
    "VEHICLE_RECORD",
    "IDENTITY_DOCUMENT",
    "CCTV_VIDEO",
    "CCTV_SNAPSHOT",
    "AUDIO",
    "IMAGE",
    "OTHER",
]

PROCESSING_STATUSES = [
    "UPLOADED",
    "VALIDATING",
    "QUEUED",
    "PROCESSING",
    "PROCESSED",
    "PARTIALLY_PROCESSED",
    "FAILED",
    "QUARANTINED",
]

CLASSIFICATIONS = ["PUBLIC", "INTERNAL", "RESTRICTED", "CONFIDENTIAL"]


# --- Evidence File ---
class EvidenceFileBase(BaseModel):
    original_filename: str
    mime_type: str
    extension: str
    size_bytes: int
    storage_provider: str = "local"
    storage_key: str
    checksum_sha256: Optional[str] = None

    source_type: str = "OTHER"
    classification: str = "INTERNAL"
    description: Optional[str] = None
    tags: Optional[List[str]] = None

    case_id: Optional[str] = None
    investigation_id: Optional[str] = None

    processing_status: str = "UPLOADED"
    processing_error: Optional[str] = None
    processed_at: Optional[datetime] = None

    version: int = 1
    parent_file_id: Optional[str] = None
    is_original: bool = True
    is_deleted: bool = False


class EvidenceFileCreate(EvidenceFileBase):
    uploaded_by: str


class EvidenceFileUpdate(BaseModel):
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    case_id: Optional[str] = None
    investigation_id: Optional[str] = None
    classification: Optional[str] = None
    processing_status: Optional[str] = None
    processing_error: Optional[str] = None
    processed_at: Optional[datetime] = None
    is_deleted: Optional[bool] = None


class EvidenceFileResponse(EvidenceFileBase):
    id: str
    uploaded_by: str
    uploaded_at: datetime
    updated_at: datetime
    created_at: datetime


# --- Evidence Version ---
class EvidenceVersionBase(BaseModel):
    file_id: str
    version: int
    stored_filename: str
    storage_key: str
    size_bytes: int
    checksum_sha256: Optional[str] = None
    uploaded_by: str
    uploaded_at: datetime
    is_original: bool = False
    change_description: Optional[str] = None


class EvidenceVersionResponse(EvidenceVersionBase):
    id: str


# --- Evidence Audit ---
class EvidenceAuditBase(BaseModel):
    file_id: str
    actor_user_id: str
    action: str
    resource_type: str = "evidence_file"
    resource_id: str
    metadata: Optional[Dict[str, Any]] = None


class EvidenceAuditResponse(EvidenceAuditBase):
    id: str
    timestamp: datetime


# --- Processing Job ---
class ProcessingJobBase(BaseModel):
    file_id: str
    job_type: str
    status: str = "QUEUED"
    progress: float = 0.0
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_by: str
    metadata: Optional[Dict[str, Any]] = None


class ProcessingJobCreate(ProcessingJobBase):
    pass


class ProcessingJobUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[float] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None


class ProcessingJobResponse(ProcessingJobBase):
    id: str
    created_at: datetime


# --- Ingestion Result (CDR / Financial) ---
class IngestionResultBase(BaseModel):
    file_id: str
    job_id: Optional[str] = None
    total_records: int = 0
    valid_records: int = 0
    invalid_records: int = 0
    duplicate_records: int = 0
    warnings: Optional[List[str]] = None
    errors: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class IngestionResultCreate(IngestionResultBase):
    pass


class IngestionResultResponse(IngestionResultBase):
    id: str
    created_at: datetime


# --- Entity Extraction Result ---
class ExtractedEntityBase(BaseModel):
    file_id: str
    job_id: Optional[str] = None
    entity_type: str
    canonical_name: str
    aliases: Optional[List[str]] = None
    attributes: Optional[Dict[str, Any]] = None
    confidence: float = 0.0
    extraction_method: str = "regex"
    source_page: Optional[int] = None
    source_text: Optional[str] = None


class ExtractedEntityResponse(ExtractedEntityBase):
    id: str
    created_at: datetime


class ExtractedRelationshipBase(BaseModel):
    file_id: str
    job_id: Optional[str] = None
    source_entity_id: Optional[str] = None
    target_entity_id: Optional[str] = None
    relationship_type: str
    weight: float = 0.5
    confidence: float = 0.0
    source_record_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ExtractedRelationshipResponse(ExtractedRelationshipBase):
    id: str
    created_at: datetime
