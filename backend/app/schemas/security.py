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
class CameraConfiguration(BaseModel):
    fps: Optional[int] = 30
    resolution: Optional[str] = "1920x1080"
    reconnect_attempts: Optional[int] = 5
    reconnect_delay: Optional[int] = 5
    frame_skip: Optional[int] = 0
    processing_enabled: Optional[bool] = True
    recording_enabled: Optional[bool] = False

class CameraBase(BaseModel):
    name: str
    camera_code: Optional[str] = None
    description: Optional[str] = None
    location_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    zone: Optional[str] = None
    source_type: str = "SIMULATED" # VIDEO_FILE, WEBCAM, RTSP, SIMULATED
    status: str = "ACTIVE" # ONLINE, OFFLINE, CONNECTING, RECONNECTING, ERROR, DISABLED, MAINTENANCE
    enabled: bool = True
    stream_reference: Optional[str] = None
    configuration: Optional[CameraConfiguration] = None

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    camera_code: Optional[str] = None
    description: Optional[str] = None
    location_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    zone: Optional[str] = None
    source_type: Optional[str] = None
    status: Optional[str] = None
    enabled: Optional[bool] = None
    stream_reference: Optional[str] = None
    configuration: Optional[CameraConfiguration] = None

class CameraResponse(CameraBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

# --- Camera Sessions ---
class CameraSessionBase(BaseModel):
    camera_id: str
    session_id: Optional[str] = None
    source_type: str
    source_reference: Optional[str] = None
    status: str = "STARTING" # STARTING, RUNNING, PAUSED, STOPPING, STOPPED, ERROR
    frames_processed: int = 0
    frames_dropped: int = 0
    fps: float = 0.0
    resolution: Optional[str] = None
    error: Optional[str] = None
    created_by: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    last_frame_at: Optional[datetime] = None

class CameraSessionCreate(CameraSessionBase):
    pass

class CameraSessionUpdate(BaseModel):
    status: Optional[str] = None
    frames_processed: Optional[int] = None
    frames_dropped: Optional[int] = None
    fps: Optional[float] = None
    resolution: Optional[str] = None
    error: Optional[str] = None
    ended_at: Optional[datetime] = None
    last_frame_at: Optional[datetime] = None

class CameraSessionResponse(CameraSessionBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @model_validator(mode='before')
    @classmethod
    def normalize(cls, data):
        if isinstance(data, dict):
            if '_id' in data:
                data = data.copy()
                data['id'] = str(data.pop('_id'))
        return data

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

# --- Alerts ---
class AlertBase(BaseModel):
    event_id: str
    camera_id: Optional[str] = None
    severity: str
    title: str
    description: str
    status: str = "NEW" # NEW, ACKNOWLEDGED, RESOLVED, DISMISSED
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None

class AlertResponse(AlertBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

# --- Detections ---
class Detection(BaseModel):
    detection_id: Optional[str] = None
    camera_id: Optional[str] = None
    session_id: Optional[str] = None
    timestamp: Optional[datetime] = None
    frame_number: Optional[int] = None
    label: str
    confidence: float
    bounding_box: Optional[List[float]] = None # [x1, y1, x2, y2]
    track_id: Optional[str] = None
    snapshot_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    processing_engine: Optional[str] = None

# --- Events ---
class EventBase(BaseModel):
    event_type: str
    severity: str
    description: Optional[str] = None
    location_id: Optional[str] = None
    camera_id: Optional[str] = None
    session_id: Optional[str] = None
    status: str = "NEW"
    title: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    related_entities_count: Optional[int] = 0
    source: Optional[str] = "SYSTEM"
    timestamp: Optional[datetime] = None
    frame_number: Optional[int] = None
    snapshot_id: Optional[str] = None
    confidence: Optional[float] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    event_type: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    location_id: Optional[str] = None
    camera_id: Optional[str] = None
    session_id: Optional[str] = None
    status: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    related_entities_count: Optional[int] = None
    source: Optional[str] = None
    timestamp: Optional[datetime] = None
    frame_number: Optional[int] = None
    snapshot_id: Optional[str] = None
    confidence: Optional[float] = None

class EventResponse(BaseModel):
    id: str
    event_type: str
    severity: str
    description: Optional[str] = None
    location_id: Optional[str] = None
    camera_id: Optional[str] = None
    session_id: Optional[str] = None
    status: str = "NEW"
    title: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    related_entities_count: Optional[int] = 0
    source: Optional[str] = "SYSTEM"
    timestamp: Optional[datetime] = None
    frame_number: Optional[int] = None
    snapshot_id: Optional[str] = None
    confidence: Optional[float] = None
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
    case_number: Optional[str] = None
    title: str
    description: str
    status: str = "OPEN"
    priority: str = "MEDIUM"
    classification: str = "INTERNAL"
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    assigned_investigators: Optional[List[str]] = None
    related_entities: Optional[List[Dict[str, str]]] = None
    related_evidence: Optional[List[str]] = None

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    case_number: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    classification: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    assigned_investigators: Optional[List[str]] = None
    related_entities: Optional[List[Dict[str, str]]] = None
    related_evidence: Optional[List[str]] = None

class CaseResponse(CaseBase):
    id: str
    created_at: datetime
    updated_at: datetime

    @model_validator(mode='before')
    @classmethod
    def normalize(cls, data):
        if isinstance(data, dict):
            if '_id' in data:
                data = data.copy()
                data['id'] = str(data.pop('_id'))
        return data

    model_config = ConfigDict(extra='ignore')
