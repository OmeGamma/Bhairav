from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.schemas.security import EventCreate, EventUpdate, EventResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/", response_model=List[EventResponse])
async def get_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["events.read"]))
):
    query = {}
    if severity:
        query["severity"] = severity
    if event_type:
        query["event_type"] = event_type
    if status:
        query["status"] = status

    cursor = db.events.find(query).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["events.read"]))
):
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.events.find_one({"_id": ObjectId(event_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item["_id"] = str(item["_id"])
    return item

@router.post("/", response_model=EventResponse)
async def create_event(
    item_in: EventCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["events.create"]))
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    result = await db.events.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    item_in: EventUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["events.update"]))
):
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = item_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    update_data["updated_at"] = datetime.utcnow()
    result = await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found or no changes made")
    
    item = await db.events.find_one({"_id": ObjectId(event_id)})
    item["_id"] = str(item["_id"])
    return item

@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["events.delete"]))
):
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    result = await db.events.delete_one({"_id": ObjectId(event_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"msg": "Deleted successfully"}
