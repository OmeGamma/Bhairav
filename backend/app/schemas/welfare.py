from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

# --- Personnel ---
class PersonnelBase(BaseModel):
    user_id: str
    rank: Optional[str] = None
    unit: Optional[str] = None
    deployment_status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PersonnelCreate(PersonnelBase):
    pass

class PersonnelUpdate(BaseModel):
    rank: Optional[str] = None
    unit: Optional[str] = None
    deployment_status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PersonnelResponse(PersonnelBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

# --- Welfare Check-in ---
class WelfareCheckInBase(BaseModel):
    personnel_id: str
    wellbeing_status: str # GOOD, FAIR, POOR, CRISIS
    contributing_factor: Optional[str] = None
    optional_message: Optional[str] = None
    is_private: bool = True

class WelfareCheckInCreate(WelfareCheckInBase):
    pass

class WelfareCheckInResponse(WelfareCheckInBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
