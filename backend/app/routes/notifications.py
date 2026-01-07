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
        details = {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at,
            "disease": None,
            "crop": None,
            "distance_km": None,
            "farmer": None,
        }
        # Try to parse structured meta (JSON string) if present
        try:
            meta = json.loads(n.message)
            if isinstance(meta, dict):
                details["disease"] = meta.get("disease")
                details["crop"] = meta.get("crop")
                details["distance_km"] = meta.get("distance_km")
                details["farmer"] = meta.get("farmer")
                details["message"] = meta.get("message") or n.message
        except Exception:
            pass

        enriched.append(details)

    return enriched


@router.post("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark a notification as read
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
            Notification.is_read == False,
        )
        .update({"is_read": True})
    )

    db.commit()

    return {"success": True}
