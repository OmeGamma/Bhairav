from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.schemas.security import CaseCreate, CaseUpdate, CaseResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("/", response_model=List[CaseResponse])
async def get_cases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cases.read"]))
):
    cursor = db.cases.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
        item["id"] = item.pop("_id")
    return items

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cases.read"]))
):
    if not ObjectId.is_valid(case_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.cases.find_one({"_id": ObjectId(case_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item["_id"] = str(item["_id"])
    item["id"] = item.pop("_id")
    return item

@router.post("/", response_model=CaseResponse)
async def create_case(
    item_in: CaseCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cases.create"]))
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    result = await db.cases.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    item_dict["id"] = item_dict.pop("_id")
    return item_dict

@router.patch("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: str,
    item_in: CaseUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["cases.update"]))
):
    if not ObjectId.is_valid(case_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = item_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    update_data["updated_at"] = datetime.utcnow()
    result = await db.cases.update_one({"_id": ObjectId(case_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found or no changes made")
    
    item = await db.cases.find_one({"_id": ObjectId(case_id)})
    item["_id"] = str(item["_id"])
    item["id"] = item.pop("_id")
    return item
