"""
Bhairav Object Tracker

Implements multi-object tracking for stable track IDs across frames.
Uses ByteTrack or similar lightweight tracker.
"""

from typing import List, Dict, Any, Optional
import logging
import numpy as np
from datetime import datetime
import uuid
from collections import defaultdict

logger = logging.getLogger(__name__)


class TrackPoint:
    """Single point in object trajectory."""
    
    def __init__(self, x: float, y: float, timestamp: datetime):
        self.x = x
        self.y = y
        self.timestamp = timestamp
    
    def model_dump(self) -> Dict[str, Any]:
        return {
            "x": self.x,
            "y": self.y,
            "timestamp": self.timestamp.isoformat()
        }


class Track:
    """Object track across multiple frames."""
    
    def __init__(
        self,
        track_id: str,
        camera_id: str,
        session_id: str,
        label: str,
        bbox: tuple,
        confidence: float
    ):
        self.track_id = track_id
        self.camera_id = camera_id
        self.session_id = session_id
        self.label = label
        self.first_seen = datetime.utcnow()
        self.last_seen = datetime.utcnow()
        self.frames_seen = 1
        self.trajectory: List[TrackPoint] = []
        self.current_bbox = bbox
        self.confidence = confidence
        self.status = "ACTIVE"  # ACTIVE, LOST, ENDED
        
        # Add initial trajectory point
        center_x = (bbox[0] + bbox[2]) / 2
        center_y = (bbox[1] + bbox[3]) / 2
        self.trajectory.append(TrackPoint(center_x, center_y, datetime.utcnow()))
    
    def update(self, bbox: tuple, confidence: float) -> None:
        """Update track with new detection."""
        self.last_seen = datetime.utcnow()
        self.frames_seen += 1
        self.current_bbox = bbox
        self.confidence = confidence
        self.status = "ACTIVE"
        
        # Add trajectory point
        center_x = (bbox[0] + bbox[2]) / 2
        center_y = (bbox[1] + bbox[3]) / 2
        self.trajectory.append(TrackPoint(center_x, center_y, datetime.utcnow()))
        
        # Limit trajectory history
        max_history = 100
        if len(self.trajectory) > max_history:
            self.trajectory = self.trajectory[-max_history:]
    
    def mark_lost(self) -> None:
        """Mark track as lost (no recent detections)."""
        self.status = "LOST"
    
    def mark_ended(self) -> None:
        """Mark track as ended (no longer tracking)."""
        self.status = "ENDED"
    
    def model_dump(self) -> Dict[str, Any]:
        return {
            "track_id": self.track_id,
            "camera_id": self.camera_id,
            "session_id": self.session_id,
            "label": self.label,
            "first_seen": self.first_seen.isoformat(),
            "last_seen": self.last_seen.isoformat(),
            "frames_seen": self.frames_seen,
            "trajectory": [p.model_dump() for p in self.trajectory],
            "current_bbox": {
                "x1": self.current_bbox[0],
                "y1": self.current_bbox[1],
                "x2": self.current_bbox[2],
                "y2": self.current_bbox[3]
            },
            "confidence": self.confidence,
            "status": self.status
        }


class ObjectTracker:
    """
    Multi-object tracker for maintaining stable track IDs.
    
    Uses a simple IoU-based tracking approach when ByteTrack is unavailable.
    Provides stable track IDs across consecutive frames.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
        # Configuration
        self.max_lost_frames = config.get("max_lost_frames", 10)
        self.iou_threshold = config.get("iou_threshold", 0.3)
        self.max_trajectory_history = config.get("max_trajectory_history", 100)
        
        # Active tracks
        self.tracks: Dict[str, Track] = {}
        self.next_track_id = 1
        
        # Try to load ByteTrack if available
        self.byte_tracker = None
        self._load_byte_track()
    
    def _load_byte_track(self) -> None:
        """Try to load ByteTrack for better tracking accuracy."""
        try:
            from byte_tracker import BYTETracker
            self.byte_tracker = BYTETracker()
            logger.info("ByteTrack loaded successfully")
        except ImportError:
            logger.info("ByteTrack not available, using IoU-based tracking")
        except Exception as e:
            logger.warning(f"Failed to load ByteTrack: {e}")
    
    def _calculate_iou(self, bbox1: tuple, bbox2: tuple) -> float:
        """Calculate Intersection over Union (IoU) between two bounding boxes."""
        x1 = max(bbox1[0], bbox2[0])
        y1 = max(bbox1[1], bbox2[1])
        x2 = min(bbox1[2], bbox2[2])
        y2 = min(bbox1[3], bbox2[3])
        
        if x2 <= x1 or y2 <= y1:
            return 0.0
        
        intersection = (x2 - x1) * (y2 - y1)
        area1 = (bbox1[2] - bbox1[0]) * (bbox1[3] - bbox1[1])
        area2 = (bbox2[2] - bbox2[0]) * (bbox2[3] - bbox2[1])
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0
    
    def _get_bbox_center(self, bbox: tuple) -> tuple:
        """Get center point of bounding box."""
        return ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)
    
    def _calculate_distance(self, center1: tuple, center2: tuple) -> float:
        """Calculate Euclidean distance between two center points."""
        return np.sqrt((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)
    
    async def update(
        self,
        detections: List,
        frame_number: int,
        camera_id: str,
        session_id: str
    ) -> List[Track]:
        """
        Update tracks with new detections.
        
        Args:
            detections: List of DetectionResult objects
            frame_number: Current frame number
            camera_id: Camera identifier
            session_id: Session identifier
        
        Returns:
            List of active Track objects
        """
        if self.byte_tracker:
            return await self._update_with_byte_track(
                detections, frame_number, camera_id, session_id
            )
        else:
            return await self._update_with_iou(
                detections, frame_number, camera_id, session_id
            )
    
    async def _update_with_iou(
        self,
        detections: List,
        frame_number: int,
        camera_id: str,
        session_id: str
    ) -> List[Track]:
        """Update tracks using IoU-based matching."""
        # Mark all tracks as potentially lost
        for track in self.tracks.values():
            track.mark_lost()
        
        # Match detections to existing tracks
        matched_track_ids = set()
        
        for detection in detections:
            best_track_id = None
            best_iou = self.iou_threshold
            
            detection_bbox = detection.bbox if hasattr(detection, 'bbox') else (
                detection.model_dump()["bbox"]["x1"],
                detection.model_dump()["bbox"]["y1"],
                detection.model_dump()["bbox"]["x2"],
                detection.model_dump()["bbox"]["y2"]
            )
            detection_center = self._get_bbox_center(detection_bbox)
            
            for track_id, track in self.tracks.items():
                if track.status == "ENDED":
                    continue
                
                # Calculate IoU
                iou = self._calculate_iou(detection_bbox, track.current_bbox)
                
                # Calculate distance as secondary metric
                track_center = self._get_bbox_center(track.current_bbox)
                distance = self._calculate_distance(detection_center, track_center)
                
                # Match if IoU is high and distance is reasonable
                if iou > best_iou and distance < 100:  # 100 pixels threshold
                    best_iou = iou
                    best_track_id = track_id
            
            if best_track_id:
                # Update existing track
                track = self.tracks[best_track_id]
                track.update(detection_bbox, detection.confidence)
                matched_track_ids.add(best_track_id)
            else:
                # Create new track
                track_id = f"T-{self.next_track_id:04d}"
                self.next_track_id += 1
                
                label = detection.label if hasattr(detection, 'label') else detection.model_dump()["label"]
                confidence = detection.confidence if hasattr(detection, 'confidence') else detection.model_dump()["confidence"]
                
                self.tracks[track_id] = Track(
                    track_id=track_id,
                    camera_id=camera_id,
                    session_id=session_id,
                    label=label,
                    bbox=detection_bbox,
                    confidence=confidence
                )
                matched_track_ids.add(track_id)
        
        # Remove lost tracks
        tracks_to_remove = []
        for track_id, track in self.tracks.items():
            if track_id not in matched_track_ids:
                frames_since_last_seen = frame_number - track.frames_seen
                if frames_since_last_seen > self.max_lost_frames:
                    track.mark_ended()
                    tracks_to_remove.append(track_id)
        
        for track_id in tracks_to_remove:
            del self.tracks[track_id]
        
        # Return only active tracks
        return [track for track in self.tracks.values() if track.status == "ACTIVE"]
    
    async def _update_with_byte_track(
        self,
        detections: List,
        frame_number: int,
        camera_id: str,
        session_id: str
    ) -> List[Track]:
        """Update tracks using ByteTrack (if available)."""
        # This would use the actual ByteTrack implementation
        # For now, fall back to IoU-based tracking
        logger.debug("ByteTrack interface not fully implemented, using IoU fallback")
        return await self._update_with_iou(detections, frame_number, camera_id, session_id)
    
    def get_info(self) -> Dict[str, Any]:
        """Get tracker information."""
        return {
            "model_name": "ByteTrack" if self.byte_tracker else "IoU-Based",
            "model_version": "1.0",
            "task": "multi_object_tracking",
            "device": "CPU",
            "status": "READY",
            "active_tracks": len([t for t in self.tracks.values() if t.status == "ACTIVE"]),
            "max_lost_frames": self.max_lost_frames,
            "iou_threshold": self.iou_threshold
        }
