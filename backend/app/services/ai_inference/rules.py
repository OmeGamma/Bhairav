"""
Bhairav Rule Engine

Implements rule-based suspicious activity detection and risk scoring.
Combines multiple signals to generate security events with transparent scoring.
"""

from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, time
import uuid

logger = logging.getLogger(__name__)


class RuleEvent:
    """Rule-based security event."""
    
    def __init__(
        self,
        camera_id: str,
        track_id: Optional[str],
        event_type: str,
        risk_score: int,
        severity: str,
        description: str,
        factors: List[str],
        bbox: Optional[tuple] = None
    ):
        self.event_id = str(uuid.uuid4())
        self.camera_id = camera_id
        self.track_id = track_id
        self.event_type = event_type
        self.risk_score = risk_score
        self.severity = severity
        self.timestamp = datetime.utcnow()
        self.description = description
        self.factors = factors
        self.bbox = bbox
    
    def model_dump(self) -> Dict[str, Any]:
        result = {
            "event_id": self.event_id,
            "camera_id": self.camera_id,
            "track_id": self.track_id,
            "event_type": self.event_type,
            "risk_score": self.risk_score,
            "severity": self.severity,
            "timestamp": self.timestamp.isoformat(),
            "description": self.description,
            "factors": self.factors
        }
        
        if self.bbox:
            result["bbox"] = {
                "x1": self.bbox[0],
                "y1": self.bbox[1],
                "x2": self.bbox[2],
                "y2": self.bbox[3]
            }
        
        return result


class RuleEngine:
    """
    Rule-based suspicious activity detection engine.
    
    Combines multiple signals:
    - Restricted zone intrusion
    - Night movement
    - Unusual dwell time
    - Line crossing
    - Multiple persons in restricted area
    - Vehicle stopped in restricted area
    - Repeated movement patterns
    
    Risk scoring is transparent and configurable.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
        # Risk scoring weights (configurable)
        self.weights = config.get("weights", {
            "intrusion": 50,
            "night_movement": 20,
            "restricted_zone": 20,
            "repeated_event": 10,
            "line_crossing": 15,
            "unusual_dwell": 25,
            "multiple_persons": 30,
            "vehicle_stopped": 35
        })
        
        # Night hours (configurable)
        self.night_start = config.get("night_start", "20:00")
        self.night_end = config.get("night_end", "05:00")
        
        # Thresholds
        self.dwell_time_threshold = config.get("dwell_time_threshold", 30)  # seconds
        self.cooldown_seconds = config.get("cooldown_seconds", 15)
        
        # Event tracking for cooldown
        self.last_events: Dict[str, datetime] = {}
    
    def _is_night_time(self, timestamp: datetime) -> bool:
        """Check if timestamp is within configured night hours."""
        current_time = timestamp.time()
        start = datetime.strptime(self.night_start, "%H:%M").time()
        end = datetime.strptime(self.night_end, "%H:%M").time()
        
        if start <= end:
            # Same day (e.g., 20:00 to 05:00 doesn't make sense, assume 20:00 to 23:59)
            return start <= current_time <= end
        else:
            # Crosses midnight (e.g., 20:00 to 05:00)
            return current_time >= start or current_time <= end
    
    def _calculate_dwell_time(self, track: Any) -> float:
        """Calculate how long track has been in current area."""
        if hasattr(track, 'first_seen') and hasattr(track, 'last_seen'):
            duration = (track.last_seen - track.first_seen).total_seconds()
            return duration
        elif hasattr(track, 'model_dump'):
            data = track.model_dump()
            first_seen = datetime.fromisoformat(data["first_seen"])
            last_seen = datetime.fromisoformat(data["last_seen"])
            return (last_seen - first_seen).total_seconds()
        return 0.0
    
    def _get_track_speed(self, track: Any) -> float:
        """Calculate relative speed from trajectory."""
        try:
            if hasattr(track, 'trajectory') and len(track.trajectory) >= 2:
                trajectory = track.trajectory
            else:
                trajectory = track.model_dump()["trajectory"]
                if len(trajectory) < 2:
                    return 0.0
            
            # Calculate speed from last two points
            p1 = trajectory[-2]
            p2 = trajectory[-1]
            
            dx = p2["x"] - p1["x"]
            dy = p2["y"] - p1["y"]
            distance = (dx**2 + dy**2)**0.5
            
            t1 = datetime.fromisoformat(p1["timestamp"]) if isinstance(p1["timestamp"], str) else p1["timestamp"]
            t2 = datetime.fromisoformat(p2["timestamp"]) if isinstance(p2["timestamp"], str) else p2["timestamp"]
            
            time_diff = (t2 - t1).total_seconds()
            
            if time_diff > 0:
                return distance / time_diff  # pixels per second
        
        except Exception as e:
            logger.error(f"Speed calculation error: {e}")
        
        return 0.0
    
    def _check_cooldown(self, track_id: str, event_type: str) -> bool:
        """Check if event is in cooldown period."""
        key = f"{track_id}_{event_type}"
        if key in self.last_events:
            elapsed = (datetime.utcnow() - self.last_events[key]).total_seconds()
            if elapsed < self.cooldown_seconds:
                return True  # In cooldown
        
        return False
    
    async def evaluate(
        self,
        tracks: List[Any],
        detections: List[Any],
        metadata: Dict[str, Any],
        camera_id: str,
        timestamp: datetime
    ) -> List[RuleEvent]:
        """
        Evaluate tracks and detections against security rules.
        
        Args:
            tracks: List of track objects
            detections: List of detection objects
            metadata: Camera and environment metadata
            camera_id: Camera identifier
            timestamp: Current timestamp
        
        Returns:
            List of RuleEvent objects
        """
        events = []
        
        try:
            # Check each track against rules
            for track in tracks:
                track_id = track.track_id if hasattr(track, 'track_id') else track.model_dump()["track_id"]
                track_label = track.label if hasattr(track, 'label') else track.model_dump()["label"]
                
                # Rule 1: Night Movement
                if self._is_night_time(timestamp):
                    if self._check_cooldown(track_id, "night_movement"):
                        continue
                    
                    event = self._evaluate_night_movement(track, camera_id, timestamp)
                    if event:
                        self.last_events[f"{track_id}_night_movement"] = datetime.utcnow()
                        events.append(event)
                
                # Rule 2: Unusual Dwell Time
                dwell_time = self._calculate_dwell_time(track)
                if dwell_time > self.dwell_time_threshold:
                    if self._check_cooldown(track_id, "unusual_dwell"):
                        continue
                    
                    event = self._evaluate_dwell_time(track, dwell_time, camera_id, timestamp)
                    if event:
                        self.last_events[f"{track_id}_unusual_dwell"] = datetime.utcnow()
                        events.append(event)
                
                # Rule 3: Restricted Zone (from metadata)
                if metadata.get("restricted_zone"):
                    if self._check_cooldown(track_id, "restricted_zone"):
                        continue
                    
                    event = self._evaluate_restricted_zone(track, camera_id, timestamp)
                    if event:
                        self.last_events[f"{track_id}_restricted_zone"] = datetime.utcnow()
                        events.append(event)
                
                # Rule 4: Vehicle Stopped in Restricted Area
                if track_label in ["car", "truck", "bus", "motorcycle"]:
                    speed = self._get_track_speed(track)
                    if speed < 1.0 and metadata.get("restricted_zone"):
                        if self._check_cooldown(track_id, "vehicle_stopped"):
                            continue
                        
                        event = self._evaluate_vehicle_stopped(track, camera_id, timestamp)
                        if event:
                            self.last_events[f"{track_id}_vehicle_stopped"] = datetime.utcnow()
                            events.append(event)
            
            # Rule 5: Multiple Persons in Restricted Area
            person_tracks = [t for t in tracks if (t.label if hasattr(t, 'label') else t.model_dump()["label"]) == "person"]
            if len(person_tracks) >= 3 and metadata.get("restricted_zone"):
                if not self._check_cooldown("multiple", "multiple_persons"):
                    event = self._evaluate_multiple_persons(person_tracks, camera_id, timestamp)
                    if event:
                        self.last_events["multiple_multiple_persons"] = datetime.utcnow()
                        events.append(event)
            
            return events
            
        except Exception as e:
            logger.error(f"Rule engine evaluation error: {e}")
            return []
    
    def _evaluate_night_movement(self, track: Any, camera_id: str, timestamp: datetime) -> Optional[RuleEvent]:
        """Evaluate night movement rule."""
        risk_score = self.weights["night_movement"]
        severity = self._get_severity(risk_score)
        
        return RuleEvent(
            camera_id=camera_id,
            track_id=track.track_id if hasattr(track, 'track_id') else track.model_dump()["track_id"],
            event_type="NIGHT_MOVEMENT",
            risk_score=risk_score,
            severity=severity,
            description=f"Movement detected during night hours ({self.night_start} - {self.night_end})",
            factors=["night_time", "movement"],
            bbox=track.current_bbox if hasattr(track, 'current_bbox') else None
        )
    
    def _evaluate_dwell_time(self, track: Any, dwell_time: float, camera_id: str, timestamp: datetime) -> Optional[RuleEvent]:
        """Evaluate unusual dwell time rule."""
        risk_score = self.weights["unusual_dwell"]
        severity = self._get_severity(risk_score)
        
        return RuleEvent(
            camera_id=camera_id,
            track_id=track.track_id if hasattr(track, 'track_id') else track.model_dump()["track_id"],
            event_type="UNUSUAL_DWELL",
            risk_score=risk_score,
            severity=severity,
            description=f"Unusual dwell time detected: {dwell_time:.1f} seconds",
            factors=["dwell_time", f"{dwell_time:.1f}s"],
            bbox=track.current_bbox if hasattr(track, 'current_bbox') else None
        )
    
    def _evaluate_restricted_zone(self, track: Any, camera_id: str, timestamp: datetime) -> Optional[RuleEvent]:
        """Evaluate restricted zone rule."""
        risk_score = self.weights["restricted_zone"]
        severity = self._get_severity(risk_score)
        
        return RuleEvent(
            camera_id=camera_id,
            track_id=track.track_id if hasattr(track, 'track_id') else track.model_dump()["track_id"],
            event_type="RESTRICTED_ZONE",
            risk_score=risk_score,
            severity=severity,
            description="Object detected in restricted zone",
            factors=["restricted_zone", "presence"],
            bbox=track.current_bbox if hasattr(track, 'current_bbox') else None
        )
    
    def _evaluate_vehicle_stopped(self, track: Any, camera_id: str, timestamp: datetime) -> Optional[RuleEvent]:
        """Evaluate vehicle stopped in restricted area rule."""
        risk_score = self.weights["vehicle_stopped"]
        severity = self._get_severity(risk_score)
        
        return RuleEvent(
            camera_id=camera_id,
            track_id=track.track_id if hasattr(track, 'track_id') else track.model_dump()["track_id"],
            event_type="VEHICLE_STOPPED",
            risk_score=risk_score,
            severity=severity,
            description="Vehicle stopped in restricted area",
            factors=["vehicle", "stopped", "restricted_zone"],
            bbox=track.current_bbox if hasattr(track, 'current_bbox') else None
        )
    
    def _evaluate_multiple_persons(self, tracks: List[Any], camera_id: str, timestamp: datetime) -> Optional[RuleEvent]:
        """Evaluate multiple persons in restricted area rule."""
        risk_score = self.weights["multiple_persons"]
        severity = self._get_severity(risk_score)
        
        track_ids = [t.track_id if hasattr(t, 'track_id') else t.model_dump()["track_id"] for t in tracks]
        
        return RuleEvent(
            camera_id=camera_id,
            track_id=None,
            event_type="MULTIPLE_PERSONS",
            risk_score=risk_score,
            severity=severity,
            description=f"Multiple persons ({len(tracks)}) detected in restricted area",
            factors=["multiple_persons", f"count:{len(tracks)}", "restricted_zone"],
            bbox=None
        )
    
    def _get_severity(self, risk_score: int) -> str:
        """Map risk score to severity level."""
        if risk_score >= 80:
            return "CRITICAL"
        elif risk_score >= 60:
            return "HIGH"
        elif risk_score >= 30:
            return "MEDIUM"
        else:
            return "LOW"
    
    def get_info(self) -> Dict[str, Any]:
        """Get rule engine information."""
        return {
            "model_name": "RuleEngine",
            "model_version": "1.0",
            "task": "suspicious_activity_detection",
            "device": "CPU",
            "status": "READY",
            "weights": self.weights,
            "night_hours": f"{self.night_start} - {self.night_end}",
            "dwell_time_threshold": self.dwell_time_threshold,
            "cooldown_seconds": self.cooldown_seconds,
            "note": "Rule-based risk scoring - not scientifically validated probability"
        }
