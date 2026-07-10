from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.models import MaintenanceRequest, Tenant, User, Property
from app.schemas.schemas import MaintenanceRequestOut, MaintenanceRequestCreate, MaintenanceRequestUpdate
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/", response_model=List[MaintenanceRequestOut])
def get_maintenance_requests(
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MaintenanceRequest)
    
    if current_user.role == "tenant":
        tenant = db.query(Tenant).filter(Tenant.user_id == current_user.id).first()
        if not tenant:
            return []
        query = query.filter(MaintenanceRequest.tenant_id == tenant.id)
    elif current_user.role == "staff":
        query = query.filter((MaintenanceRequest.assigned_staff_id == current_user.id) | (MaintenanceRequest.assigned_staff_id == None))
    
    if status_filter:
        query = query.filter(MaintenanceRequest.status == status_filter)
    if priority_filter:
        query = query.filter(MaintenanceRequest.priority == priority_filter)
        
    return query.all()

@router.post("/", response_model=MaintenanceRequestOut, status_code=status.HTTP_201_CREATED)
def create_maintenance_request(
    request_in: MaintenanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["tenant"]))
):
    tenant = db.query(Tenant).filter(Tenant.user_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant profile not found")

    db_request = MaintenanceRequest(
        tenant_id=tenant.id,
        property_id=request_in.property_id,
        title=request_in.title,
        description=request_in.description,
        priority=request_in.priority,
        status="pending",
        image_url=request_in.image_url
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.put("/{request_id}", response_model=MaintenanceRequestOut)
def update_maintenance_request(
    request_id: int,
    request_in: MaintenanceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    db_request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Maintenance ticket not found")

    if request_in.status is not None:
        db_request.status = request_in.status
    if request_in.priority is not None:
        db_request.priority = request_in.priority
    if request_in.resolution_notes is not None:
        db_request.resolution_notes = request_in.resolution_notes
    if request_in.assigned_staff_id is not None:
        # Verify staff exists and is staff
        staff = db.query(User).filter(User.id == request_in.assigned_staff_id).first()
        if not staff or staff.role not in ["staff", "owner", "super_admin"]:
            raise HTTPException(status_code=400, detail="Invalid staff ID assigned")
        db_request.assigned_staff_id = request_in.assigned_staff_id

    db.commit()
    db.refresh(db_request)
    return db_request

@router.delete("/{request_id}")
def delete_maintenance_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "super_admin"]))
):
    db_request = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Maintenance ticket not found")
        
    db.delete(db_request)
    db.commit()
    return {"message": "Maintenance ticket deleted successfully"}
