from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.notification import Notification
from app.models.user import User
from app.routes.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all notifications for the logged-in user
    """
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    enriched = []
    for n in notifications:
        enriched.append(
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at,

                # Structured data from JSON column
                "disease": n.data.get("disease") if n.data else None,
                "crop": n.data.get("crop") if n.data else None,
                "distance_km": n.data.get("distance_km") if n.data else None,
                "farmer": n.data.get("farmer") if n.data else None,
            }
        )

    return enriched


@router.post("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a single notification as read
    """
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()

    return {"success": True}


@router.post("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark all notifications as read for the logged-in user
    """
    (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
        .update({"is_read": True})
    )

    db.commit()

    return {"success": True}
