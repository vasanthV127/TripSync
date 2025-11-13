import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db import get_db, close_db
from app.routers import auth, buses, routes, attendance, students, messaging, drivers, admin
from app.seed import seed_database

app = FastAPI(title="TripSync API")

# CORS (lock down in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(buses.router)
app.include_router(routes.router)
app.include_router(attendance.router)
app.include_router(students.router)
app.include_router(messaging.router)
app.include_router(drivers.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    """Root endpoint for health checks"""
    return {
        "status": "ok",
        "service": "TripSync API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    """Run database seeding on startup"""
    await seed_database()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()
