from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database

# Routers
from app.routers import (
    auth_router,
    analyze_router,
    dashboard_router,
    copilot_router,
    attack_chain_router,
    incident_router,
    intel_router,
    reports_router,
    awareness_router,
    admin_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CyberShield – GenAI: Advanced Cybersecurity Platform integrating Financial Fraud Detection, Technology Threat Analysis, Unified Risk Scoring, and GenAI Copilot.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(analyze_router.router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router.router, prefix=settings.API_V1_STR)
app.include_router(copilot_router.router, prefix=settings.API_V1_STR)
app.include_router(attack_chain_router.router, prefix=settings.API_V1_STR)
app.include_router(incident_router.router, prefix=settings.API_V1_STR)
app.include_router(intel_router.router, prefix=settings.API_V1_STR)
app.include_router(reports_router.router, prefix=settings.API_V1_STR)
app.include_router(awareness_router.router, prefix=settings.API_V1_STR)
app.include_router(admin_router.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "philosophy": "DETECT -> ANALYZE -> EXPLAIN -> ASSESS RISK -> PREVENT -> RESPOND",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "database": "CONNECTED",
        "threat_engine": "ACTIVE",
        "copilot": "READY"
    }
