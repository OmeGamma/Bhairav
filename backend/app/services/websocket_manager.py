"""
Bhairav WebSocket Manager

Manages WebSocket connections for real-time AI event delivery.
Supports broadcasting detection, tracking, and security events to connected clients.
"""

from typing import Dict, Set, Any, Optional
import logging
import json
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Manages WebSocket connections and broadcasts real-time events.
    
    Event types:
    - detection.created
    - track.updated
    - event.created
    - alert.created
    - anpr.detected
    - camera.metrics
    """
    
    def __init__(self):
        # Active connections by camera_id
        self.camera_connections: Dict[str, Set[WebSocket]] = {}
        
        # All connections (for global events)
        self.global_connections: Set[WebSocket] = {}
        
        # Connection metadata
        self.connection_info: Dict[WebSocket, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, camera_id: Optional[str] = None):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        
        self.connection_info[websocket] = {
            "camera_id": camera_id,
            "connected_at": datetime.utcnow()
        }
        
        if camera_id:
            if camera_id not in self.camera_connections:
                self.camera_connections[camera_id] = set()
            self.camera_connections[camera_id].add(websocket)
            logger.info(f"WebSocket connected for camera: {camera_id}")
        else:
            self.global_connections.add(websocket)
            logger.info("Global WebSocket connected")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        # Remove from camera connections
        info = self.connection_info.get(websocket, {})
        camera_id = info.get("camera_id")
        
        if camera_id and camera_id in self.camera_connections:
            self.camera_connections[camera_id].discard(websocket)
            if not self.camera_connections[camera_id]:
                del self.camera_connections[camera_id]
        
        # Remove from global connections
        self.global_connections.discard(websocket)
        
        # Remove connection info
        if websocket in self.connection_info:
            del self.connection_info[websocket]
        
        logger.info("WebSocket disconnected")
    
    async def broadcast_to_camera(self, camera_id: str, message: Dict[str, Any]):
        """Broadcast a message to all connections for a specific camera."""
        if camera_id not in self.camera_connections:
            return
        
        disconnected = []
        for connection in self.camera_connections[camera_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to WebSocket: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_global(self, message: Dict[str, Any]):
        """Broadcast a message to all global connections."""
        disconnected = []
        for connection in self.global_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to global WebSocket: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_detection_event(self, detection: Dict[str, Any]):
        """Send detection event to relevant camera connections."""
        camera_id = detection.get("camera_id")
        if camera_id:
            message = {
                "type": "detection.created",
                "data": detection,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self.broadcast_to_camera(camera_id, message)
    
    async def send_track_event(self, track: Dict[str, Any]):
        """Send track update event to relevant camera connections."""
        camera_id = track.get("camera_id")
        if camera_id:
            message = {
                "type": "track.updated",
                "data": track,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self.broadcast_to_camera(camera_id, message)
    
    async def send_security_event(self, event: Dict[str, Any]):
        """Send security event to relevant camera connections and global connections."""
        camera_id = event.get("camera_id")
        
        message = {
            "type": "event.created",
            "data": event,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Send to camera-specific connections
        if camera_id:
            await self.broadcast_to_camera(camera_id, message)
        
        # Also send to global connections for security events
        await self.broadcast_global(message)
    
    async def send_anpr_result(self, anpr_result: Dict[str, Any]):
        """Send ANPR result to relevant camera connections."""
        camera_id = anpr_result.get("camera_id")
        if camera_id:
            message = {
                "type": "anpr.detected",
                "data": anpr_result,
                "timestamp": datetime.utcnow().isoformat()
            }
            await self.broadcast_to_camera(camera_id, message)
    
    async def send_camera_metrics(self, camera_id: str, metrics: Dict[str, Any]):
        """Send camera metrics to relevant camera connections."""
        message = {
            "type": "camera.metrics",
            "camera_id": camera_id,
            "data": metrics,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_camera(camera_id, message)
    
    def get_connection_count(self) -> Dict[str, int]:
        """Get count of active connections."""
        return {
            "global_connections": len(self.global_connections),
            "camera_connections": sum(len(conns) for conns in self.camera_connections.values()),
            "cameras_with_connections": len(self.camera_connections)
        }


# Global WebSocket manager instance
websocket_manager = WebSocketManager()
