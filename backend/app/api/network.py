from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Set, Dict, Any
from bson import ObjectId
from datetime import datetime, timedelta

from app.core.database import get_db
from app.schemas.network import (
    NetworkEntityCreate, NetworkEntityResponse,
    RelationshipCreate, RelationshipResponse,
    GraphResponse, GraphNode, GraphEdge
)
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions

router = APIRouter(prefix="/network", tags=["Network Intelligence"])


ENTITY_COLLECTIONS: Dict[str, str] = {
    "PERSON": "persons",
    "VEHICLE": "vehicles",
    "LOCATION": "locations",
    "INCIDENT": "incidents",
    "CASE": "cases",
    "ORGANIZATION": "organizations",
    "PHONE": "phones",
    "EVENT": "events",
    "INVESTIGATION": "cases",
    "DOCUMENT": "documents",
}


def _oid_or_str(value: str) -> Any:
    """Return ObjectId if the string is a valid ObjectId, else return the raw string."""
    if ObjectId.is_valid(value):
        return ObjectId(value)
    return value


@router.get("/entities", response_model=List[NetworkEntityResponse])
async def get_network_entities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    cursor = db.network_entities.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
        item.setdefault("created_at", None)
        item.setdefault("updated_at", None)
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
    limit: int = Query(200, ge=1, le=500),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    cursor = db.relationships.find().skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for item in items:
        item["_id"] = str(item["_id"])
        # Normalize legacy source_id/target_id to source_entity_id/target_entity_id
        if "source_entity_id" not in item and "source_id" in item:
            item["source_entity_id"] = item["source_id"]
        if "target_entity_id" not in item and "target_id" in item:
            item["target_entity_id"] = item["target_id"]
        item.setdefault("created_at", None)
        item.setdefault("updated_at", None)
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


def _coerce_entity_id(value: Any) -> str:
    if isinstance(value, ObjectId):
        return str(value)
    return str(value)


def _matches_filters(doc: dict, entity_types: Optional[List[str]], since: Optional[datetime]) -> bool:
    if entity_types:
        if doc.get("entity_type") not in entity_types:
            return False
    if since and isinstance(doc.get("created_at"), datetime) and doc["created_at"] < since:
        return False
    if since and isinstance(doc.get("timestamp"), datetime) and doc["timestamp"] < since:
        return False
    return True


@router.get("/graph", response_model=GraphResponse)
async def get_graph(
    entity_types: Optional[str] = Query(None, description="Comma-separated entity types (PERSON,VEHICLE,...)"),
    relationship_types: Optional[str] = Query(None, description="Comma-separated relationship types"),
    since: Optional[datetime] = Query(None, description="Only relationships after this ISO timestamp"),
    investigation_id: Optional[str] = Query(None, description="Limit to a single investigation"),
    limit: int = Query(150, ge=1, le=500),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    """Return nodes + edges for the full graph (or filtered subset)."""
    types_list: Optional[List[str]] = None
    if entity_types:
        types_list = [t.strip().upper() for t in entity_types.split(",") if t.strip()]

    rel_list: Optional[List[str]] = None
    if relationship_types:
        rel_list = [r.strip().upper() for r in relationship_types.split(",") if r.strip()]

    rel_query: dict = {}
    if rel_list:
        rel_query["relationship_type"] = {"$in": rel_list}
    if since:
        rel_query["$or"] = [
            {"timestamp": {"$gte": since}},
            {"created_at": {"$gte": since}},
        ]

    rels_cursor = db.relationships.find(rel_query).limit(limit * 4)
    rels = await rels_cursor.to_list(length=limit * 4)

    if investigation_id:
        rels = [
            r for r in rels
            if r.get("investigation_id") == investigation_id
            or r.get("metadata", {}).get("investigation_id") == investigation_id
        ]

    rels = rels[:limit]

    entity_ids: Set[str] = set()
    edges: List[GraphEdge] = []
    for r in rels:
        src = _coerce_entity_id(r.get("source_entity_id") or r.get("source_id") or r.get("source"))
        tgt = _coerce_entity_id(r.get("target_entity_id") or r.get("target_id") or r.get("target"))
        if not src or not tgt:
            continue
        entity_ids.add(src)
        entity_ids.add(tgt)
        edges.append({
            "source": src,
            "target": tgt,
            "relationship": r.get("relationship_type", "CONNECTED_TO"),
            "timestamp": r.get("timestamp") or r.get("created_at") or datetime.utcnow(),
            "metadata": r.get("evidence_metadata") or r.get("metadata") or {
                "confidence": r.get("confidence", 1.0),
                "source": r.get("source", "UNKNOWN"),
                "status": r.get("status", "OBSERVED"),
            },
        })

    # Lookup network_entities for richer labels
    obj_ids = [ObjectId(eid) for eid in entity_ids if ObjectId.is_valid(eid)]
    net_docs = await db.network_entities.find(
        {"_id": {"$in": obj_ids}}
    ).to_list(length=len(obj_ids))
    net_map: Dict[str, dict] = {str(d["_id"]): d for d in net_docs}

    nodes: List[GraphNode] = []
    for eid in entity_ids:
        nd = net_map.get(eid)
        if nd:
            etype = nd.get("entity_type", "UNKNOWN")
            if types_list and etype not in types_list:
                continue
            nodes.append({
                "id": eid,
                "type": etype,
                "label": nd.get("label", "Unknown"),
                "metadata": nd.get("metadata", {}),
            })
        else:
            # Build a virtual node so the graph still renders entities that
            # were referenced by a relationship but not yet promoted to network_entities
            inferred_type = "ENTITY"
            nodes.append({
                "id": eid,
                "type": inferred_type,
                "label": eid,
                "metadata": {"_virtual": True},
            })

    return {
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "entity_count": len(nodes),
            "edge_count": len(edges),
            "filters": {
                "entity_types": types_list,
                "relationship_types": rel_list,
                "since": since.isoformat() if since else None,
                "investigation_id": investigation_id,
            },
        },
    }


@router.get("/graph/{entity_id}", response_model=GraphResponse)
async def get_network_graph(
    entity_id: str,
    hops: int = Query(1, ge=1, le=4),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    """BFS-expanded graph around a single entity."""
    visited_ids: Set[str] = {entity_id}
    edges: List[GraphEdge] = []
    frontier: Set[str] = {entity_id}

    for _ in range(hops):
        if not frontier:
            break
        rel_cursor = db.relationships.find({
            "$or": [
                {"source_entity_id": {"$in": list(frontier)}},
                {"source_id": {"$in": list(frontier)}},
                {"source": {"$in": list(frontier)}},
                {"target_entity_id": {"$in": list(frontier)}},
                {"target_id": {"$in": list(frontier)}},
                {"target": {"$in": list(frontier)}},
            ]
        })
        rels = await rel_cursor.to_list(length=400)
        new_frontier: Set[str] = set()
        for r in rels:
            src = _coerce_entity_id(r.get("source_entity_id") or r.get("source_id") or r.get("source"))
            tgt = _coerce_entity_id(r.get("target_entity_id") or r.get("target_id") or r.get("target"))
            if not src or not tgt:
                continue
            visited_ids.update([src, tgt])
            edges.append({
                "source": src,
                "target": tgt,
                "relationship": r.get("relationship_type", "CONNECTED_TO"),
                "timestamp": r.get("timestamp") or r.get("created_at") or datetime.utcnow(),
                "metadata": r.get("evidence_metadata") or r.get("metadata") or {
                    "confidence": r.get("confidence", 1.0),
                    "source": r.get("source", "UNKNOWN"),
                    "status": r.get("status", "OBSERVED"),
                },
            })
            for nid in [src, tgt]:
                if nid not in visited_ids:
                    new_frontier.add(nid)
        frontier = new_frontier

    obj_ids = [ObjectId(eid) for eid in visited_ids if ObjectId.is_valid(eid)]
    nodes_cursor = db.network_entities.find({"_id": {"$in": obj_ids}})
    nodes_docs = await nodes_cursor.to_list(length=len(obj_ids))
    nodes: List[GraphNode] = []
    found_ids: Set[str] = set()
    for nd in nodes_docs:
        nid = str(nd["_id"])
        found_ids.add(nid)
        nodes.append({
            "id": nid,
            "type": nd.get("entity_type", "UNKNOWN"),
            "label": nd.get("label", "Unknown"),
            "metadata": nd.get("metadata", {}),
        })
    # Virtual nodes for referenced-but-unindexed ids
    for eid in visited_ids:
        if eid not in found_ids:
            nodes.append({
                "id": eid,
                "type": "ENTITY",
                "label": eid,
                "metadata": {"_virtual": True},
            })

    return {"nodes": nodes, "edges": edges, "metadata": {"hop_count": hops, "center": entity_id}}


@router.get("/entity/{entity_id}/details")
async def get_entity_full_details(
    entity_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"]))
):
    """Returns full details for the right-side panel: name, type, status, related events/cases, count, connections."""
    record: Optional[dict] = None
    if ObjectId.is_valid(entity_id):
        record = await db.network_entities.find_one({"_id": ObjectId(entity_id)})

    related: Dict[str, Any] = {"events": [], "cases": [], "vehicles": [], "locations": []}

    if record:
        etype = record.get("entity_type")
        ref_id = record.get("reference_id")
        if etype and ref_id:
            coll = ENTITY_COLLECTIONS.get(etype)
            if coll:
                detail = await db[coll].find_one({"_id": _oid_or_str(ref_id)})
                if detail:
                    detail["_id"] = str(detail["_id"])
                    related[f"{etype.lower()}s"] = [detail] if not isinstance(detail.get("_id"), list) else detail

    rels = await db.relationships.find({
        "$or": [
            {"source_entity_id": entity_id},
            {"target_entity_id": entity_id},
        ]
    }).to_list(length=200)

    connections_count = len(rels)

    return {
        "id": entity_id,
        "type": record.get("entity_type") if record else "ENTITY",
        "label": record.get("label", entity_id) if record else entity_id,
        "status": record.get("metadata", {}).get("status", "OBSERVED") if record else "OBSERVED",
        "reference_id": record.get("reference_id") if record else None,
        "connections_count": connections_count,
        "related": related,
        "metadata": record.get("metadata", {}) if record else {},
    }


@router.get("/timeline/{entity_id}")
async def get_network_timeline(
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
    rels.sort(key=lambda r: r.get("timestamp") or r.get("created_at") or datetime.min, reverse=True)

    timeline = [
        {
            "id": str(r["_id"]),
            "timestamp": (r.get("timestamp") or r.get("created_at") or datetime.utcnow()).isoformat(),
            "type": r.get("relationship_type", "CONNECTED_TO"),
            "source": r.get("source", "UNKNOWN"),
            "confidence": r.get("confidence", 1.0),
            "status": r.get("status", "OBSERVED"),
            "summary": f"{r.get('relationship_type','LINK')} → {_coerce_entity_id(r.get('target_entity_id') or r.get('target_id') or r.get('target'))}",
        }
        for r in rels
    ]
    return {"timeline": timeline}
