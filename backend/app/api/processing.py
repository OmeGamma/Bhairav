from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.schemas.processing import (
    ProcessingJobCreate,
    ProcessingJobUpdate,
    ProcessingJobResponse,
)
from app.schemas.evidence import IngestionResultCreate, IngestionResultResponse
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions
from app.services.evidence_service import evidence_service
from app.services.structured_data_ingestion import structured_data_ingestion_service

router = APIRouter(prefix="/processing", tags=["Processing"])


@router.get("/jobs", response_model=List[ProcessingJobResponse])
async def list_processing_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    file_id: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"]))
):
    query = {}
    if file_id:
        query["file_id"] = file_id
    if job_type:
        query["job_type"] = job_type.upper()
    if status:
        query["status"] = status.upper()
    cursor = db.processing_jobs.find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["id"] = str(item.pop("_id"))
    return [ProcessingJobResponse(**item) for item in items]


@router.get("/jobs/{job_id}", response_model=ProcessingJobResponse)
async def get_processing_job(
    job_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"]))
):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.processing_jobs.find_one({"_id": ObjectId(job_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Job not found")
    item["id"] = str(item.pop("_id"))
    return ProcessingJobResponse(**item)


@router.patch("/jobs/{job_id}", response_model=ProcessingJobResponse)
async def update_processing_job(
    job_id: str,
    update_in: ProcessingJobUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.update"]))
):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = update_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    await db.processing_jobs.update_one({"_id": ObjectId(job_id)}, {"$set": update_data})
    item = await db.processing_jobs.find_one({"_id": ObjectId(job_id)})
    item["id"] = str(item.pop("_id"))
    return ProcessingJobResponse(**item)


@router.post("/ingestion/{file_id}/cdr", response_model=IngestionResultResponse)
async def ingest_cdr(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.create"])),
):
    doc = await db.evidence_files.find_one({"_id": ObjectId(file_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Evidence file not found")
    storage_key = doc.get("storage_key")
    if not storage_key:
        raise HTTPException(status_code=400, detail="File has no storage reference")
    
    try:
        content = await evidence_service.get_file_content(storage_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
    
    result = await structured_data_ingestion_service.ingest_cdr(
        db=db,
        file_id=file_id,
        content=content,
        created_by=str(current_user.id),
    )
    return result


@router.post("/ingestion/{file_id}/financial", response_model=IngestionResultResponse)
async def ingest_financial(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.create"])),
):
    doc = await db.evidence_files.find_one({"_id": ObjectId(file_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Evidence file not found")
    storage_key = doc.get("storage_key")
    if not storage_key:
        raise HTTPException(status_code=400, detail="File has no storage reference")
    
    try:
        content = await evidence_service.get_file_content(storage_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
    
    result = await structured_data_ingestion_service.ingest_financial(
        db=db,
        file_id=file_id,
        content=content,
        created_by=str(current_user.id),
    )
    return result


@router.post("/ingestion", response_model=IngestionResultResponse)
async def create_ingestion_result(
    result_in: IngestionResultCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.create"]))
):
    result_dict = result_in.model_dump()
    result_dict["created_at"] = datetime.utcnow()
    res = await db.ingestion_results.insert_one(result_dict)
    result_dict["_id"] = str(res.inserted_id)
    return IngestionResultResponse(**result_dict)


@router.get("/ingestion/{file_id}", response_model=List[IngestionResultResponse])
async def get_ingestion_results(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"]))
):
    cursor = db.ingestion_results.find({"file_id": file_id}).sort("created_at", -1)
    items = await cursor.to_list(length=100)
    for item in items:
        item["id"] = str(item.pop("_id"))
    return [IngestionResultResponse(**item) for item in items]
