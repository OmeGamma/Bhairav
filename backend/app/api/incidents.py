from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.schemas.security import IncidentCreate, IncidentUpdate, IncidentResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("/", response_model=List[IncidentResponse])
async def get_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["incidents.read"]))
):
    cursor = db.incidents.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["incidents.read"]))
):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.incidents.find_one({"_id": ObjectId(incident_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item["_id"] = str(item["_id"])
    return item

@router.post("/", response_model=IncidentResponse)
async def create_incident(
    item_in: IncidentCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["incidents.create"]))
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    result = await db.incidents.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str,
    item_in: IncidentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["incidents.update"]))
):
    if not ObjectId.is_valid(incident_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = item_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    update_data["updated_at"] = datetime.utcnow()
    result = await db.incidents.update_one({"_id": ObjectId(incident_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found or no changes made")
    
    item = await db.incidents.find_one({"_id": ObjectId(incident_id)})
    item["_id"] = str(item["_id"])
    return item
