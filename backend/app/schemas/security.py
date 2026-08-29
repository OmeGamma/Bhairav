from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Locations ---
class LocationBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    type: str
    status: str = "ACTIVE"
    metadata: Optional[Dict[str, Any]] = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    type: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class LocationResponse(LocationBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True

# --- Cameras ---
class CameraBase(BaseModel):
    name: str
    location_id: str
    status: str = "ACTIVE"
    stream_reference: Optional[str] = None

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location_id: Optional[str] = None
    status: Optional[str] = None
    stream_reference: Optional[str] = None

class CameraResponse(CameraBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

# --- Security Zones ---
class SecurityZoneBase(BaseModel):
    name: str
    type: str # SAFE, MONITORED, RESTRICTED
    coordinates: List[List[float]] # Polygon coordinates
    status: str = "ACTIVE"

class SecurityZoneCreate(SecurityZoneBase):
    pass

class SecurityZoneUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    coordinates: Optional[List[List[float]]] = None
    status: Optional[str] = None

class SecurityZoneResponse(SecurityZoneBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True

# --- Events ---
class EventBase(BaseModel):
    event_type: str
    severity: str
    description: Optional[str] = None
    location_id: Optional[str] = None
    camera_id: Optional[str] = None
    status: str = "NEW"
    title: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    related_entities_count: Optional[int] = 0
    source: Optional[str] = "SYSTEM"
    timestamp: Optional[datetime] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    event_type: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    location_id: Optional[str] = None
    camera_id: Optional[str] = None
    status: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    related_entities_count: Optional[int] = None
    source: Optional[str] = None
    timestamp: Optional[datetime] = None

class EventResponse(BaseModel):
    id: str
    event_type: str
    severity: str
    description: Optional[str] = None
    location_id: Optional[str] = None
    camera_id: Optional[str] = None
    status: str = "NEW"
    title: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    related_entities_count: Optional[int] = 0
    source: Optional[str] = "SYSTEM"
    timestamp: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(extra='ignore')

    @model_validator(mode='before')
    @classmethod
    def normalize(cls, data):
        if isinstance(data, dict):
            if '_id' in data:
                data = data.copy()
                data['id'] = str(data.pop('_id'))
            if data.get('event_type') and not data.get('type'):
                data['type'] = data['event_type']
            if data.get('camera_id') and not data.get('cameraId'):
                data['cameraId'] = data['camera_id']
        return data

# --- Incidents ---
class IncidentBase(BaseModel):
    title: str
    description: str
    severity: str
    status: str = "OPEN"
    location_id: Optional[str] = None
    related_event_ids: List[str] = []

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    location_id: Optional[str] = None
    related_event_ids: Optional[List[str]] = None

class IncidentResponse(IncidentBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

# --- Cases ---
class CaseBase(BaseModel):
    title: str
    description: str
    status: str = "OPEN"
    priority: str = "MEDIUM"
    related_entities: List[Dict[str, str]] = [] # e.g., [{"type": "incident", "id": "123"}]

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    related_entities: Optional[List[Dict[str, str]]] = None

class CaseResponse(CaseBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
