from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.session import get_db
from app.models.models import Visitor, User, Property
from app.schemas.schemas import VisitorOut, VisitorCreate
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/", response_model=List[VisitorOut])
def get_visitors(
    property_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Visitor)
    if property_id:
        query = query.filter(Visitor.property_id == property_id)
    return query.all()

@router.post("/", response_model=VisitorOut, status_code=status.HTTP_201_CREATED)
def create_visitor(
    visitor_in: VisitorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    prop = db.query(Property).filter(Property.id == visitor_in.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    db_visitor = Visitor(
        property_id=visitor_in.property_id,
        name=visitor_in.name,
        phone=visitor_in.phone,
        purpose=visitor_in.purpose,
        entry_time=datetime.utcnow(),
        status="approved"
    )
    db.add(db_visitor)
    db.commit()
    db.refresh(db_visitor)
    return db_visitor

@router.put("/{visitor_id}/checkout", response_model=VisitorOut)
def checkout_visitor(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    visitor = db.query(Visitor).filter(Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor pass not found")
        
    visitor.exit_time = datetime.utcnow()
    visitor.status = "checked_out"
    db.commit()
    db.refresh(visitor)
    return visitor
