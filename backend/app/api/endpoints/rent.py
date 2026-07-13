from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import hmac
import hashlib

from app.database.session import get_db
from app.models.models import Invoice, Tenant, Bed, User
from app.schemas.schemas import InvoiceOut, InvoiceCreate
from app.auth.deps import get_current_user, RoleChecker
from app.core.config import settings

router = APIRouter()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_mock_keys() -> bool:
    return (
        settings.RAZORPAY_KEY_ID.startswith("rzp_test_mock")
        or settings.RAZORPAY_KEY_SECRET.startswith("rzp_test_mock")
    )


def _create_razorpay_order(invoice_id: int, amount_inr: float) -> dict:
    if _is_mock_keys():
        sim_order_id = f"order_sim_{invoice_id}_{int(datetime.utcnow().timestamp())}"
        print(f"[rent.pay] SIMULATION MODE - generated order: {sim_order_id}")
        return {"id": sim_order_id, "amount": int(amount_inr * 100), "currency": "INR", "simulation": True}
    try:
        import razorpay
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        order = client.order.create({
            "amount": int(amount_inr * 100),
            "currency": "INR",
            "receipt": f"invoice_{invoice_id}",
            "payment_capture": 1,
        })
        print(f"[rent.pay] Created Razorpay order {order['id']} for invoice {invoice_id}")
        return order
    except Exception as exc:
        print(f"[rent.pay] Razorpay order creation failed: {exc}")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to create payment order: {str(exc)}")


def _verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    if _is_mock_keys():
        print(f"[rent.verify] SIMULATION MODE - skipping signature check for order {order_id}")
        return True
    try:
        import razorpay
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })
        return True
    except Exception as exc:
        try:
            message = f"{order_id}|{payment_id}"
            generated = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), message.encode(), hashlib.sha256).hexdigest()
            return hmac.compare_digest(generated, signature)
        except Exception:
            print(f"[rent.verify] Signature verification error: {exc}")
            return False


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/invoices", response_model=List[InvoiceOut])
def get_invoices(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice)
    if current_user.role == "tenant":
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
    db_invoice = Invoice(tenant_id=invoice_in.tenant_id, amount=invoice_in.amount, due_date=invoice_in.due_date, status="pending")
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice


@router.post("/invoices/generate-monthly")
def generate_monthly_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["owner", "staff", "super_admin"]))
):
    active_tenants = db.query(Tenant).filter(Tenant.status == "active", Tenant.bed_id != None).all()
    count = 0
    for tenant in active_tenants:
        existing = db.query(Invoice).filter(Invoice.tenant_id == tenant.id, Invoice.status == "pending").first()
        if not existing:
            bed_price = tenant.bed.room.price_per_bed if tenant.bed and tenant.bed.room else 5000.0
            db_invoice = Invoice(tenant_id=tenant.id, amount=bed_price, due_date=datetime.utcnow() + timedelta(days=5), status="pending")
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
    if invoice.status == "paid":
        raise HTTPException(status_code=400, detail="Invoice is already paid")

    total_amount = invoice.amount + (invoice.late_fee or 0.0)
    order = _create_razorpay_order(invoice_id, total_amount)

    invoice.razorpay_order_id = order["id"]
    db.commit()
    db.refresh(invoice)

    tenant_name = invoice.tenant.user.full_name if invoice.tenant and invoice.tenant.user else "Resident"
    tenant_email = invoice.tenant.user.email if invoice.tenant and invoice.tenant.user else ""

    return {
        "order_id": order["id"],
        "amount": total_amount,
        "amount_paise": int(total_amount * 100),
        "key_id": settings.RAZORPAY_KEY_ID,
        "currency": "INR",
        "description": f"StaySphere Rent Payment - Invoice #{invoice_id}",
        "tenant_name": tenant_name,
        "tenant_email": tenant_email,
        "simulation": order.get("simulation", False),
    }


@router.post("/invoices/{invoice_id}/verify")
def verify_payment(
    invoice_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if invoice.status == "paid":
        raise HTTPException(status_code=400, detail="Invoice is already paid")

    razorpay_order_id = payload.get("razorpay_order_id", "")
    razorpay_payment_id = payload.get("razorpay_payment_id", "")
    razorpay_signature = payload.get("razorpay_signature", "")

    if not _is_mock_keys() and invoice.razorpay_order_id != razorpay_order_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order ID mismatch - payment verification failed")

    if not _verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment signature - payment verification failed")

    invoice.status = "paid"
    invoice.paid_at = datetime.utcnow()
    invoice.razorpay_payment_id = razorpay_payment_id
    db.commit()
    db.refresh(invoice)

    print(f"[rent.verify] Invoice #{invoice_id} marked PAID. Payment ID: {razorpay_payment_id}")

    return {
        "status": "success",
        "message": "Payment verified and invoice marked as paid.",
        "invoice_id": invoice.id,
        "payment_id": razorpay_payment_id,
        "paid_at": invoice.paid_at.isoformat(),
    }


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

    return {
        "receipt_no": f"REC-{invoice.id:06d}",
        "tenant_name": tenant_name,
        "room_number": room_number,
        "amount": invoice.amount,
        "late_fee": invoice.late_fee,
        "total": invoice.amount + invoice.late_fee,
        "paid_at": invoice.paid_at.strftime("%Y-%m-%d %H:%M:%S") if invoice.paid_at else "N/A",
        "payment_id": invoice.razorpay_payment_id,
    }
