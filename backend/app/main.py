from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("="*40)
    print("BHAIRAV SYSTEM STARTUP")
    print("="*40)
    print(f"MongoDB: {'CONNECTED' if settings.MONGODB_URI else 'MISSING URI'}")
    print(f"JWT Auth: {'CONFIGURED' if settings.JWT_SECRET else 'CRITICAL: MISSING JWT_SECRET'}")
    print("="*40)
    
    if not settings.JWT_SECRET:
        print("CRITICAL ERROR: Cannot start application without JWT_SECRET.")
        import sys
        sys.exit(1)

    await connect_to_mongo()
    
    from app.core.security import get_password_hash
    from datetime import datetime
    db = get_db()
    if db is not None:
        admin_email = "admin@gmail.com"
        admin_user = await db.users.find_one({"email": admin_email})
        if not admin_user:
            print(f"Creating default admin account: {admin_email}")
            await db.users.insert_one({
                "email": admin_email,
                "password_hash": get_password_hash("admin@123"),
                "name": "System Admin",
                "role_id": "admin",
                "status": "ACTIVE",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
        else:
            print(f"Admin account exists: {admin_email}")

        # Ensure default roles exist
        admin_role = await db.roles.find_one({"_id": "admin"})
        if not admin_role:
            await db.roles.insert_one({
                "_id": "admin",
                "name": "admin",
                "permissions": ["system.admin"]
            })
            print("Created default admin role")

        officer_role = await db.roles.find_one({"_id": "officer"})
        if not officer_role:
            await db.roles.insert_one({
                "_id": "officer",
                "name": "officer",
                "permissions": [
                    "cameras.read", "locations.read", "events.read", "incidents.read",
                    "cases.read", "persons.read", "vehicles.read", "documents.read",
                    "verification.read", "network.read", "personnel.read", "welfare.read",
                    "support.read", "search.execute", "reports.read", "audit.read"
                ]
            })
            print("Created default officer role")

    yield
    await close_mongo_connection()

app = FastAPI(
    title="Bhairav API",
    description="AI-Powered Defence & Security Intelligence Platform API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api/v1")

@app.get("/health", tags=["Health"])
async def health_check():
    db = get_db()
    db_status = "connected" if db is not None else "disconnected"
    return {
        "status": "ok",
        "database": db_status
    }

from app.api import (
    auth, users, cameras, locations, security_zones,
    events, incidents, cases, persons, vehicles,
    documents, verification, network,
    personnel, welfare, support,
    notifications, audit, search, reports, stats
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(cameras.router, prefix="/api/v1")
app.include_router(locations.router, prefix="/api/v1")
app.include_router(security_zones.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(incidents.router, prefix="/api/v1")
app.include_router(cases.router, prefix="/api/v1")
app.include_router(persons.router, prefix="/api/v1")
app.include_router(vehicles.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(verification.router, prefix="/api/v1")
app.include_router(network.router, prefix="/api/v1")
app.include_router(personnel.router, prefix="/api/v1")
app.include_router(welfare.router, prefix="/api/v1")
app.include_router(support.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")

from app.api.ai_routes import vision, document, identity, network as ai_network, welfare as ai_welfare, assistant, voice, video_processing
from app.api import websocket

app.include_router(vision.router, prefix="/api/v1/ai", tags=["vision"])
app.include_router(document.router, prefix="/api/v1/ai", tags=["document"])
app.include_router(identity.router, prefix="/api/v1/ai", tags=["identity"])
app.include_router(ai_network.router, prefix="/api/v1/ai", tags=["network"])
app.include_router(ai_welfare.router, prefix="/api/v1/ai", tags=["welfare"])
app.include_router(assistant.router, prefix="/api/v1/ai", tags=["assistant"])
app.include_router(voice.router, prefix="/api/v1/ai", tags=["voice"])
app.include_router(video_processing.router, prefix="/api/v1/ai", tags=["video_processing"])
app.include_router(websocket.router)

app.include_router(api_router)
