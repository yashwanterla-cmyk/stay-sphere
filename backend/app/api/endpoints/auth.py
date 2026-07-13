from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from datetime import timedelta
from urllib.parse import parse_qs

from app.database.session import get_db
from app.models.models import User, Tenant
from app.schemas.schemas import UserCreate, UserOut, Token, TokenData
from app.auth.security import verify_password, get_password_hash, create_access_token
from app.auth.deps import get_current_user

router = APIRouter()

async def _extract_login_credentials(request: Request) -> dict:
    content_type = request.headers.get("content-type", "")

    if "application/x-www-form-urlencoded" in content_type:
        body = await request.body()
        parsed = parse_qs(body.decode("utf-8"), keep_blank_values=True)
        username = parsed.get("username", [None])[0] or parsed.get("email", [None])[0]
        password = parsed.get("password", [None])[0]
    elif "multipart/form-data" in content_type:
        form = await request.form()
        username = form.get("username") or form.get("email")
        password = form.get("password")
    else:
        try:
            body = await request.json()
        except Exception:
            body = None

        if isinstance(body, dict):
            username = body.get("username") or body.get("email")
            password = body.get("password")
        else:
            username = None
            password = None

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email and password are required",
        )

    return {"username": str(username), "password": str(password)}

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )
    
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        password_hash=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role,
        phone=user_in.phone,
        status="active"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # If the user is a tenant, create a blank tenant profile
    if db_user.role == "tenant":
        db_tenant = Tenant(
            user_id=db_user.id,
            status="active"
        )
        db.add(db_tenant)
        db.commit()
        
    return db_user

@router.post("/login", response_model=Token)
async def login(request: Request, db: Session = Depends(get_db)):
    credentials = await _extract_login_credentials(request)
    user = db.query(User).filter(User.email == credentials["username"]).first()
    if not user or not verify_password(credentials["password"], user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    # Log successful authentication (avoid logging passwords)
    print(f"[auth.login] Successful authentication for user: {user.email} (id={user.id})")
    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email,
        "user_id": user.id
    }

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Simulate sending reset email
    return {"message": "Password reset instructions sent to your email"}

@router.post("/reset-password")
def reset_password(email: str, new_password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = get_password_hash(new_password)
    db.commit()
    return {"message": "Password has been reset successfully"}
