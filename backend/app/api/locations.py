from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId

from app.core.database import get_db
from app.schemas.security import LocationCreate, LocationUpdate, LocationResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("/", response_model=List[LocationResponse])
async def get_locations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["locations.read"]))
):
    cursor = db.locations.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["locations.read"]))
):
    if not ObjectId.is_valid(location_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.locations.find_one({"_id": ObjectId(location_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item["_id"] = str(item["_id"])
    return item

@router.post("/", response_model=LocationResponse)
async def create_location(
    item_in: LocationCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["locations.create"]))
):
    item_dict = item_in.model_dump()
    result = await db.locations.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.patch("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: str,
    item_in: LocationUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["locations.update"]))
):
    if not ObjectId.is_valid(location_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = item_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    result = await db.locations.update_one({"_id": ObjectId(location_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found or no changes made")
    
    item = await db.locations.find_one({"_id": ObjectId(location_id)})
    item["_id"] = str(item["_id"])
    return item
