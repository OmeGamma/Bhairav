from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

JOB_TYPES = [
    "FILE_VALIDATION",
    "TEXT_EXTRACTION",
    "OCR",
    "ENTITY_EXTRACTION",
    "CDR_INGESTION",
    "FINANCIAL_INGESTION",
    "VIDEO_ANALYSIS",
    "REPORT_GENERATION",
]

JOB_STATUSES = ["QUEUED", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"]


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
