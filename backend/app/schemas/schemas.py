from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    full_name: str
    email: str
    user_id: int

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    phone: Optional[str] = None
    status: Optional[str] = "active"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Property Schemas
class PropertyBase(BaseModel):
    name: str
    address: str
    type: str  # "pg", "hostel"
    amenities: Optional[str] = None
    images: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyOut(PropertyBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

# Room Schemas
class RoomBase(BaseModel):
    room_number: str
    floor: int
    room_type: str  # "single", "double", "triple", "quad"
    price_per_bed: float
    capacity: int

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    id: int
    property_id: int

    class Config:
        from_attributes = True

# Bed Schemas
class BedBase(BaseModel):
    bed_number: str
    status: Optional[str] = "vacant"  # "vacant", "occupied", "maintenance"

class BedCreate(BedBase):
    pass

class BedOut(BedBase):
    id: int
    room_id: int

    class Config:
        from_attributes = True

# Tenant Schemas
class TenantBase(BaseModel):
    emergency_contact: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    room_number: Optional[str] = None
    bed_number: Optional[str] = None
    fee: Optional[float] = None
    lease_start: Optional[datetime] = None
    lease_end: Optional[datetime] = None
    status: Optional[str] = "active"

class TenantCreate(TenantBase):
    user_id: int
    bed_id: Optional[int] = None
    kyc_document_url: Optional[str] = None

class TenantRegister(BaseModel):
    email: EmailStr
    full_name: str
    phone: str
    password: str
    bed_id: Optional[int] = None
    emergency_contact: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    room_number: Optional[str] = None
    bed_number: Optional[str] = None
    fee: Optional[float] = None

class TenantUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    room_number: Optional[str] = None
    bed_number: Optional[str] = None
    fee: Optional[float] = None
    status: Optional[str] = None

class TenantOut(TenantBase):
    id: int
    user_id: int
    bed_id: Optional[int] = None
    kyc_document_url: Optional[str] = None
    user: UserOut

    class Config:
        from_attributes = True

# Invoice Schemas
class InvoiceBase(BaseModel):
    amount: float
    late_fee: Optional[float] = 0.0
    status: Optional[str] = "pending"  # "paid", "pending", "overdue"
    due_date: datetime

class InvoiceCreate(InvoiceBase):
    tenant_id: int

class InvoiceOut(InvoiceBase):
    id: int
    tenant_id: int
    paid_at: Optional[datetime] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None

    class Config:
        from_attributes = True

# Maintenance Schemas
class MaintenanceRequestBase(BaseModel):
    title: str
    description: str
    priority: Optional[str] = "medium"  # "low", "medium", "high"
    status: Optional[str] = "pending"  # "pending", "in_progress", "resolved"
    image_url: Optional[str] = None
    resolution_notes: Optional[str] = None

class MaintenanceRequestCreate(MaintenanceRequestBase):
    property_id: int

class MaintenanceRequestUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None
    assigned_staff_id: Optional[int] = None

class MaintenanceRequestOut(MaintenanceRequestBase):
    id: int
    tenant_id: int
    property_id: int
    assigned_staff_id: Optional[int] = None

    class Config:
        from_attributes = True

# Visitor Schemas
class VisitorBase(BaseModel):
    name: str
    phone: str
    purpose: str

class VisitorCreate(VisitorBase):
    property_id: int

class VisitorOut(VisitorBase):
    id: int
    property_id: int
    entry_time: datetime
    exit_time: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceBase(BaseModel):
    status: Optional[str] = "present"

class AttendanceCreate(AttendanceBase):
    user_id: int

class AttendanceOut(AttendanceBase):
    id: int
    user_id: int
    check_in: datetime
    check_out: Optional[datetime] = None

    class Config:
        from_attributes = True

# Notice Schemas
class NoticeBase(BaseModel):
    title: str
    content: str
    type: str  # "announcement", "event", "emergency"
    is_pinned: Optional[bool] = False

class NoticeCreate(NoticeBase):
    pass

class NoticeOut(NoticeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseBase(BaseModel):
    category: str
    amount: float
    description: Optional[str] = None
    receipt_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    property_id: int

class ExpenseOut(ExpenseBase):
    id: int
    property_id: int
    date: datetime

    class Config:
        from_attributes = True

# Agreement Schemas
class AgreementBase(BaseModel):
    content: str
    status: Optional[str] = "pending_signature"

class AgreementCreate(AgreementBase):
    tenant_id: int
    agreement_pdf_url: Optional[str] = None

class AgreementSign(BaseModel):
    signature_img_url: str

class AgreementOut(AgreementBase):
    id: int
    tenant_id: int
    agreement_pdf_url: Optional[str] = None
    signature_img_url: Optional[str] = None
    signed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
