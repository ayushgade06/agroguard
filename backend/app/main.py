from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.models.database import Base, engine
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.routes.auth import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.core.security import get_current_user
from app.deps import get_db

# ---------------- IMPORT ROUTERS ---------------- #
from app.routes.detection import router as detection_router
from app.routes.notifications import router as notification_router
from app.routes.history import router as history_router
from app.routes.risk_map import router as risk_map_router
from app.api.chatbot import router as chatbot_router
from app.routes.corn import router as corn_router

# 🔥 NEW AR ROUTER
from app.routes.ar import router as ar_router

# ---------------- DB INIT ---------------- #
Base.metadata.create_all(bind=engine)

# ---------------- APP INIT ---------------- #
app = FastAPI(title="AgroGuard API")

# ---------------- MIDDLEWARE ---------------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- AUTH ROUTES ---------------- #

@app.post("/signup", response_model=UserResponse)
def signup(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        latitude=user.latitude,
        longitude=user.longitude,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# 🔥 LOGIN (OAuth2 password flow – REQUIRED FOR SWAGGER)
@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not db_user or not verify_password(
        form_data.password,
        db_user.hashed_password,
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
    }

# ---------------- PROTECTED ROUTES ---------------- #

@app.get("/protected")
def protected_route(
    current_user: User = Depends(get_current_user),
):
    return {
        "message": "Access granted",
        "user_id": current_user.id,
        "email": current_user.email,
    }


@app.get("/me")
def me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "latitude": current_user.latitude,
        "longitude": current_user.longitude,
    }

# ---------------- FEATURE ROUTES ---------------- #

app.include_router(detection_router)
app.include_router(notification_router)
app.include_router(history_router)
app.include_router(risk_map_router)
app.include_router(chatbot_router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(corn_router)

# 🔥 REGISTER AR ROUTE
app.include_router(ar_router)