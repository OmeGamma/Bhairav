from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

# --- Documents ---
class DocumentBase(BaseModel):
    document_type: str
    storage_reference: str
    uploaded_by: str
    status: str = "UPLOADED"
    metadata: Optional[Dict[str, Any]] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    document_type: Optional[str] = None
    storage_reference: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentResponse(DocumentBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

# --- Verification ---
class VerificationBase(BaseModel):
    document_id: str
    entity_id: Optional[str] = None
    entity_type: Optional[str] = None
    status: str = "PENDING"
    result_metadata: Optional[Dict[str, Any]] = None

class VerificationCreate(VerificationBase):
    pass

class VerificationUpdate(BaseModel):
    status: Optional[str] = None
    result_metadata: Optional[Dict[str, Any]] = None

class VerificationResponse(VerificationBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
