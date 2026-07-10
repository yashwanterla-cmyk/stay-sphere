from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.models import Invoice, Tenant, Bed, User
from app.schemas.schemas import InvoiceOut, InvoiceCreate
from app.auth.deps import get_current_user, RoleChecker
from app.core.config import settings

router = APIRouter()

@router.get("/invoices", response_model=List[InvoiceOut])
def get_invoices(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice)
    
    if current_user.role == "tenant":
        # Tenants can only see their own invoices
        tenant = db.query(Tenant).filter(Tenant.user_id == current_user.id).first()
        if not tenant:
            return []
        query = query.filter(Invoice.tenant_id == tenant.id)
    
    if status_filter:
        query = query.filter(Invoice.status == status_filter)
        
    return query.all()

@router.post("/invoices", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_in: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    tenant = db.query(Tenant).filter(Tenant.id == invoice_in.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    db_invoice = Invoice(
        tenant_id=invoice_in.tenant_id,
        amount=invoice_in.amount,
        due_date=invoice_in.due_date,
        status="pending"
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.post("/invoices/generate-monthly")
def generate_monthly_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    # Find all active tenants with an allocated bed
    active_tenants = db.query(Tenant).filter(Tenant.status == "active", Tenant.bed_id != None).all()
    count = 0
    
    for tenant in active_tenants:
        # Check if they already have an invoice due this month
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year
        
        existing = db.query(Invoice).filter(
            Invoice.tenant_id == tenant.id,
            Invoice.status == "pending"
        ).first()
        
        if not existing:
            # Get the bed price
            bed_price = tenant.bed.room.price_per_bed if tenant.bed and tenant.bed.room else 5000.0
            
            db_invoice = Invoice(
                tenant_id=tenant.id,
                amount=bed_price,
                due_date=datetime.utcnow() + timedelta(days=5),
                status="pending"
            )
            db.add(db_invoice)
            count += 1
            
    db.commit()
    return {"message": f"Successfully generated {count} invoices for active tenants."}

@router.post("/invoices/{invoice_id}/pay")
def pay_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    # Simulate generating Razorpay Order ID
    invoice.razorpay_order_id = f"order_{invoice_id}_{int(datetime.utcnow().timestamp())}"
    db.commit()
    db.refresh(invoice)
    
    return {
        "order_id": invoice.razorpay_order_id,
        "amount": invoice.amount + invoice.late_fee,
        "key_id": settings.RAZORPAY_KEY_ID,
        "currency": "INR",
        "description": f"StaySphere Rent Payment - Invoice #{invoice.id}"
    }

@router.post("/invoices/{invoice_id}/verify")
def verify_payment(
    invoice_id: int,
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    invoice.status = "paid"
    invoice.paid_at = datetime.utcnow()
    invoice.razorpay_payment_id = payment_id
    db.commit()
    db.refresh(invoice)
    
    return {"status": "success", "invoice": invoice}

@router.get("/invoices/{invoice_id}/receipt")
def get_receipt(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status != "paid":
        raise HTTPException(status_code=400, detail="Invoice is not paid yet")
        
    tenant_name = invoice.tenant.user.full_name if invoice.tenant and invoice.tenant.user else "N/A"
    room_number = invoice.tenant.bed.room.room_number if invoice.tenant and invoice.tenant.bed and invoice.tenant.bed.room else "N/A"
    
    # Return details for invoice PDF construction
    return {
        "receipt_no": f"REC-{invoice.id:06d}",
        "tenant_name": tenant_name,
        "room_number": room_number,
        "amount": invoice.amount,
        "late_fee": invoice.late_fee,
        "total": invoice.amount + invoice.late_fee,
        "paid_at": invoice.paid_at.strftime("%Y-%m-%d %H:%M:%S") if invoice.paid_at else "N/A",
        "payment_id": invoice.razorpay_payment_id
    }
