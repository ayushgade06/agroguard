from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from .models import User
from .schemas import UserCreate, UserLogin
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AgroGuard API")

# ---------------- DB DEP ---------------- #

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- AUTH ROUTES ---------------- #

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

# ---------------- PROTECTED ROUTE ---------------- #

@app.get("/protected")
def protected_route(current_user: str = Depends(get_current_user)):
    return {
        "message": "Access granted",
        "user": current_user
    }
