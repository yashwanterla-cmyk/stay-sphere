from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.database.session import get_db
from app.models.models import Attendance, User
from app.schemas.schemas import AttendanceOut, AttendanceCreate
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/", response_model=List[AttendanceOut])
def get_attendance_logs(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Attendance)
    
    # Tenants and staff can only see their own attendance unless owner/super admin
    if current_user.role in ["tenant", "staff"]:
        query = query.filter(Attendance.user_id == current_user.id)
    elif user_id:
        query = query.filter(Attendance.user_id == user_id)
        
    return query.all()

@router.post("/check-in", response_model=AttendanceOut)
def check_in(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if already checked in today
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    
    existing = db.query(Attendance).filter(
        Attendance.user_id == current_user.id,
        Attendance.check_in >= today_start,
        Attendance.check_in <= today_end
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in for today")
        
    # Standard check-in hour is 9 AM. If check-in is after 10 AM, mark as late.
    status_str = "present"
    now = datetime.utcnow()
    # Add offset or simulate check-in rules
    if now.hour >= 10:
        status_str = "late"
        
    db_attendance = Attendance(
        user_id=current_user.id,
        check_in=now,
        status=status_str
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.post("/check-out", response_model=AttendanceOut)
def check_out(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    
    attendance = db.query(Attendance).filter(
        Attendance.user_id == current_user.id,
        Attendance.check_in >= today_start,
        Attendance.check_in <= today_end,
        Attendance.check_out == None
    ).first()
    
    if not attendance:
        raise HTTPException(status_code=404, detail="No active check-in session found for today")
        
    attendance.check_out = datetime.utcnow()
    db.commit()
    db.refresh(attendance)
    return attendance
