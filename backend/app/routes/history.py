from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.deps import get_db
from app.models.detection import Detection
from app.models.user import User
from app.routes.auth import get_current_user

router = APIRouter(prefix="/detections", tags=["Detection History"])


@router.get("/")
def get_detections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all detections for the current user, ordered by most recent first.
    """
    detections = (
        db.query(Detection)
        .filter(Detection.user_id == current_user.id)
        .order_by(Detection.created_at.desc())
        .all()
    )
    
    return detections
