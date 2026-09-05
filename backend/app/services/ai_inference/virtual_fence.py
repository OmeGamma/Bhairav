"""
Bhairav Virtual Fence

Implements virtual security zones and intrusion detection.
Supports polygon, line, and rectangle zones with geometric calculations.
"""

from typing import List, Dict, Any, Optional
import logging
import numpy as np
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class VirtualZone:
    """Virtual security zone definition."""
    
    def __init__(
        self,
        zone_id: str,
        camera_id: str,
        name: str,
        zone_type: str,
        coordinates: List[List[float]],
        enabled: bool = True,
        severity: str = "HIGH"
    ):
        self.zone_id = zone_id
        self.camera_id = camera_id
        self.name = name
        self.zone_type = zone_type  # POLYGON, LINE, RECTANGLE
        self.coordinates = coordinates
        self.enabled = enabled
        self.severity = severity
    
    def model_dump(self) -> Dict[str, Any]:
        return {
            "zone_id": self.zone_id,
            "camera_id": self.camera_id,
            "name": self.name,
            "type": self.zone_type,
            "coordinates": self.coordinates,
            "enabled": self.enabled,
            "severity": self.severity
        }


class IntrusionEvent:
    """Intrusion detection event."""
    
    def __init__(
        self,
        zone_id: str,
        camera_id: str,
        track_id: str,
        event_type: str,
        bbox: tuple,
        confidence: float,
        severity: str
    ):
        self.event_id = str(uuid.uuid4())
        self.zone_id = zone_id
        self.camera_id = camera_id
        self.track_id = track_id
        self.event_type = event_type  # ENTER, EXIT, LINE_CROSSING
        self.timestamp = datetime.utcnow()
        self.bbox = bbox
        self.confidence = confidence
        self.severity = severity
    
    def model_dump(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "zone_id": self.zone_id,
            "camera_id": self.camera_id,
            "track_id": self.track_id,
            "event_type": self.event_type,
            "timestamp": self.timestamp.isoformat(),
            "bbox": {
                "x1": self.bbox[0],
                "y1": self.bbox[1],
                "x2": self.bbox[2],
                "y2": self.bbox[3]
            },
            "confidence": self.confidence,
            "severity": self.severity
        }


class VirtualFence:
    """
    Virtual fence and intrusion detection system.
    
    Supports:
    - Polygon zones (arbitrary shapes)
    - Line crossing detection
    - Rectangle zones
    - Entry/exit detection
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
        # Configuration
        self.cooldown_seconds = config.get("cooldown_seconds", 10)
        self.min_confidence = config.get("min_confidence", 0.5)
        
        # Track last event times for cooldown
        self.last_events: Dict[str, datetime] = {}
    
    def _point_in_polygon(self, point: tuple, polygon: List[List[float]]) -> bool:
        """
        Check if point is inside polygon using ray casting algorithm.
        
        Args:
            point: (x, y) coordinates
            polygon: List of (x, y) polygon vertices
        
        Returns:
            True if point is inside polygon
        """
        x, y = point
        n = len(polygon)
        inside = False
        
        p1x, p1y = polygon[0]
        for i in range(n + 1):
            p2x, p2y = polygon[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        
        return inside
    
    def _point_in_rectangle(self, point: tuple, rect: List[List[float]]) -> bool:
        """Check if point is inside rectangle."""
        x, y = point
        x1, y1 = rect[0]
        x2, y2 = rect[2]
        return x1 <= x <= x2 and y1 <= y <= y2
    
    def _line_crossing(self, old_point: tuple, new_point: tuple, line: List[List[float]]) -> Optional[str]:
        """
        Check if track crossed a virtual line.
        
        Args:
            old_point: Previous position (x, y)
            new_point: Current position (x, y)
            line: Line defined as [(x1, y1), (x2, y2)]
        
        Returns:
            "CROSSING" if line was crossed, None otherwise
        """
        # Line equation: ax + by + c = 0
        x1, y1 = line[0]
        x2, y2 = line[1]
        
        a = y2 - y1
        b = x1 - x2
        c = x2 * y1 - x1 * y2
        
        # Calculate line values for old and new points
        old_value = a * old_point[0] + b * old_point[1] + c
        new_value = a * new_point[0] + b * new_point[1] + c
        
        # Check if signs are different (crossing occurred)
        if old_value * new_value < 0:
            return "CROSSING"
        
        return None
    
    def _get_bbox_center(self, bbox: tuple) -> tuple:
        """Get center point of bounding box."""
        return ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)
    
    def _check_cooldown(self, track_id: str, zone_id: str) -> bool:
        """Check if event is in cooldown period."""
        key = f"{track_id}_{zone_id}"
        if key in self.last_events:
            elapsed = (datetime.utcnow() - self.last_events[key]).total_seconds()
            if elapsed < self.cooldown_seconds:
                return True  # In cooldown
        
        return False
    
    async def evaluate(
        self,
        track: Any,
        virtual_zones: List[Dict[str, Any]],
        camera_id: str,
        timestamp: datetime
    ) -> Optional[IntrusionEvent]:
        """
        Evaluate if track has triggered any virtual fence events.
        
        Args:
            track: Track object with trajectory and current position
            virtual_zones: List of virtual zone configurations
            camera_id: Camera identifier
            timestamp: Current timestamp
        
        Returns:
            IntrusionEvent if intrusion detected, None otherwise
        """
        try:
            # Get current position
            current_bbox = track.current_bbox if hasattr(track, 'current_bbox') else (
                track.model_dump()["current_bbox"]["x1"],
                track.model_dump()["current_bbox"]["y1"],
                track.model_dump()["current_bbox"]["x2"],
                track.model_dump()["current_bbox"]["y2"]
            )
            current_center = self._get_bbox_center(current_bbox)
            
            track_id = track.track_id if hasattr(track, 'track_id') else track.model_dump()["track_id"]
            
            # Check each virtual zone
            for zone_config in virtual_zones:
                if not zone_config.get("enabled", True):
                    continue
                
                zone_id = zone_config["zone_id"]
                zone_type = zone_config["type"]
                coordinates = zone_config["coordinates"]
                severity = zone_config.get("severity", "HIGH")
                
                # Check cooldown
                if self._check_cooldown(track_id, zone_id):
                    continue
                
                # Evaluate based on zone type
                if zone_type == "POLYGON":
                    if self._point_in_polygon(current_center, coordinates):
                        event = IntrusionEvent(
                            zone_id=zone_id,
                            camera_id=camera_id,
                            track_id=track_id,
                            event_type="ENTER",
                            bbox=current_bbox,
                            confidence=track.confidence if hasattr(track, 'confidence') else track.model_dump()["confidence"],
                            severity=severity
                        )
                        self.last_events[f"{track_id}_{zone_id}"] = datetime.utcnow()
                        return event
                
                elif zone_type == "RECTANGLE":
                    if self._point_in_rectangle(current_center, coordinates):
                        event = IntrusionEvent(
                            zone_id=zone_id,
                            camera_id=camera_id,
                            track_id=track_id,
                            event_type="ENTER",
                            bbox=current_bbox,
                            confidence=track.confidence if hasattr(track, 'confidence') else track.model_dump()["confidence"],
                            severity=severity
                        )
                        self.last_events[f"{track_id}_{zone_id}"] = datetime.utcnow()
                        return event
                
                elif zone_type == "LINE":
                    # Check if track crossed the line
                    if hasattr(track, 'trajectory') and len(track.trajectory) >= 2:
                        trajectory = track.trajectory if hasattr(track, 'trajectory') else track.model_dump()["trajectory"]
                        old_point = (trajectory[-2]["x"], trajectory[-2]["y"])
                        new_point = (trajectory[-1]["x"], trajectory[-1]["y"])
                        
                        crossing = self._line_crossing(old_point, new_point, coordinates)
                        if crossing:
                            event = IntrusionEvent(
                                zone_id=zone_id,
                                camera_id=camera_id,
                                track_id=track_id,
                                event_type="LINE_CROSSING",
                                bbox=current_bbox,
                                confidence=track.confidence if hasattr(track, 'confidence') else track.model_dump()["confidence"],
                                severity=severity
                            )
                            self.last_events[f"{track_id}_{zone_id}"] = datetime.utcnow()
                            return event
            
            return None
            
        except Exception as e:
            logger.error(f"Virtual fence evaluation error: {e}")
            return None
    
    def get_info(self) -> Dict[str, Any]:
        """Get virtual fence information."""
        return {
            "model_name": "VirtualFence",
            "model_version": "1.0",
            "task": "intrusion_detection",
            "device": "CPU",
            "status": "READY",
            "cooldown_seconds": self.cooldown_seconds,
            "min_confidence": self.min_confidence,
            "supported_zone_types": ["POLYGON", "LINE", "RECTANGLE"]
        }
