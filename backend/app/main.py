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
    # Startup Validation Check
    print("="*40)
    print("BHAIRAV SYSTEM STARTUP DIAGNOSTICS")
    print("="*40)
    
    # Core Checks
    print(f"MongoDB: {'CONNECTED' if settings.MONGODB_URI else 'MISSING URI'}")
    print(f"JWT Auth: {'CONFIGURED' if settings.JWT_SECRET else 'CRITICAL: MISSING JWT_SECRET'}")
    
    # Storage Check
    has_storage = all([settings.STORAGE_ENDPOINT, settings.STORAGE_ACCESS_KEY, settings.STORAGE_SECRET_KEY, settings.STORAGE_BUCKET])
    print(f"Storage: {'CONFIGURED' if has_storage else 'NOT CONFIGURED'}")
    
    # AI Services
    has_ai = settings.AI_SERVICE_URL and settings.AI_SERVICE_API_KEY
    print(f"AI Service: {'CONFIGURED' if has_ai else 'NOT CONFIGURED'}")
    print(f"LLM: {'CONFIGURED' if settings.LLM_API_KEY else 'NOT CONFIGURED'}")
    
    # Vector DB
    has_vector = settings.VECTOR_DB_URL and settings.VECTOR_DB_KEY
    print(f"Vector DB: {'CONFIGURED' if has_vector else 'NOT CONFIGURED'}")
    print("="*40)
    
    if not settings.JWT_SECRET:
        print("CRITICAL ERROR: Cannot start application without JWT_SECRET.")
        import sys
        sys.exit(1)

    # Startup
    await connect_to_mongo()
    
    # Initialize Admin Account
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
            print(f"Admin account already exists: {admin_email}")

    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="Bhairav API",
    description="AI-Powered Defence & Security Intelligence Platform API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router V1
api_router = APIRouter(prefix="/api/v1")

@app.get("/health", tags=["Health"])
async def health_check():
    db = get_db()
    db_status = "connected" if db is not None else "disconnected"
    return {
        "status": "ok",
        "database": db_status
    }

# Include API Routers
from app.api import (
    auth, users, cameras, locations, security_zones, 
    events, incidents, cases, persons, vehicles,
    documents, verification, network,
    personnel, welfare, support,
    notifications, audit, search, reports
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

# Include AI Routers
from app.api.ai_routes import vision, document, identity, network as ai_network, welfare as ai_welfare, assistant, voice

app.include_router(vision.router, prefix="/api/v1/ai", tags=["vision"])
app.include_router(document.router, prefix="/api/v1/ai", tags=["document"])
app.include_router(identity.router, prefix="/api/v1/ai", tags=["identity"])
app.include_router(ai_network.router, prefix="/api/v1/ai", tags=["network"])
app.include_router(ai_welfare.router, prefix="/api/v1/ai", tags=["welfare"])
app.include_router(assistant.router, prefix="/api/v1/ai", tags=["assistant"])
app.include_router(voice.router, prefix="/api/v1/ai", tags=["voice"])

app.include_router(api_router)
