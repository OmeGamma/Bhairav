import asyncio
import json
import logging
from typing import Dict, List, Set, Any
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps camera_id to a set of connected WebSockets
        self.camera_subscriptions: Dict[str, Set[WebSocket]] = {}
        # All connected clients (useful for global alerts)
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket connected: {websocket.client}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        # Remove from any subscriptions
        for cam_id, subs in self.camera_subscriptions.items():
            if websocket in subs:
                subs.remove(websocket)
        logger.info(f"WebSocket disconnected: {websocket.client}")

    async def subscribe(self, websocket: WebSocket, camera_id: str):
        if camera_id not in self.camera_subscriptions:
            self.camera_subscriptions[camera_id] = set()
        self.camera_subscriptions[camera_id].add(websocket)
        logger.info(f"WebSocket subscribed to camera {camera_id}")

    async def unsubscribe(self, websocket: WebSocket, camera_id: str):
        if camera_id in self.camera_subscriptions and websocket in self.camera_subscriptions[camera_id]:
            self.camera_subscriptions[camera_id].remove(websocket)

    async def broadcast_camera_telemetry(self, camera_id: str, data: Dict[str, Any]):
        """Broadcast telemetry to clients."""
        message = json.dumps({"type": "camera_telemetry", "camera_id": camera_id, "data": data})
        
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except RuntimeError:
                disconnected.add(connection)
            except Exception as e:
                logger.error(f"Failed to send WS message: {e}")
                disconnected.add(connection)
                
        for conn in disconnected:
            self.disconnect(conn)

    async def broadcast_alert(self, alert: Dict[str, Any]):
        """Broadcast new alert to all clients."""
        # Convert _id to string if needed
        if "_id" in alert:
            alert["id"] = str(alert.pop("_id"))
            
        message = json.dumps({"type": "new_alert", "data": alert})
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.add(connection)
                
        for conn in disconnected:
            self.disconnect(conn)

websocket_manager = ConnectionManager()
