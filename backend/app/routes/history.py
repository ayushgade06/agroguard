from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.deps import get_db
from app.models.detection import Detection
from app.models.user import User
from app.routes.auth import get_current_user
from app.routes.detection import compute_severity

router = APIRouter(prefix="/detections", tags=["Detection History"])


@router.get("/")
def get_detections(
    severity: str | None = Query(
        None,
        description="Filter by severity (High, Medium, Low)",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    # Build response with computed severity (not stored in DB)
    response = []
    for det in detections:
        sev = compute_severity(det.confidence or 0.0)
        if severity and sev.lower() != severity.lower():
            continue
        response.append(
            {
                "id": det.id,
                "disease": det.disease,
                "confidence": det.confidence,
                "latitude": det.latitude,
                "longitude": det.longitude,
                "created_at": det.created_at,
                "severity": sev,
            }
        )

    return response
