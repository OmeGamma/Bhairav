from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import io
import hashlib

from app.core.database import get_db
from app.schemas.evidence import (
    EvidenceFileCreate,
    EvidenceFileUpdate,
    EvidenceFileResponse,
    EvidenceVersionBase,
    EvidenceVersionResponse,
    EvidenceAuditResponse,
    ProcessingJobResponse,
    IngestionResultResponse,
)
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions, get_current_user, require_classification_level
from app.services.evidence_service import evidence_service
from app.services.storage import storage_service

router = APIRouter(prefix="/files", tags=["Evidence & Files"])


@router.post("/", response_model=EvidenceFileResponse)
async def upload_evidence_file(
    request: Request,
    source_type: str = Query(..., description="Source type of the evidence"),
    description: Optional[str] = Query(None),
    case_id: Optional[str] = Query(None),
    classification: str = Query("INTERNAL"),
    tags: Optional[str] = Query(None),
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_classification_level("INTERNAL")),
):
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    result = await evidence_service.upload_file(
        db=db,
        file=file,
        uploaded_by=str(current_user.id),
        source_type=source_type,
        description=description,
        tags=tag_list,
        case_id=case_id,
        classification=classification,
    )
    return result


@router.get("/", response_model=List[EvidenceFileResponse])
async def list_evidence_files(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    file_type: Optional[str] = Query(None),
    source_type: Optional[str] = Query(None),
    case_id: Optional[str] = Query(None),
    processing_status: Optional[str] = Query(None),
    classification: Optional[str] = Query(None),
    uploaded_by: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"])),
):
    items, total = await evidence_service.list_files(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        file_type=file_type,
        source_type=source_type,
        case_id=case_id,
        processing_status=processing_status,
        classification=classification,
        uploaded_by=uploaded_by,
        date_from=date_from,
        date_to=date_to,
    )
    return items


@router.get("/{file_id}", response_model=EvidenceFileResponse)
async def get_evidence_file(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"])),
):
    return await evidence_service.get_file(db, file_id, str(current_user.id))


@router.get("/{file_id}/download")
async def download_evidence_file(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"])),
):
    doc = await evidence_service.get_file(db, file_id, str(current_user.id))
    content = await evidence_service.get_file_content(doc.storage_key)
    await evidence_service._record_audit(db, file_id, str(current_user.id), "FILE_DOWNLOADED", {"filename": doc.original_filename})
    return StreamingResponse(
        io.BytesIO(content),
        media_type=doc.mime_type,
        headers={
            "Content-Disposition": f"attachment; filename=\"{doc.original_filename}\"",
            "X-Checksum-SHA256": doc.checksum_sha256 or "",
        },
    )


@router.patch("/{file_id}", response_model=EvidenceFileResponse)
async def update_evidence_file(
    file_id: str,
    update_in: EvidenceFileUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.update"])),
):
    return await evidence_service.update_file(db, file_id, update_in, str(current_user.id))


@router.delete("/{file_id}")
async def delete_evidence_file(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.delete"])),
):
    success = await evidence_service.delete_file(db, file_id, str(current_user.id))
    return {"success": success}


@router.post("/{file_id}/restore", response_model=EvidenceFileResponse)
async def restore_evidence_file(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.delete"])),
):
    return await evidence_service.restore_file(db, file_id, str(current_user.id))


@router.post("/{file_id}/link-case", response_model=EvidenceFileResponse)
async def link_evidence_to_case(
    file_id: str,
    case_id: str = Query(..., description="Case ID to link to"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.update", "cases.update"])),
):
    return await evidence_service.link_case(db, file_id, case_id, str(current_user.id))


@router.post("/{file_id}/unlink-case", response_model=EvidenceFileResponse)
async def unlink_evidence_from_case(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.update", "cases.update"])),
):
    return await evidence_service.unlink_case(db, file_id, str(current_user.id))


@router.get("/{file_id}/versions", response_model=List[EvidenceVersionBase])
async def get_evidence_versions(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"])),
):
    return await evidence_service.get_versions(db, file_id)


@router.get("/{file_id}/audit")
async def get_evidence_audit(
    file_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["audit.read", "documents.read"])),
):
    items = await evidence_service.get_audit(db, file_id, skip=skip, limit=limit)
    return items


@router.get("/{file_id}/processing", response_model=List[ProcessingJobResponse])
async def get_evidence_processing_jobs(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"])),
):
    return await evidence_service.get_processing_jobs(db, file_id)


@router.post("/{file_id}/versions", response_model=EvidenceVersionResponse)
async def create_evidence_version(
    file_id: str,
    change_description: str = Query(..., description="Description of changes"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.update"])),
):
    doc = await evidence_service.get_file(db, file_id, str(current_user.id))
    version = await evidence_service._create_version(db, {"_id": ObjectId(file_id), "version": doc.version, "stored_filename": doc.stored_filename, "storage_key": doc.storage_key, "size_bytes": doc.size_bytes, "checksum_sha256": doc.checksum_sha256}, str(current_user.id), change_description)
    versions = await evidence_service.get_versions(db, file_id)
    return versions[-1]


@router.get("/{file_id}/verify")
async def verify_evidence_integrity(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"])),
):
    result = await evidence_service.verify_integrity(db, file_id)
    return result


@router.get("/{file_id}/preview")
async def preview_evidence_file(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"])),
):
    doc = await evidence_service.get_file(db, file_id, str(current_user.id))
    content = await evidence_service.get_file_content(doc.storage_key)
    ext = doc.extension.lower()
    if ext in ("txt", "csv", "json", "xml", "yaml", "yml"):
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(content=content.decode("utf-8", errors="replace"), media_type="text/plain")
    elif ext in ("jpg", "jpeg", "png", "gif", "bmp", "webp"):
        from fastapi.responses import Response
        return Response(content=content, media_type=doc.mime_type)
    elif ext == "pdf":
        from fastapi.responses import Response
        return Response(content=content, media_type="application/pdf")
    elif ext in ("mp4", "avi", "mov", "mkv", "webm"):
        from fastapi.responses import Response
        return Response(content=content, media_type="video/mp4")
    elif ext in ("mp3", "wav", "ogg", "m4a", "flac"):
        from fastapi.responses import Response
        return Response(content=content, media_type="audio/mpeg")
    else:
        return {"preview": "unavailable", "message": "Preview not supported for this file type. Download to view."}


@router.get("/{file_id}/metadata")
async def get_evidence_metadata(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read"])),
):
    doc = await evidence_service.get_file(db, file_id, str(current_user.id))
    return {
        "id": doc.id,
        "original_filename": doc.original_filename,
        "mime_type": doc.mime_type,
        "extension": doc.extension,
        "size_bytes": doc.size_bytes,
        "checksum_sha256": doc.checksum_sha256,
        "storage_provider": doc.storage_provider,
        "source_type": doc.source_type,
        "classification": doc.classification,
        "processing_status": doc.processing_status,
        "uploaded_by": doc.uploaded_by,
        "uploaded_at": doc.uploaded_at.isoformat(),
        "updated_at": doc.updated_at.isoformat(),
        "version": doc.version,
        "is_original": doc.is_original,
    }
