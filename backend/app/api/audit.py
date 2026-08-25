from fastapi import APIRouter, Depends, Query, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.schemas.audit import AuditLogCreate, AuditLogResponse
from app.schemas.user import UserInDB
from app.middleware.auth import get_current_user, require_permissions

router = APIRouter(prefix="/audit", tags=["Audit Logging"])

@router.get("/", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["audit.read"]))
):
    cursor = db.audit_logs.find().sort("timestamp", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.post("/", response_model=AuditLogResponse)
async def create_audit_log(
    item_in: AuditLogCreate,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    # This might often be called internally, but exposing it for completeness
    item_dict = item_in.model_dump()
    item_dict["timestamp"] = datetime.utcnow()
    item_dict["ip_address"] = request.client.host if request.client else None
    item_dict["user_agent"] = request.headers.get("user-agent")
    
    result = await db.audit_logs.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict
