from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# --- Persons ---
class PersonBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None
    aliases: Optional[List[str]] = None
    status: Optional[str] = None
    risk: Optional[str] = None
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
    name: Optional[str] = None
    aliases: Optional[List[str]] = None
    status: Optional[str] = None
    risk: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    national_id: Optional[str] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PersonResponse(PersonBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

# --- Vehicles ---
class VehicleBase(BaseModel):
    license_plate: Optional[str] = None
    registration: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    type: Optional[str] = None
    color: Optional[str] = None
    status: Optional[str] = None
    owner_person_id: Optional[str] = None
    associated_person_ids: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    license_plate: Optional[str] = None
    registration: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    type: Optional[str] = None
    color: Optional[str] = None
    status: Optional[str] = None
    owner_person_id: Optional[str] = None
    associated_person_ids: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class VehicleResponse(VehicleBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
