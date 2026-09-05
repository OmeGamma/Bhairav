from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import re

from app.core.database import get_db
from app.schemas.entity_extraction import (
    EntityCreate,
    EntityUpdate,
    EntityResponse,
    RelationshipCreate,
    RelationshipResponse,
    ENTITY_TYPES,
    RELATIONSHIP_TYPES,
)
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/entities", tags=["Entities"])


@router.get("/", response_model=List[EntityResponse])
async def list_entities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    entity_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read", "persons.read", "vehicles.read"]))
):
    query = {}
    if entity_type:
        query["entity_type"] = entity_type.upper()
    if search:
        query["$or"] = [
            {"canonical_name": {"$regex": search, "$options": "i"}},
            {"aliases": {"$in": [re.compile(re.escape(search), re.IGNORECASE)]}},
        ]
    cursor = db.entities.find(query).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
        item["id"] = item.pop("_id")
    return items


@router.get("/{entity_id}", response_model=EntityResponse)
async def get_entity(
    entity_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    if not ObjectId.is_valid(entity_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.entities.find_one({"_id": ObjectId(entity_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Entity not found")
    item["_id"] = str(item["_id"])
    item["id"] = item.pop("_id")
    return EntityResponse(**item)


@router.post("/", response_model=EntityResponse)
async def create_entity(
    item_in: EntityCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.create"]))
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    result = await db.entities.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    item_dict["id"] = item_dict.pop("_id")
    return EntityResponse(**item_dict)


@router.patch("/{entity_id}", response_model=EntityResponse)
async def update_entity(
    entity_id: str,
    item_in: EntityUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.update"]))
):
    if not ObjectId.is_valid(entity_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    update_data = item_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
    update_data["updated_at"] = datetime.utcnow()
    await db.entities.update_one({"_id": ObjectId(entity_id)}, {"$set": update_data})
    item = await db.entities.find_one({"_id": ObjectId(entity_id)})
    item["_id"] = str(item["_id"])
    item["id"] = item.pop("_id")
    return EntityResponse(**item)


@router.get("/{entity_id}/relationships", response_model=List[RelationshipResponse])
async def get_entity_relationships(
    entity_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    cursor = db.relationships.find({
        "$or": [
            {"source_entity_id": entity_id},
            {"target_entity_id": entity_id},
        ]
    })
    items = await cursor.to_list(length=200)
    for item in items:
        item["_id"] = str(item["_id"])
        item["id"] = item.pop("_id")
    return [RelationshipResponse(**item) for item in items]


@router.get("/{entity_id}/evidence")
async def get_entity_evidence(
    entity_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["documents.read", "network.read"]))
):
    rels = await db.extracted_relationships.find({
        "$or": [
            {"source_entity_id": entity_id},
            {"target_entity_id": entity_id},
        ]
    }).to_list(length=200)
    file_ids = list({r["file_id"] for r in rels if r.get("file_id")})
    evidence = []
    for fid in file_ids:
        if ObjectId.is_valid(fid):
            doc = await db.evidence_files.find_one({"_id": ObjectId(fid)})
            if doc:
                doc["_id"] = str(doc["_id"])
                doc["id"] = doc.pop("_id")
                evidence.append(doc)
    return evidence


@router.get("/{entity_id}/related-entities")
async def get_related_entities(
    entity_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    rels = await db.relationships.find({
        "$or": [
            {"source_entity_id": entity_id},
            {"target_entity_id": entity_id},
        ]
    }).to_list(length=200)
    related_ids = set()
    for r in rels:
        if r.get("source_entity_id") and r["source_entity_id"] != entity_id:
            related_ids.add(r["source_entity_id"])
        if r.get("target_entity_id") and r["target_entity_id"] != entity_id:
            related_ids.add(r["target_entity_id"])
    entities = []
    for eid in related_ids:
        if ObjectId.is_valid(eid):
            doc = await db.entities.find_one({"_id": ObjectId(eid)})
            if doc:
                doc["_id"] = str(doc["_id"])
                doc["id"] = doc.pop("_id")
                entities.append(EntityResponse(**doc))
    return entities
