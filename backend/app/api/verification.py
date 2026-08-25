from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.schemas.verification import VerificationCreate, VerificationUpdate, VerificationResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/verification", tags=["Verification"])

@router.get("/", response_model=List[VerificationResponse])
async def get_verifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["verification.read"]))
):
    cursor = db.verification_records.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.get("/{verification_id}", response_model=VerificationResponse)
async def get_verification(
    verification_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["verification.read"]))
):
    if not ObjectId.is_valid(verification_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.verification_records.find_one({"_id": ObjectId(verification_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item["_id"] = str(item["_id"])
    return item

@router.post("/", response_model=VerificationResponse)
async def create_verification(
    item_in: VerificationCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["verification.create"]))
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    result = await db.verification_records.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    
    # In future, AI service integration would trigger here
    return item_dict

@router.patch("/{verification_id}/review", response_model=VerificationResponse)
async def review_verification(
    verification_id: str,
    item_in: VerificationUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["verification.update"]))
):
    if not ObjectId.is_valid(verification_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = item_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    update_data["updated_at"] = datetime.utcnow()
    result = await db.verification_records.update_one({"_id": ObjectId(verification_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found or no changes made")
    
    item = await db.verification_records.find_one({"_id": ObjectId(verification_id)})
    item["_id"] = str(item["_id"])
    return item
