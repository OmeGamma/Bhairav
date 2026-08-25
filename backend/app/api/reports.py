from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
import uuid

from app.core.database import get_db
from app.schemas.search import ReportRequest, ReportResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    req: ReportRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["reports.generate"]))
):
    # Mocking report generation
    report_id = str(uuid.uuid4())
    
    # Store request in db (mocked)
    report_doc = {
        "_id": ObjectId(),
        "report_id": report_id,
        "type": req.report_type,
        "requested_by": str(current_user.id),
        "status": "PROCESSING",
        "created_at": datetime.utcnow()
    }
    await db.reports.insert_one(report_doc)
    
    return ReportResponse(
        report_id=report_id,
        status="PROCESSING",
        metadata={"message": "Report generation started"}
    )

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report_status(
    report_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["reports.read"]))
):
    # Mocking status retrieval
    item = await db.reports.find_one({"report_id": report_id})
    if not item:
        raise HTTPException(status_code=404, detail="Report not found")
        
    # Simulate completion
    status = "COMPLETED"
    download_url = f"/api/v1/reports/download/{report_id}"
    
    return ReportResponse(
        report_id=report_id,
        status=status,
        download_url=download_url
    )
