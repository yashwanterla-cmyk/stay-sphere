from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.session import get_db
from app.models.models import Agreement, Tenant, User
from app.schemas.schemas import AgreementOut, AgreementCreate, AgreementSign
from app.auth.deps import get_current_user, RoleChecker

router = APIRouter()

@router.get("/", response_model=List[AgreementOut])
def get_agreements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Agreement)
    
    if current_user.role == "tenant":
        tenant = db.query(Tenant).filter(Tenant.user_id == current_user.id).first()
        if not tenant:
            return []
        query = query.filter(Agreement.tenant_id == tenant.id)
        
    return query.all()

@router.post("/", response_model=AgreementOut, status_code=status.HTTP_201_CREATED)
def create_agreement(
    agreement_in: AgreementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    tenant = db.query(Tenant).filter(Tenant.id == agreement_in.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    db_agreement = Agreement(
        tenant_id=agreement_in.tenant_id,
        content=agreement_in.content,
        status="pending_signature",
        agreement_pdf_url=agreement_in.agreement_pdf_url
    )
    db.add(db_agreement)
    db.commit()
    db.refresh(db_agreement)
    return db_agreement

@router.put("/{agreement_id}/sign", response_model=AgreementOut)
def sign_agreement(
    agreement_id: int,
    sign_in: AgreementSign,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["tenant"]))
):
    tenant = db.query(Tenant).filter(Tenant.user_id == current_user.id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant profile not found")
        
    agreement = db.query(Agreement).filter(
        Agreement.id == agreement_id,
        Agreement.tenant_id == tenant.id
    ).first()
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found or does not belong to user")
        
    agreement.status = "active"
    agreement.signature_img_url = sign_in.signature_img_url
    agreement.signed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(agreement)
    return agreement
