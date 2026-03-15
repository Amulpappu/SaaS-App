from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import models
from database import engine

from auth import router as auth_router
from team_routes import router as team_router
from billing import router as billing_router
from analytics_routes import router as analytics_router
from admin_routes import router as admin_router

# Initialize database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SaaS Platform API", description="Robust backend for a SaaS Platform")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(team_router, prefix="/api/teams", tags=["Teams"])
app.include_router(billing_router, prefix="/api/billing", tags=["Billing"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the SaaS Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
