from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.models import Room, Bed, Property, User
from app.schemas.schemas import RoomCreate, RoomOut, BedCreate, BedOut
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/property/{property_id}", response_model=List[RoomOut])
def get_rooms_by_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Room).filter(Room.property_id == property_id).all()

@router.post("/property/{property_id}", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
def create_room(
    property_id: int,
    room_in: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    # Verify property exists
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    db_room = Room(
        property_id=property_id,
        room_number=room_in.room_number,
        floor=room_in.floor,
        room_type=room_in.room_type,
        price_per_bed=room_in.price_per_bed,
        capacity=room_in.capacity
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)

    # Automatically generate beds for this room based on capacity
    for i in range(1, db_room.capacity + 1):
        db_bed = Bed(
            room_id=db_room.id,
            bed_number=f"{db_room.room_number}-{chr(64 + i)}",  # e.g., 101-A, 101-B
            status="vacant"
        )
        db.add(db_bed)
    db.commit()

    return db_room

@router.put("/{room_id}", response_model=RoomOut)
def update_room(
    room_id: int,
    room_in: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    db_room.room_number = room_in.room_number
    db_room.floor = room_in.floor
    db_room.room_type = room_in.room_type
    db_room.price_per_bed = room_in.price_per_bed
    db_room.capacity = room_in.capacity

    db.commit()
    db.refresh(db_room)
    return db_room

@router.delete("/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "super_admin"]))
):
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    db.delete(db_room)
    db.commit()
    return {"message": "Room and its associated beds deleted successfully"}

@router.get("/{room_id}/beds", response_model=List[BedOut])
def get_room_beds(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Bed).filter(Bed.room_id == room_id).all()

@router.get("/beds/available", response_model=List[BedOut])
def get_available_beds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Bed).filter(Bed.status == "vacant").all()

@router.put("/beds/{bed_id}/status", response_model=BedOut)
def update_bed_status(
    bed_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    db_bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if not db_bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    if status not in ["vacant", "occupied", "maintenance"]:
        raise HTTPException(status_code=400, detail="Invalid bed status")
    
    db_bed.status = status
    db.commit()
    db.refresh(db_bed)
    return db_bed
