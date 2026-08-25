from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.schemas.welfare import WelfareCheckInCreate, WelfareCheckInResponse
from app.schemas.user import UserInDB
from app.middleware.auth import get_current_user, require_permissions

router = APIRouter(prefix="/welfare", tags=["Welfare"])

@router.get("/check-ins", response_model=List[WelfareCheckInResponse])
async def get_check_ins(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["welfare.read"]))
):
    # Only welfare officers or admins should see all.
    # We assume 'welfare.read' gives full access.
    cursor = db.welfare_checkins.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.post("/check-ins", response_model=WelfareCheckInResponse)
async def create_check_in(
    item_in: WelfareCheckInCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    result = await db.welfare_checkins.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.get("/summary")
async def get_welfare_summary(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["welfare.read"]))
):
    # Mocking welfare summary
    return {
        "status": "ok",
        "total_check_ins": await db.welfare_checkins.count_documents({}),
        "metrics": {"GOOD": 0, "FAIR": 0, "POOR": 0, "CRISIS": 0}
    }
