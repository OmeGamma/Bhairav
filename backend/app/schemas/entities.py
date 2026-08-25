from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

# --- Persons ---
class PersonBase(BaseModel):
    first_name: str
    last_name: str
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    national_id: Optional[str] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PersonCreate(PersonBase):
    pass

class PersonUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    national_id: Optional[str] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PersonResponse(PersonBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

# --- Vehicles ---
class VehicleBase(BaseModel):
    license_plate: str
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    owner_person_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    license_plate: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    owner_person_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class VehicleResponse(VehicleBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
