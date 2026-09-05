"""
Bhairav AI Inference Schemas

Data models for AI/ML inference results.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# --- Detection Results ---

class BoundingBox(BaseModel):
    """Bounding box coordinates."""
    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    """Object detection result."""
    detection_id: str
    camera_id: str
    session_id: str
    frame_number: int
    timestamp: datetime
    label: str
    confidence: float
    bbox: BoundingBox
    model_name: str
    model_version: str


# --- Tracking Results ---

class TrackPoint(BaseModel):
    """Single point in trajectory."""
    x: float
    y: float
    timestamp: datetime


class Track(BaseModel):
    """Object track across multiple frames."""
    track_id: str
    camera_id: str
    session_id: str
    label: str
    first_seen: datetime
    last_seen: datetime
    frames_seen: int
    trajectory: List[TrackPoint]
    current_bbox: BoundingBox
    confidence: float
    status: str = "ACTIVE"  # ACTIVE, LOST, ENDED


# --- Face Detection ---

class FaceDetection(BaseModel):
    """Face detection result."""
    face_detection_id: str
    camera_id: str
    session_id: str
    frame_number: int
    timestamp: datetime
    bbox: BoundingBox
    confidence: float
    model_name: str


# --- ANPR Results ---

class ANPRResult(BaseModel):
    """Automatic Number Plate Recognition result."""
    anpr_id: str
    camera_id: str
    session_id: str
    frame_number: int
    timestamp: datetime
    plate_text: str
    raw_ocr_text: str
    ocr_confidence: float
    bbox: BoundingBox
    vehicle_track_id: Optional[str] = None
    vehicle_class: Optional[str] = None
    confidence_level: str = "HIGH"  # HIGH, MEDIUM, LOW


# --- Virtual Fence Events ---

class VirtualZone(BaseModel):
    """Virtual security zone."""
    zone_id: str
    camera_id: str
    name: str
    type: str  # POLYGON, LINE, RECTANGLE
    coordinates: List[List[float]]
    enabled: bool = True
    severity: str = "HIGH"


class IntrusionEvent(BaseModel):
    """Intrusion detection event."""
    event_id: str
    camera_id: str
    zone_id: str
    track_id: str
    event_type: str  # ENTER, EXIT, LINE_CROSSING
    timestamp: datetime
    confidence: float
    bbox: BoundingBox
    severity: str


# --- Rule Engine Events ---

class RuleEvent(BaseModel):
    """Rule-based security event."""
    event_id: str
    camera_id: str
    track_id: Optional[str] = None
    event_type: str
    risk_score: int
    severity: str
    timestamp: datetime
    description: str
    factors: List[str]
    bbox: Optional[BoundingBox] = None


# --- Complete Inference Result ---

class InferenceResult(BaseModel):
    """Complete AI inference result for a frame."""
    camera_id: str
    session_id: str
    frame_number: int
    timestamp: datetime
    detections: List[Detection]
    tracks: List[Track]
    face_detections: List[FaceDetection]
    anpr_results: List[ANPRResult]
    fence_events: List[IntrusionEvent]
    rule_events: List[RuleEvent]
    metrics: Dict[str, Any]
    model_info: Dict[str, Any]


# --- Model Status ---

class ModelStatus(BaseModel):
    """AI model status information."""
    model_name: str
    model_version: str
    task: str
    device: str
    status: str  # READY, LOADING, ERROR
    classes: List[str]
    confidence_threshold: float
    last_loaded: Optional[datetime] = None
