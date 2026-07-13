from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base, ensure_tenant_columns

# Import all endpoints
from app.api.endpoints import (
    auth, properties, rooms, tenants, rent,
    maintenance, visitors, attendance, notices,
    expenses, agreements, reports
)

# Create tables
ensure_tenant_columns()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(properties.router, prefix=f"{settings.API_V1_STR}/properties", tags=["Property Management"])
app.include_router(rooms.router, prefix=f"{settings.API_V1_STR}/rooms", tags=["Room Management"])
app.include_router(tenants.router, prefix=f"{settings.API_V1_STR}/tenants", tags=["Tenant Management"])
app.include_router(rent.router, prefix=f"{settings.API_V1_STR}/rent", tags=["Rent Collection"])
app.include_router(maintenance.router, prefix=f"{settings.API_V1_STR}/maintenance", tags=["Maintenance Management"])
app.include_router(visitors.router, prefix=f"{settings.API_V1_STR}/visitors", tags=["Visitor Management"])
app.include_router(attendance.router, prefix=f"{settings.API_V1_STR}/attendance", tags=["Attendance Tracker"])
app.include_router(notices.router, prefix=f"{settings.API_V1_STR}/notices", tags=["Notice Board"])
app.include_router(expenses.router, prefix=f"{settings.API_V1_STR}/expenses", tags=["Expense Management"])
app.include_router(agreements.router, prefix=f"{settings.API_V1_STR}/agreements", tags=["Digital Agreements"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Analytical Reports"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to StaySphere API v1.0",
        "docs": "/docs",
        "status": "online"
    }
