from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.schemas.notifications import NotificationCreate, NotificationResponse
from app.schemas.user import UserInDB
from app.middleware.auth import get_current_user, require_permissions

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    cursor = db.notifications.find({"user_id": str(current_user.id)}).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.post("/", response_model=NotificationResponse)
async def create_notification(
    item_in: NotificationCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    # Only admins or system processes should create arbitrary notifications
    current_user: UserInDB = Depends(require_permissions(["admin"])) 
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    result = await db.notifications.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": str(current_user.id)}, 
        {"$set": {"read": True, "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found or already read")
    
    item = await db.notifications.find_one({"_id": ObjectId(notification_id)})
    item["_id"] = str(item["_id"])
    return item
