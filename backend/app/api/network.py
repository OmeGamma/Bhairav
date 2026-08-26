from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from datetime import datetime

from app.core.database import get_db
from app.schemas.network import (
    NetworkEntityCreate, NetworkEntityResponse, 
    RelationshipCreate, RelationshipResponse,
    GraphResponse
)
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/network", tags=["Network Intelligence"])

@router.get("/entities", response_model=List[NetworkEntityResponse])
async def get_network_entities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    cursor = db.network_entities.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.get("/entities/{entity_id}", response_model=NetworkEntityResponse)
async def get_network_entity(
    entity_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    if not ObjectId.is_valid(entity_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    item = await db.network_entities.find_one({"_id": ObjectId(entity_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item["_id"] = str(item["_id"])
    return item

@router.post("/entities", response_model=NetworkEntityResponse)
async def create_network_entity(
    item_in: NetworkEntityCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.create"]))
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    result = await db.network_entities.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.get("/relationships", response_model=List[RelationshipResponse])
async def get_relationships(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    cursor = db.relationships.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.post("/relationships", response_model=RelationshipResponse)
async def create_relationship(
    item_in: RelationshipCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.create"]))
):
    item_dict = item_in.model_dump()
    item_dict["created_at"] = datetime.utcnow()
    item_dict["updated_at"] = datetime.utcnow()
    result = await db.relationships.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

@router.get("/graph/{entity_id}", response_model=GraphResponse)
async def get_network_graph(
    entity_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    if not ObjectId.is_valid(entity_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    # Very basic graph retrieval: 1-hop relationships
    edges_cursor = db.relationships.find({
        "$or": [
            {"source_entity_id": entity_id},
            {"target_entity_id": entity_id}
        ]
    })
    edges_docs = await edges_cursor.to_list(length=100)
    
    entity_ids = set([entity_id])
    edges = []
    for ed in edges_docs:
        entity_ids.add(ed["source_entity_id"])
        entity_ids.add(ed["target_entity_id"])
        edges.append({
            "source": ed["source_entity_id"],
            "target": ed["target_entity_id"],
            "relationship": ed["relationship_type"],
            "timestamp": ed.get("created_at", datetime.utcnow()),
            "metadata": ed.get("evidence_metadata")
        })
    
    nodes_cursor = db.network_entities.find({
        "_id": {"$in": [ObjectId(eid) for eid in entity_ids if ObjectId.is_valid(eid)]}
    })
    nodes_docs = await nodes_cursor.to_list(length=100)
    
    nodes = []
    for nd in nodes_docs:
        nodes.append({
            "id": str(nd["_id"]),
            "type": nd["entity_type"],
            "label": nd["label"],
            "metadata": nd.get("metadata")
        })

    return {"nodes": nodes, "edges": edges, "metadata": {"hop_count": 1}}

@router.get("/timeline/{entity_id}")
async def get_network_timeline(
    entity_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    # Mocking timeline for the SIH structure
    return {"timeline": []}
