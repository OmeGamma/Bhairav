from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.schemas.security import CameraCreate, CameraUpdate, CameraResponse, CameraSessionCreate, CameraSessionResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions
from app.services.camera_manager import camera_manager
import uuid
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/cameras", tags=["Cameras"])

@router.get("/", response_model=List[CameraResponse])
async def get_cameras(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cameras.read"]))
):
    cursor = db.cameras.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(
    camera_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cameras.read"]))
):
    if not ObjectId.is_valid(camera_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.cameras.find_one({"_id": ObjectId(camera_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item["_id"] = str(item["_id"])
    return item

@router.post("/", response_model=CameraResponse)
async def create_camera(
    item_in: CameraCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cameras.create"]))
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    result = await db.cameras.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.patch("/{camera_id}", response_model=CameraResponse)
async def update_camera(
    camera_id: str,
    item_in: CameraUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cameras.update"]))
):
    if not ObjectId.is_valid(camera_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = item_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    update_data["updated_at"] = datetime.utcnow()
    result = await db.cameras.update_one({"_id": ObjectId(camera_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found or no changes made")
    
    item = await db.cameras.find_one({"_id": ObjectId(camera_id)})
    item["_id"] = str(item["_id"])
    return item

@router.delete("/{camera_id}")
async def delete_camera(
    camera_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cameras.delete"]))
):
    if not ObjectId.is_valid(camera_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    result = await db.cameras.delete_one({"_id": ObjectId(camera_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"msg": "Deleted successfully"}

@router.post("/{camera_id}/sessions", response_model=CameraSessionResponse)
async def start_camera_session(
    camera_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cameras.update"]))
):
    if not ObjectId.is_valid(camera_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    camera = await db.cameras.find_one({"_id": ObjectId(camera_id)})
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
        
    session_id = str(uuid.uuid4())
    source_type = camera.get("source_type", "SIMULATED")
    stream_reference = camera.get("stream_reference", camera_id)
    fps = camera.get("configuration", {}).get("fps", 30)
    
    success = await camera_manager.start_session(
        camera_id=camera_id, 
        session_id=session_id,
        source_type=source_type,
        stream_reference=stream_reference,
        fps=fps
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to start camera session")
        
    session_doc = {
        "_id": session_id,
        "camera_id": camera_id,
        "source_type": source_type,
        "source_reference": stream_reference,
        "status": "STARTING",
        "fps": fps,
        "created_by": str(current_user.id),
        "started_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.camera_sessions.insert_one(session_doc)
    
    # Update camera status
    await db.cameras.update_one({"_id": ObjectId(camera_id)}, {"$set": {"status": "ONLINE"}})
    
    session_doc["id"] = session_id
    return session_doc

@router.post("/{camera_id}/stop")
async def stop_camera_session(
    camera_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cameras.update"]))
):
    if not ObjectId.is_valid(camera_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    await camera_manager.stop_session(camera_id)
    
    # Update camera status
    await db.cameras.update_one({"_id": ObjectId(camera_id)}, {"$set": {"status": "OFFLINE"}})
    
    return {"msg": "Camera session stopped"}
