from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SupportRequestBase(BaseModel):
    request_type: str # WELFARE, MEDICAL, WORKLOAD, RECOVERY, FAMILY, OTHER
    description: str
    status: str = "PENDING"
    priority: str = "MEDIUM"
    personnel_id: str
    assigned_to: Optional[str] = None

class SupportRequestCreate(SupportRequestBase):
    pass

class SupportRequestUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None

class SupportRequestResponse(SupportRequestBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
