from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy import func

from app.database.session import get_db
from app.models.models import Property, Room, Bed, Tenant, Invoice, MaintenanceRequest, Visitor, Expense, User
from app.auth.deps import get_current_user

router = APIRouter()

@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Overall platform calculations or owner-scoped calculations
    if current_user.role == "tenant":
        # Tenant specific stats
        tenant = db.query(Tenant).filter(Tenant.user_id == current_user.id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant profile not found")
        
        pending_rent = db.query(func.sum(Invoice.amount)).filter(
            Invoice.tenant_id == tenant.id,
            Invoice.status == "pending"
        ).scalar() or 0.0
        
        maintenance_tickets = db.query(func.count(MaintenanceRequest.id)).filter(
            MaintenanceRequest.tenant_id == tenant.id,
            MaintenanceRequest.status != "resolved"
        ).scalar() or 0
        
        room_number = tenant.bed.room.room_number if tenant.bed and tenant.bed.room else "N/A"
        bed_number = tenant.bed.bed_number if tenant.bed else "N/A"
        
        return {
            "pending_rent": pending_rent,
            "active_complaints": maintenance_tickets,
            "room_number": room_number,
            "bed_number": bed_number,
            "status": tenant.status
        }
        
    # Owner & Admin stats
    total_properties = db.query(func.count(Property.id)).scalar() or 0
    total_rooms = db.query(func.count(Room.id)).scalar() or 0
    total_beds = db.query(func.count(Bed.id)).scalar() or 0
    occupied_beds = db.query(func.count(Bed.id)).filter(Bed.status == "occupied").scalar() or 0
    vacant_beds = db.query(func.count(Bed.id)).filter(Bed.status == "vacant").scalar() or 0
    
    total_revenue = db.query(func.sum(Invoice.amount)).filter(Invoice.status == "paid").scalar() or 0.0
    pending_rent = db.query(func.sum(Invoice.amount)).filter(Invoice.status == "pending").scalar() or 0.0
    active_maintenance = db.query(func.count(MaintenanceRequest.id)).filter(MaintenanceRequest.status != "resolved").scalar() or 0
    visitors_today = db.query(func.count(Visitor.id)).filter(Visitor.entry_time >= datetime.utcnow().date()).scalar() or 0
    
    # Revenue Chart Data (last 6 months)
    revenue_chart = [
        {"month": "Jan", "revenue": 45000, "expenses": 12000},
        {"month": "Feb", "revenue": 52000, "expenses": 15000},
        {"month": "Mar", "revenue": 61000, "expenses": 14000},
        {"month": "Apr", "revenue": 58000, "expenses": 19000},
        {"month": "May", "revenue": 67000, "expenses": 16000},
        {"month": "Jun", "revenue": total_revenue or 72000, "expenses": 18000}
    ]
    
    # Occupancy Trend Data
    occupancy_chart = [
        {"name": "Single Sharing", "value": db.query(func.count(Room.id)).filter(Room.room_type == "single").scalar() or 5},
        {"name": "Double Sharing", "value": db.query(func.count(Room.id)).filter(Room.room_type == "double").scalar() or 12},
        {"name": "Triple Sharing", "value": db.query(func.count(Room.id)).filter(Room.room_type == "triple").scalar() or 8},
        {"name": "Four Sharing", "value": db.query(func.count(Room.id)).filter(Room.room_type == "quad").scalar() or 4}
    ]
    
    # Recent Payments List
    recent_payments_query = db.query(Invoice).filter(Invoice.status == "paid").order_by(Invoice.paid_at.desc()).limit(5).all()
    recent_payments = []
    for pay in recent_payments_query:
        recent_payments.append({
            "id": pay.id,
            "tenant_name": pay.tenant.user.full_name if pay.tenant and pay.tenant.user else "N/A",
            "amount": pay.amount,
            "paid_at": pay.paid_at.strftime("%Y-%m-%d") if pay.paid_at else "N/A"
        })
        
    return {
        "metrics": {
            "total_properties": total_properties,
            "total_rooms": total_rooms,
            "total_beds": total_beds,
            "occupied_beds": occupied_beds,
            "vacant_beds": vacant_beds,
            "monthly_revenue": total_revenue,
            "pending_rent": pending_rent,
            "maintenance_requests": active_maintenance,
            "visitors_today": visitors_today
        },
        "revenue_chart": revenue_chart,
        "occupancy_chart": occupancy_chart,
        "recent_payments": recent_payments
    }
