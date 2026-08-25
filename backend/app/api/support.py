from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.schemas.support import SupportRequestCreate, SupportRequestUpdate, SupportRequestResponse
from app.schemas.user import UserInDB
from app.middleware.auth import get_current_user, require_permissions

router = APIRouter(prefix="/support", tags=["Support"])

@router.get("/requests", response_model=List[SupportRequestResponse])
async def get_support_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["support.read"]))
):
    cursor = db.support_requests.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.get("/requests/{request_id}", response_model=SupportRequestResponse)
async def get_support_request(
    request_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["support.read"]))
):
    if not ObjectId.is_valid(request_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.support_requests.find_one({"_id": ObjectId(request_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item["_id"] = str(item["_id"])
    return item

@router.post("/requests", response_model=SupportRequestResponse)
async def create_support_request(
    item_in: SupportRequestCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    result = await db.support_requests.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.patch("/requests/{request_id}", response_model=SupportRequestResponse)
async def update_support_request(
    request_id: str,
    item_in: SupportRequestUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["support.manage"]))
):
    if not ObjectId.is_valid(request_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = item_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    update_data["updated_at"] = datetime.utcnow()
    result = await db.support_requests.update_one({"_id": ObjectId(request_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found or no changes made")
    
    item = await db.support_requests.find_one({"_id": ObjectId(request_id)})
    item["_id"] = str(item["_id"])
    return item
