from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# If sqlite, use check_same_thread configuration
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_tenant_columns():
    inspector = inspect(engine)
    if "tenants" not in inspector.get_table_names():
        return

    existing_columns = {col["name"] for col in inspector.get_columns("tenants")}
    with engine.begin() as conn:
        if "room_number" not in existing_columns:
            conn.execute(text("ALTER TABLE tenants ADD COLUMN room_number VARCHAR"))
        if "bed_number" not in existing_columns:
            conn.execute(text("ALTER TABLE tenants ADD COLUMN bed_number VARCHAR"))
        if "fee" not in existing_columns:
            conn.execute(text("ALTER TABLE tenants ADD COLUMN fee FLOAT"))


# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
