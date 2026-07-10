from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import sys
import os

# Append current path to import app correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.session import SessionLocal, Base, engine
from app.models.models import User, Property, Room, Bed, Tenant, Invoice, MaintenanceRequest, Visitor, Attendance, Notice, Expense, Agreement
from app.auth.security import get_password_hash

def seed_db():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if users already exist
        admin = db.query(User).filter(User.email == "admin@staysphere.com").first()
        if admin:
            print("Database already seeded.")
            return

        print("Seeding users...")
        pwd_hash = get_password_hash("password123")
        
        super_admin = User(
            email="admin@staysphere.com",
            password_hash=pwd_hash,
            full_name="Alex Mercer (Admin)",
            role="super_admin",
            phone="+919876543210",
            status="active"
        )
        owner = User(
            email="owner@staysphere.com",
            password_hash=pwd_hash,
            full_name="Sophia Sterling (Owner)",
            role="owner",
            phone="+919876543211",
            status="active"
        )
        staff = User(
            email="staff@staysphere.com",
            password_hash=pwd_hash,
            full_name="Marcus Vance (Staff)",
            role="staff",
            phone="+919876543212",
            status="active"
        )
        tenant_user = User(
            email="tenant@staysphere.com",
            password_hash=pwd_hash,
            full_name="Elena Rostova (Tenant)",
            role="tenant",
            phone="+919876543213",
            status="active"
        )
        
        db.add_all([super_admin, owner, staff, tenant_user])
        db.commit()
        
        # Refresh to get IDs
        db.refresh(owner)
        db.refresh(tenant_user)
        db.refresh(staff)

        print("Seeding properties...")
        prop = Property(
            name="Olive Tree Premium PG",
            address="42 Greenview Sector, Bangalore",
            type="pg",
            owner_id=owner.id,
            amenities="High-Speed Wi-Fi, Gym, Laundry, 3 Meals Food, Biometric Entry",
            images="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
        )
        db.add(prop)
        db.commit()
        db.refresh(prop)

        print("Seeding rooms & beds...")
        room1 = Room(
            property_id=prop.id,
            room_number="101",
            floor=1,
            room_type="double",
            price_per_bed=7500.0,
            capacity=2
        )
        room2 = Room(
            property_id=prop.id,
            room_number="102",
            floor=1,
            room_type="single",
            price_per_bed=12000.0,
            capacity=1
        )
        db.add_all([room1, room2])
        db.commit()
        db.refresh(room1)
        db.refresh(room2)

        # Add beds
        bed1a = Bed(room_id=room1.id, bed_number="101-A", status="occupied")
        bed1b = Bed(room_id=room1.id, bed_number="101-B", status="vacant")
        bed2a = Bed(room_id=room2.id, bed_number="102-A", status="vacant")
        db.add_all([bed1a, bed1b, bed2a])
        db.commit()
        db.refresh(bed1a)

        print("Seeding tenant profile...")
        tenant = Tenant(
            user_id=tenant_user.id,
            bed_id=bed1a.id,
            emergency_contact="+919988776655",
            guardian_name="Viktor Rostov",
            guardian_phone="+919988776650",
            status="active",
            lease_start=datetime.utcnow() - timedelta(days=60),
            lease_end=datetime.utcnow() + timedelta(days=300),
            kyc_document_url="https://res.cloudinary.com/mock_cloud/image/upload/kyc_document.pdf"
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)

        print("Seeding invoices...")
        # One paid invoice, one pending
        invoice_paid = Invoice(
            tenant_id=tenant.id,
            amount=7500.0,
            due_date=datetime.utcnow() - timedelta(days=30),
            paid_at=datetime.utcnow() - timedelta(days=28),
            status="paid",
            razorpay_order_id="order_mock_111",
            razorpay_payment_id="pay_mock_111"
        )
        invoice_pending = Invoice(
            tenant_id=tenant.id,
            amount=7500.0,
            due_date=datetime.utcnow() + timedelta(days=5),
            status="pending"
        )
        db.add_all([invoice_paid, invoice_pending])

        print("Seeding agreements...")
        agreement = Agreement(
            tenant_id=tenant.id,
            content="This lease agreement is entered between Sophia Sterling (Owner) and Elena Rostova (Tenant) for Bed 101-A...",
            status="active",
            agreement_pdf_url="https://res.cloudinary.com/mock_cloud/image/upload/lease_agreement.pdf",
            signature_img_url="https://res.cloudinary.com/mock_cloud/image/upload/signature.png",
            signed_at=datetime.utcnow() - timedelta(days=60)
        )
        db.add(agreement)

        print("Seeding maintenance complaints...")
        complaint = MaintenanceRequest(
            tenant_id=tenant.id,
            property_id=prop.id,
            title="Geyser is not heating water",
            description="The geyser in the 1st floor bathroom stops heating water within 2 minutes of turning it on.",
            priority="medium",
            status="pending"
        )
        db.add(complaint)

        print("Seeding notice board...")
        notice1 = Notice(
            title="Independence Day Celebration",
            content="Join us for flag hoisting and high tea in the common lawn at 9:00 AM on August 15th.",
            type="event",
            is_pinned=True
        )
        notice2 = Notice(
            title="Water Supply Disruption Notice",
            content="Water supply will be offline from 2 PM to 5 PM today for maintenance of overhead tanks.",
            type="emergency",
            is_pinned=False
        )
        db.add_all([notice1, notice2])

        print("Seeding expenses...")
        expense1 = Expense(
            property_id=prop.id,
            category="maintenance",
            amount=4500.0,
            description="Plumbing repair & tank cleanup",
            date=datetime.utcnow() - timedelta(days=15)
        )
        expense2 = Expense(
            property_id=prop.id,
            category="electricity",
            amount=13500.0,
            description="June Month Electric Bill",
            date=datetime.utcnow() - timedelta(days=10)
        )
        db.add_all([expense1, expense2])

        print("Seeding visitors...")
        visitor = Visitor(
            property_id=prop.id,
            name="Rohan Sharma",
            phone="+919898989898",
            purpose="Courier delivery for Room 101",
            entry_time=datetime.utcnow() - timedelta(hours=3),
            exit_time=datetime.utcnow() - timedelta(hours=2.5),
            status="checked_out"
        )
        db.add(visitor)

        print("Seeding attendances...")
        attendance = Attendance(
            user_id=staff.id,
            check_in=datetime.utcnow() - timedelta(hours=8),
            check_out=datetime.utcnow() - timedelta(hours=1),
            status="present"
        )
        db.add(attendance)

        db.commit()
        print("Database successfully seeded with realistic demo data!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
