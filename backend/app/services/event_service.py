"""
Bhairav Event Service

Handles event generation, persistence, and management from AI inference results.
Integrates with MongoDB for storing detections, tracks, events, and evidence.
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db

logger = logging.getLogger(__name__)


class EventService:
    """
    Service for managing AI-generated events and persistence.
    
    Handles:
    - Detection persistence
    - Track persistence
    - Event creation and storage
    - Evidence snapshot storage
    - ANPR result linking to vehicle entities
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def persist_detection(self, detection: Dict[str, Any]) -> str:
        """
        Persist a single detection to MongoDB.
        
        Returns:
            Detection ID
        """
        try:
            detection_doc = {
                "detection_id": detection["detection_id"],
                "camera_id": detection["camera_id"],
                "session_id": detection["session_id"],
                "frame_number": detection["frame_number"],
                "timestamp": datetime.fromisoformat(detection["timestamp"]),
                "label": detection["label"],
                "confidence": detection["confidence"],
                "bbox": detection["bbox"],
                "model_name": detection["model_name"],
                "model_version": detection["model_version"],
                "created_at": datetime.utcnow()
            }
            
            result = await self.db.detections.insert_one(detection_doc)
            logger.debug(f"Persisted detection: {detection['detection_id']}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to persist detection: {e}")
            raise
    
    async def persist_track(self, track: Dict[str, Any]) -> str:
        """
        Persist a track to MongoDB.
        
        Returns:
            Track ID
        """
        try:
            # Check if track already exists
            existing = await self.db.tracks.find_one({"track_id": track["track_id"]})
            
            track_doc = {
                "track_id": track["track_id"],
                "camera_id": track["camera_id"],
                "session_id": track["session_id"],
                "label": track["label"],
                "first_seen": datetime.fromisoformat(track["first_seen"]),
                "last_seen": datetime.fromisoformat(track["last_seen"]),
                "frames_seen": track["frames_seen"],
                "trajectory": track["trajectory"],
                "current_bbox": track["current_bbox"],
                "confidence": track["confidence"],
                "status": track["status"],
                "updated_at": datetime.utcnow()
            }
            
            if existing:
                # Update existing track
                await self.db.tracks.update_one(
                    {"track_id": track["track_id"]},
                    {"$set": track_doc}
                )
                return str(existing["_id"])
            else:
                # Create new track
                track_doc["created_at"] = datetime.utcnow()
                result = await self.db.tracks.insert_one(track_doc)
                logger.debug(f"Persisted track: {track['track_id']}")
                return str(result.inserted_id)
                
        except Exception as e:
            logger.error(f"Failed to persist track: {e}")
            raise
    
    async def persist_anpr_result(self, anpr_result: Dict[str, Any]) -> str:
        """
        Persist ANPR result and link to vehicle entity.
        
        Returns:
            ANPR result ID
        """
        try:
            anpr_doc = {
                "anpr_id": anpr_result["anpr_id"],
                "camera_id": anpr_result["camera_id"],
                "session_id": anpr_result["session_id"],
                "frame_number": anpr_result["frame_number"],
                "timestamp": datetime.fromisoformat(anpr_result["timestamp"]),
                "plate_text": anpr_result["plate_text"],
                "raw_ocr_text": anpr_result["raw_ocr_text"],
                "ocr_confidence": anpr_result["ocr_confidence"],
                "bbox": anpr_result["bbox"],
                "vehicle_track_id": anpr_result.get("vehicle_track_id"),
                "vehicle_class": anpr_result.get("vehicle_class"),
                "confidence_level": anpr_result["confidence_level"],
                "created_at": datetime.utcnow()
            }
            
            result = await self.db.anpr_results.insert_one(anpr_doc)
            
            # Try to link to existing vehicle entity
            await self._link_anpr_to_vehicle(anpr_result["plate_text"], str(result.inserted_id))
            
            logger.debug(f"Persisted ANPR result: {anpr_result['anpr_id']}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to persist ANPR result: {e}")
            raise
    
    async def _link_anpr_to_vehicle(self, plate_text: str, anpr_id: str) -> None:
        """
        Link ANPR result to existing vehicle entity or create new one.
        
        This prepares for Network Intelligence integration (Prompt 4).
        """
        try:
            # Search for existing vehicle with this plate
            existing_vehicle = await self.db.vehicles.find_one({"plate_number": plate_text})
            
            if existing_vehicle:
                # Link to existing vehicle
                await self.db.vehicles.update_one(
                    {"_id": existing_vehicle["_id"]},
                    {
                        "$push": {"anpr_results": anpr_id},
                        "$set": {"last_seen": datetime.utcnow()}
                    }
                )
                logger.info(f"Linked ANPR to existing vehicle: {plate_text}")
            else:
                # Create new vehicle entity
                vehicle_doc = {
                    "plate_number": plate_text,
                    "created_at": datetime.utcnow(),
                    "last_seen": datetime.utcnow(),
                    "anpr_results": [anpr_id],
                    "source": "AI_DETECTION",
                    "status": "ACTIVE"
                }
                await self.db.vehicles.insert_one(vehicle_doc)
                logger.info(f"Created new vehicle entity: {plate_text}")
                
        except Exception as e:
            logger.error(f"Failed to link ANPR to vehicle: {e}")
    
    async def create_security_event(
        self,
        event_data: Dict[str, Any],
        source: str = "AI_INFERENCE"
    ) -> str:
        """
        Create a security event from AI inference results.
        
        Args:
            event_data: Event data from fence or rule engine
            source: Event source identifier
        
        Returns:
            Event ID
        """
        try:
            event_doc = {
                "event_type": event_data["event_type"],
                "severity": event_data["severity"],
                "camera_id": event_data["camera_id"],
                "track_id": event_data.get("track_id"),
                "zone_id": event_data.get("zone_id"),
                "description": event_data.get("description", ""),
                "risk_score": event_data.get("risk_score"),
                "confidence": event_data.get("confidence"),
                "bbox": event_data.get("bbox"),
                "factors": event_data.get("factors", []),
                "source": source,
                "timestamp": datetime.fromisoformat(event_data["timestamp"]) if isinstance(event_data.get("timestamp"), str) else event_data.get("timestamp", datetime.utcnow()),
                "status": "NEW",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await self.db.events.insert_one(event_doc)
            logger.info(f"Created security event: {event_data['event_type']}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to create security event: {e}")
            raise
    
    async def persist_snapshot(self, snapshot: Dict[str, Any]) -> str:
        """
        Persist evidence snapshot to storage.
        
        Returns:
            Snapshot ID
        """
        try:
            snapshot_doc = {
                "snapshot_id": snapshot["snapshot_id"],
                "session_id": snapshot["session_id"],
                "camera_id": snapshot["camera_id"],
                "frame_number": snapshot["frame_number"],
                "timestamp": datetime.fromisoformat(snapshot["timestamp"]),
                "event_count": snapshot["event_count"],
                "created_at": datetime.utcnow()
            }
            
            # Store snapshot data (in a real implementation, this would go to object storage)
            # For now, we store it as binary in MongoDB (not ideal for production)
            snapshot_doc["data"] = snapshot["snapshot_data"]
            
            result = await self.db.snapshots.insert_one(snapshot_doc)
            logger.debug(f"Persisted snapshot: {snapshot['snapshot_id']}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to persist snapshot: {e}")
            raise
    
    async def process_inference_result(self, result: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Process complete inference result and persist all components.
        
        Args:
            result: Complete inference result from AIInferenceEngine
        
        Returns:
            Dictionary with IDs of persisted items
        """
        persisted_ids = {
            "detections": [],
            "tracks": [],
            "face_detections": [],
            "anpr_results": [],
            "fence_events": [],
            "rule_events": [],
            "snapshots": []
        }
        
        try:
            # Persist detections
            for detection in result.get("detections", []):
                detection["camera_id"] = result["camera_id"]
                detection["session_id"] = result["session_id"]
                detection["frame_number"] = result["frame_number"]
                detection["timestamp"] = result["timestamp"]
                
                detection_id = await self.persist_detection(detection)
                persisted_ids["detections"].append(detection_id)
            
            # Persist tracks
            for track in result.get("tracks", []):
                track["camera_id"] = result["camera_id"]
                track["session_id"] = result["session_id"]
                
                track_id = await self.persist_track(track)
                persisted_ids["tracks"].append(track_id)
            
            # Persist face detections
            for face_detection in result.get("face_detections", []):
                face_detection["camera_id"] = result["camera_id"]
                face_detection["session_id"] = result["session_id"]
                face_detection["frame_number"] = result["frame_number"]
                face_detection["timestamp"] = result["timestamp"]
                
                face_id = await self.persist_detection(face_detection)  # Reuse detection collection
                persisted_ids["face_detections"].append(face_id)
            
            # Persist ANPR results
            for anpr_result in result.get("anpr_results", []):
                anpr_result["camera_id"] = result["camera_id"]
                anpr_result["session_id"] = result["session_id"]
                anpr_result["frame_number"] = result["frame_number"]
                anpr_result["timestamp"] = result["timestamp"]
                
                anpr_id = await self.persist_anpr_result(anpr_result)
                persisted_ids["anpr_results"].append(anpr_id)
            
            # Create security events from fence events
            for fence_event in result.get("fence_events", []):
                fence_event["camera_id"] = result["camera_id"]
                
                event_id = await self.create_security_event(fence_event, "VIRTUAL_FENCE")
                persisted_ids["fence_events"].append(event_id)
            
            # Create security events from rule events
            for rule_event in result.get("rule_events", []):
                rule_event["camera_id"] = result["camera_id"]
                
                event_id = await self.create_security_event(rule_event, "RULE_ENGINE")
                persisted_ids["rule_events"].append(event_id)
            
            # Generate and persist snapshot if there are significant events
            if result.get("fence_events") or result.get("rule_events"):
                # This would be generated from the frame
                # For now, we'll create a placeholder
                snapshot = {
                    "snapshot_id": f"snap_{result['frame_number']}",
                    "session_id": result["session_id"],
                    "camera_id": result["camera_id"],
                    "frame_number": result["frame_number"],
                    "timestamp": result["timestamp"],
                    "event_count": len(result.get("fence_events", [])) + len(result.get("rule_events", [])),
                    "snapshot_data": b""  # Placeholder
                }
                
                snapshot_id = await self.persist_snapshot(snapshot)
                persisted_ids["snapshots"].append(snapshot_id)
            
            logger.info(f"Processed inference result: {sum(len(v) for v in persisted_ids.values())} items persisted")
            return persisted_ids
            
        except Exception as e:
            logger.error(f"Failed to process inference result: {e}")
            raise
    
    async def get_camera_events(
        self,
        camera_id: str,
        limit: int = 100,
        severity: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get events for a specific camera."""
        query = {"camera_id": camera_id}
        if severity:
            query["severity"] = severity
        
        cursor = self.db.events.find(query).sort("timestamp", -1).limit(limit)
        events = await cursor.to_list(length=limit)
        
        for event in events:
            event["_id"] = str(event["_id"])
        
        return events
    
    async def get_track_history(self, track_id: str) -> Optional[Dict[str, Any]]:
        """Get complete track history."""
        track = await self.db.tracks.find_one({"track_id": track_id})
        if track:
            track["_id"] = str(track["_id"])
        return track
    
    async def get_anpr_history(self, plate_text: str) -> List[Dict[str, Any]]:
        """Get ANPR history for a specific plate."""
        cursor = self.db.anpr_results.find({"plate_text": plate_text}).sort("timestamp", -1).limit(50)
        results = await cursor.to_list(length=50)
        
        for result in results:
            result["_id"] = str(result["_id"])
        
        return results


# Singleton instance
_event_service = None


def get_event_service(db: AsyncIOMotorDatabase) -> EventService:
    """Get or create event service instance."""
    global _event_service
    if _event_service is None:
        _event_service = EventService(db)
    return _event_service
