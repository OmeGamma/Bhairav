"""
BHAIRAV NetworkX Bridge Service.

Connects evidence-extracted entities and relationships to the existing
NetworkX graph engine, so that entity extraction from evidence files
feeds directly into the network analytics pipeline.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.services.network_engine import build_graph, compute_centrality, detect_indicators


async def sync_entities_to_graph(db: AsyncIOMotorDatabase, file_id: str) -> Dict[str, Any]:
    """
    Sync entities and relationships from evidence extraction collections
    into the network_entities / relationships collections used by NetworkX.
    """
    results: Dict[str, Any] = {
        "entities_synced": 0,
        "relationships_synced": 0,
        "skipped_entities": 0,
        "skipped_relationships": 0,
    }

    # Fetch extracted entities for this file
    cursor = db.extracted_entities.find({"file_id": file_id})
    async for ext_ent in cursor:
        canonical_name = ext_ent.get("canonical_name")
        entity_type = ext_ent.get("entity_type", "ENTITY")
        if not canonical_name:
            results["skipped_entities"] += 1
            continue

        # Check if network entity already exists
        existing = await db.network_entities.find_one({
            "entity_type": entity_type,
            "label": canonical_name,
        })
        if existing:
            # Update source_files reference if needed
            await db.network_entities.update_one(
                {"_id": existing["_id"]},
                {"$addToSet": {"source_files": file_id}}
            )
        else:
            network_ent = {
                "entity_type": entity_type,
                "reference_id": ext_ent.get("id", str(ObjectId())),
                "label": canonical_name,
                "metadata": {
                    "confidence": ext_ent.get("confidence", 0.0),
                    "extraction_method": ext_ent.get("extraction_method", "regex"),
                    "source_file_id": file_id,
                },
                "source_files": [file_id],
                "_demo": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            await db.network_entities.insert_one(network_ent)
        results["entities_synced"] += 1

    # Fetch extracted relationships for this file
    cursor = db.extracted_relationships.find({"file_id": file_id})
    async for ext_rel in cursor:
        src_name = ext_rel.get("source_entity_name")
        tgt_name = ext_rel.get("target_entity_name")
        rel_type = ext_rel.get("relationship_type", "ASSOCIATED_WITH")
        confidence = ext_rel.get("confidence", 0.5)

        if not src_name or not tgt_name:
            results["skipped_relationships"] += 1
            continue

        src = await db.network_entities.find_one({"label": src_name})
        tgt = await db.network_entities.find_one({"label": tgt_name})
        if not src or not tgt:
            results["skipped_relationships"] += 1
            continue

        existing_rel = await db.relationships.find_one({
            "source_entity_id": str(src["_id"]),
            "target_entity_id": str(tgt["_id"]),
            "relationship_type": rel_type,
        })
        if not existing_rel:
            rel_doc = {
                "source_entity_id": str(src["_id"]),
                "target_entity_id": str(tgt["_id"]),
                "relationship_type": rel_type,
                "confidence": confidence,
                "source_file_id": file_id,
                "source": "EVIDENCE_EXTRACTION",
                "status": "INFERRED",
                "timestamp": datetime.utcnow(),
                "_demo": False,
            }
            await db.relationships.insert_one(rel_doc)
        results["relationships_synced"] += 1

    return results


async def rebuild_graph(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """Rebuild the NetworkX graph from all current data."""
    G, meta = await build_graph(db)
    centrality = compute_centrality(G)
    return {
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "centrality_computed": len(centrality),
    }


networkx_bridge_service = type("Obj", (), {
    "sync_entities_to_graph": staticmethod(sync_entities_to_graph),
    "rebuild_graph": staticmethod(rebuild_graph),
})()
