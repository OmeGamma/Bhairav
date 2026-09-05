from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.schemas.user import UserInDB
from app.middleware.auth import require_permissions
from app.services.networkx_bridge import sync_entities_to_graph as nx_sync, rebuild_graph as nx_rebuild

router = APIRouter(prefix="/networkx", tags=["NetworkX Bridge"])


@router.post("/sync/{file_id}")
async def sync_evidence_to_graph(
    file_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.create"])),
):
    result = await nx_sync(db, file_id)
    return result


@router.post("/rebuild")
async def rebuild_graph_endpoint(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: UserInDB = Depends(require_permissions(["network.read"])),
):
    result = await nx_rebuild(db)
    return result
