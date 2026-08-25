from fastapi import APIRouter, Depends, Query, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.schemas.verification import DocumentResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/", response_model=List[DocumentResponse])
async def get_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"]))
):
    cursor = db.documents.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.post("/", response_model=DocumentResponse)
async def upload_document(
    document_type: str,
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.create"]))
):
    # In a real implementation, we would upload to S3/Storage here
    # For now, we simulate storage and save metadata
    storage_reference = f"storage/{datetime.utcnow().timestamp()}_{file.filename}"
    
    doc_dict = {
        "document_type": document_type,
        "storage_reference": storage_reference,
        "uploaded_by": str(current_user.id),
        "status": "UPLOADED",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.documents.insert_one(doc_dict)
    doc_dict["_id"] = str(result.inserted_id)
    return doc_dict
