"""
Bhairav WebSocket API

WebSocket endpoint for real-time AI event delivery.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional

from app.services.websocket_manager import websocket_manager
from app.middleware.auth import get_current_user_ws
from app.core.database import get_db

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    camera_id: Optional[str] = Query(None),
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for real-time AI events.
    
    Args:
        websocket: WebSocket connection
        camera_id: Optional camera ID to filter events
        token: JWT authentication token
    """
    db = get_db()
    
    # Authenticate user
    try:
        user = await get_current_user_ws(token, db)
        if not user:
            await websocket.close(code=1008, reason="Authentication failed")
            return
    except Exception as e:
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    # Accept connection
    await websocket_manager.connect(websocket, camera_id)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            
            # Handle client messages (ping, subscribe, etc.)
            if data == "ping":
                await websocket.send_json({"type": "pong"})
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception as e:
        websocket_manager.disconnect(websocket)


@router.websocket("/ws/camera/{camera_id}")
async def camera_websocket_endpoint(
    websocket: WebSocket,
    camera_id: str,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for specific camera events.
    
    Args:
        websocket: WebSocket connection
        camera_id: Camera ID to receive events for
        token: JWT authentication token
    """
    db = get_db()
    
    # Authenticate user
    try:
        user = await get_current_user_ws(token, db)
        if not user:
            await websocket.close(code=1008, reason="Authentication failed")
            return
    except Exception as e:
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    # Accept connection
    await websocket_manager.connect(websocket, camera_id)
    
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            
            if data == "ping":
                await websocket.send_json({"type": "pong"})
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception as e:
        websocket_manager.disconnect(websocket)
