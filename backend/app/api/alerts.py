from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.schemas.security import AlertCreate, AlertUpdate, AlertResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    camera_id: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["events.read"]))
):
    query = {}
    if status:
        query["status"] = status
    if severity:
        query["severity"] = severity
    if camera_id:
        query["camera_id"] = camera_id

    cursor = db.alerts.find(query).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["events.read"]))
):
    if not ObjectId.is_valid(alert_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.alerts.find_one({"_id": ObjectId(alert_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item["_id"] = str(item["_id"])
    return item

@router.patch("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: str,
    item_in: AlertUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["events.update"]))
):
    if not ObjectId.is_valid(alert_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = item_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    if update_data.get("status") in ["ACKNOWLEDGED", "RESOLVED", "DISMISSED"] and not update_data.get("acknowledged_by"):
        update_data["acknowledged_by"] = str(current_user.id)
        update_data["acknowledged_at"] = datetime.utcnow()

    update_data["updated_at"] = datetime.utcnow()
    result = await db.alerts.update_one({"_id": ObjectId(alert_id)}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Not found or no changes made")
    
    item = await db.alerts.find_one({"_id": ObjectId(alert_id)})
    item["_id"] = str(item["_id"])
    return item
