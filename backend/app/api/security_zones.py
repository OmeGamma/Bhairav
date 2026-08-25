from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId

from app.core.database import get_db
from app.schemas.security import SecurityZoneCreate, SecurityZoneUpdate, SecurityZoneResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/security-zones", tags=["Security Zones"])

@router.get("/", response_model=List[SecurityZoneResponse])
async def get_zones(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["zones.read"]))
):
    cursor = db.security_zones.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.post("/", response_model=SecurityZoneResponse)
async def create_zone(
    item_in: SecurityZoneCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["zones.create"]))
):
    item_dict = item_in.model_dump()
    result = await db.security_zones.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.patch("/{zone_id}", response_model=SecurityZoneResponse)
async def update_zone(
    zone_id: str,
    item_in: SecurityZoneUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["zones.update"]))
):
    if not ObjectId.is_valid(zone_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = item_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    result = await db.security_zones.update_one({"_id": ObjectId(zone_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found or no changes made")
    
    item = await db.security_zones.find_one({"_id": ObjectId(zone_id)})
    item["_id"] = str(item["_id"])
    return item

@router.delete("/{zone_id}")
async def delete_zone(
    zone_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["zones.delete"]))
):
    if not ObjectId.is_valid(zone_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    result = await db.security_zones.delete_one({"_id": ObjectId(zone_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"msg": "Deleted successfully"}
