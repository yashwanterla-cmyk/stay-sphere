from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.models import Property, User
from app.schemas.schemas import PropertyCreate, PropertyOut
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/", response_model=List[PropertyOut])
def get_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "super_admin":
        return db.query(Property).all()
    elif current_user.role == "owner":
        return db.query(Property).filter(Property.owner_id == current_user.id).all()
    else:
        # Staff and Tenants can view properties too
        return db.query(Property).all()

@router.post("/", response_model=PropertyOut, status_code=status.HTTP_201_CREATED)
def create_property(
    property_in: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "super_admin"]))
):
    db_property = Property(
        name=property_in.name,
        address=property_in.address,
        type=property_in.type,
        owner_id=current_user.id,
        amenities=property_in.amenities,
        images=property_in.images
    )
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

@router.get("/{property_id}", response_model=PropertyOut)
def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_obj

@router.put("/{property_id}", response_model=PropertyOut)
def update_property(
    property_id: int,
    property_in: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "super_admin"]))
):
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if current_user.role == "owner" and property_obj.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this property")

    property_obj.name = property_in.name
    property_obj.address = property_in.address
    property_obj.type = property_in.type
    property_obj.amenities = property_in.amenities
    property_obj.images = property_in.images

    db.commit()
    db.refresh(property_obj)
    return property_obj

@router.delete("/{property_id}")
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "super_admin"]))
):
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if current_user.role == "owner" and property_obj.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this property")

    db.delete(property_obj)
    db.commit()
    return {"message": "Property deleted successfully"}
