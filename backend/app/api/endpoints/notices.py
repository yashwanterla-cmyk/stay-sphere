from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.models import Notice, User
from app.schemas.schemas import NoticeOut, NoticeCreate
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/", response_model=List[NoticeOut])
def get_notices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Notice).order_by(Notice.is_pinned.desc(), Notice.created_at.desc()).all()

@router.post("/", response_model=NoticeOut, status_code=status.HTTP_201_CREATED)
def create_notice(
    notice_in: NoticeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    db_notice = Notice(
        title=notice_in.title,
        content=notice_in.content,
        type=notice_in.type,
        is_pinned=notice_in.is_pinned
    )
    db.add(db_notice)
    db.commit()
    db.refresh(db_notice)
    return db_notice

@router.put("/{notice_id}", response_model=NoticeOut)
def update_notice(
    notice_id: int,
    notice_in: NoticeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    db_notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not db_notice:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    db_notice.title = notice_in.title
    db_notice.content = notice_in.content
    db_notice.type = notice_in.type
    db_notice.is_pinned = notice_in.is_pinned
    
    db.commit()
    db.refresh(db_notice)
    return db_notice

@router.delete("/{notice_id}")
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    db_notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if not db_notice:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    db.delete(db_notice)
    db.commit()
    return {"message": "Notice deleted successfully"}
