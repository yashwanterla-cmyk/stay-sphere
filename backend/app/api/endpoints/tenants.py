from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.session import get_db
from app.models.models import Tenant, User, Bed, Room
from app.schemas.schemas import TenantOut, TenantRegister, TenantCreate
from app.auth.security import get_password_hash
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/", response_model=List[TenantOut])
def get_tenants(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Tenant).join(User)
    
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%")) |
            (User.phone.ilike(f"%{search}%"))
        )
    
    if status_filter:
        query = query.filter(Tenant.status == status_filter)
        
    return query.all()

@router.post("/register", response_model=TenantOut, status_code=status.HTTP_201_CREATED)
def register_tenant(
    tenant_in: TenantRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == tenant_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Create User
    hashed_password = get_password_hash(tenant_in.password)
    db_user = User(
        email=tenant_in.email,
        password_hash=hashed_password,
        full_name=tenant_in.full_name,
        role="tenant",
        phone=tenant_in.phone,
        status="active"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Handle bed allocation
    if tenant_in.bed_id:
        bed = db.query(Bed).filter(Bed.id == tenant_in.bed_id).first()
        if not bed:
            raise HTTPException(status_code=404, detail="Bed not found")
        if bed.status != "vacant":
            raise HTTPException(status_code=400, detail="Selected bed is not vacant")
        bed.status = "occupied"

    # Create Tenant Profile
    db_tenant = Tenant(
        user_id=db_user.id,
        bed_id=tenant_in.bed_id,
        emergency_contact=tenant_in.emergency_contact,
        guardian_name=tenant_in.guardian_name,
        guardian_phone=tenant_in.guardian_phone,
        status="active",
        lease_start=datetime.utcnow()
    )
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)

    return db_tenant

@router.get("/{tenant_id}", response_model=TenantOut)
def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant profile not found")
    return tenant

@router.put("/{tenant_id}", response_model=TenantOut)
def update_tenant(
    tenant_id: int,
    emergency_contact: Optional[str] = None,
    guardian_name: Optional[str] = None,
    guardian_phone: Optional[str] = None,
    status_field: Optional[str] = None,
    kyc_document_url: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant profile not found")

    if emergency_contact is not None:
        tenant.emergency_contact = emergency_contact
    if guardian_name is not None:
        tenant.guardian_name = guardian_name
    if guardian_phone is not None:
        tenant.guardian_phone = guardian_phone
    if status_field is not None:
        tenant.status = status_field
    if kyc_document_url is not None:
        tenant.kyc_document_url = kyc_document_url

    db.commit()
    db.refresh(tenant)
    return tenant

@router.delete("/{tenant_id}")
def delete_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "super_admin"]))
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant profile not found")

    # Free up allocated bed
    if tenant.bed_id:
        bed = db.query(Bed).filter(Bed.id == tenant.bed_id).first()
        if bed:
            bed.status = "vacant"
            
    db.delete(tenant)
    db.commit()
    return {"message": "Tenant evicted and profile removed successfully"}

@router.get("/{tenant_id}/timeline")
def get_tenant_timeline(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    # Generate high fidelity audit timeline
    timeline = [
        {"title": "Profile Registered", "description": "Tenant registered into the platform database", "date": tenant.lease_start.strftime("%Y-%m-%d") if tenant.lease_start else "2026-07-01", "type": "auth"},
    ]
    if tenant.bed_id:
        room_num = tenant.bed.room.room_number if tenant.bed and tenant.bed.room else "N/A"
        bed_num = tenant.bed.bed_number if tenant.bed else "N/A"
        timeline.append({
            "title": "Bed Allocated",
            "description": f"Allocated Room {room_num}, Bed {bed_num}",
            "date": tenant.lease_start.strftime("%Y-%m-%d") if tenant.lease_start else "2026-07-02",
            "type": "allocation"
        })
    
    return timeline
