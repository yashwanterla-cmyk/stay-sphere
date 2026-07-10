from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "super_admin", "owner", "staff", "tenant"
    phone = Column(String, nullable=True)
    status = Column(String, default="active")  # "active", "inactive", "pending"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant_profile = relationship("Tenant", back_populates="user", uselist=False, cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    type = Column(String, nullable=False)  # "pg", "hostel"
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amenities = Column(String, nullable=True)  # Comma-separated list or JSON string
    images = Column(String, nullable=True)  # Comma-separated image URLs

    # Relationships
    owner = relationship("User")
    rooms = relationship("Room", back_populates="property", cascade="all, delete-orphan")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="property", cascade="all, delete-orphan")
    visitors = relationship("Visitor", back_populates="property", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="property", cascade="all, delete-orphan")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    room_number = Column(String, nullable=False)
    floor = Column(Integer, nullable=False)
    room_type = Column(String, nullable=False)  # "single", "double", "triple", "quad"
    price_per_bed = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)

    # Relationships
    property = relationship("Property", back_populates="rooms")
    beds = relationship("Bed", back_populates="room", cascade="all, delete-orphan")


class Bed(Base):
    __tablename__ = "beds"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    bed_number = Column(String, nullable=False)
    status = Column(String, default="vacant")  # "vacant", "occupied", "maintenance"

    # Relationships
    room = relationship("Room", back_populates="beds")
    tenant = relationship("Tenant", back_populates="bed", uselist=False)


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bed_id = Column(Integer, ForeignKey("beds.id"), nullable=True)
    kyc_document_url = Column(String, nullable=True)
    status = Column(String, default="active")  # "active", "left", "evict"
    emergency_contact = Column(String, nullable=True)
    guardian_name = Column(String, nullable=True)
    guardian_phone = Column(String, nullable=True)
    lease_start = Column(DateTime, nullable=True)
    lease_end = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="tenant_profile")
    bed = relationship("Bed", back_populates="tenant")
    invoices = relationship("Invoice", back_populates="tenant", cascade="all, delete-orphan")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="tenant", cascade="all, delete-orphan")
    agreements = relationship("Agreement", back_populates="tenant", cascade="all, delete-orphan")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    amount = Column(Float, nullable=False)
    late_fee = Column(Float, default=0.0)
    status = Column(String, default="pending")  # "paid", "pending", "overdue"
    due_date = Column(DateTime, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)

    # Relationships
    tenant = relationship("Tenant", back_populates="invoices")


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="pending")  # "pending", "in_progress", "resolved"
    priority = Column(String, default="medium")  # "low", "medium", "high"
    image_url = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    assigned_staff_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    tenant = relationship("Tenant", back_populates="maintenance_requests")
    property = relationship("Property", back_populates="maintenance_requests")
    assigned_staff = relationship("User", foreign_keys=[assigned_staff_id])


class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    purpose = Column(String, nullable=False)
    entry_time = Column(DateTime, default=datetime.utcnow)
    exit_time = Column(DateTime, nullable=True)
    status = Column(String, default="approved")  # "approved", "checked_out"

    # Relationships
    property = relationship("Property", back_populates="visitors")


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    check_in = Column(DateTime, default=datetime.utcnow)
    check_out = Column(DateTime, nullable=True)
    status = Column(String, default="present")  # "present", "late", "absent"

    # Relationships
    user = relationship("User", back_populates="attendances")


class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # "announcement", "event", "emergency"
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    category = Column(String, nullable=False)  # "maintenance", "salary", "electricity", "water", "other"
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    receipt_url = Column(String, nullable=True)

    # Relationships
    property = relationship("Property", back_populates="expenses")


class Agreement(Base):
    __tablename__ = "agreements"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    status = Column(String, default="pending_signature")  # "pending_signature", "active", "expired"
    content = Column(Text, nullable=False)
    agreement_pdf_url = Column(String, nullable=True)
    signature_img_url = Column(String, nullable=True)
    signed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="agreements")
