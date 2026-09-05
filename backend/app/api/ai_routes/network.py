from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any
from fastapi import Depends

from app.schemas.ai_schemas import NetworkAnalyzeResponse, NetworkIndicator
from app.core.database import get_db
from app.services.network_engine import analyze

router = APIRouter()


@router.post("/network/analyze", response_model=NetworkAnalyzeResponse)
async def analyze_network(
    payload: Dict[str, Any],
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    BHAIRAV Network Intelligence Engine (real graph + centrality).

    Builds a NetworkX graph from MongoDB `network_entities` + `relationships`,
    then computes degree / betweenness / closeness centrality and PageRank.
    Indicators are derived from the entity's role in the graph.
    """
    entity_id = payload.get("entity_id")
    if not entity_id:
        raise HTTPException(status_code=400, detail="entity_id is required")

    result = await analyze(db, entity_id)

    return NetworkAnalyzeResponse(
        entity_id=result["entity_id"],
        indicators=[NetworkIndicator(**i) for i in result["indicators"]],
        related_entities=result["related_entities"],
        timeline=result["timeline"],
        explanation=result["explanation"],
        centrality=result["centrality"],
        summary=result["summary"],
        model_info=result["model_info"],
    )
