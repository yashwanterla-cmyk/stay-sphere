import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "StaySphere"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "staysphere_super_secret_jwt_key_2026_olive_green_theme")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database URL: fallback to SQLite if PostgreSQL URL isn't configured
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./staysphere.db")

    # Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "mock_cloud")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "mock_key")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "mock_secret")

    # Razorpay configuration
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_mock_id")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "rzp_test_mock_secret")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

