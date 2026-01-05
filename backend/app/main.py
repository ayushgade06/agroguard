from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.models.database import Base, engine, SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.routes.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

# import routers
from app.routes.detection import router as detection_router
from app.routes.notifications import router as notification_router
from app.routes.history import router as history_router
from app.deps import get_db

# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AgroGuard API")

# ---------------- MIDDLEWARE ---------------- #

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- AUTH ROUTES ---------------- #

@app.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        latitude=user.latitude,
        longitude=user.longitude
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})
    
    print(f"Login successful for: {db_user.email}")
    print(f"Generated token: {token[:50]}...")  # Show first 50 chars

    return {
        "access_token": token,
        "token_type": "bearer"
    }

# ---------------- PROTECTED ROUTE ---------------- #

@app.get("/protected")
def protected_route(current_user: User = Depends(get_current_user)):
    return {
        "message": "Access granted",
        "user_id": current_user.id,
        "email": current_user.email
    }

# ---------------- FEATURE ROUTES ---------------- #

app.include_router(detection_router)
app.include_router(notification_router)
app.include_router(history_router)
