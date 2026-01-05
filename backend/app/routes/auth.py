from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from app.models.database import SessionLocal
from app.models.user import User
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.deps import get_db

load_dotenv()

# ---------------- SECURITY ---------------- #

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()



# ---------------- PASSWORD ---------------- #

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


# ---------------- JWT ---------------- #

def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    print("ACCESS_TOKEN_EXPIRE_MINUTES =", ACCESS_TOKEN_EXPIRE_MINUTES)
    
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ---------------- CURRENT USER ---------------- #

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    try:
        token = credentials.credentials
        print(f"Received token: '{token[:50] if len(token) > 50 else token}'...")
        print(f"Token length: {len(token)}")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        subject = payload.get("sub")
        if not subject:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.email == subject).first()
        
        if not user:
            try:
                user_id = int(subject)
                user = db.query(User).filter(User.id == user_id).first()
            except ValueError:
                pass
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError as e:
        print(f"JWT Error: {e}")  # Debug logging
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        print(f"Auth Error: {e}")  # Debug logging
        raise HTTPException(status_code=401, detail="Authentication failed")
