from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from PIL import Image

from app.deps import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.detection import Detection
from app.models.notification import Notification
from app.utils.distance import haversine
from app.ml.inference import predict

router = APIRouter(prefix="/detections", tags=["Detections"])


@router.post("/")
async def detect_disease(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    1. Receives image + location
    2. Runs ML model
    3. Stores detection
    4. Notifies users within 5km
    """

    # ---------------- VALIDATION ----------------
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid image format")

    # ---------------- LOAD IMAGE ----------------
    try:
        image = Image.open(file.file).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # ---------------- ML INFERENCE ----------------
    result = predict(image)
    # expected: { "class": str, "confidence": float }

    disease = result.get("class", "Unknown")
    confidence = float(result.get("confidence", 0.0))

    # ---------------- STORE DETECTION ----------------
    detection = Detection(
        user_id=current_user.id,
        disease=disease,
        confidence=confidence,
        latitude=latitude,
        longitude=longitude,
    )

    db.add(detection)

    # ---------------- UPDATE USER LOCATION ----------------
    current_user.latitude = latitude
    current_user.longitude = longitude

    db.commit()
    db.refresh(detection)

    # ---------------- RADIUS ALERT (5 KM) ----------------
    users = (
        db.query(User)
        .filter(
            User.id != current_user.id,
            User.latitude.isnot(None),
            User.longitude.isnot(None),
        )
        .all()
    )

    for user in users:
        distance = haversine(
            latitude,
            longitude,
            user.latitude,
            user.longitude,
        )

        if distance <= 5:
            notification = Notification(
                user_id=user.id,
                message=f"{disease} detected within 5km of your area",
            )
            db.add(notification)

    db.commit()

    # ---------------- RESPONSE (FRONTEND SAFE) ----------------
    return {
        "disease": disease,
        "confidence": confidence,
        "severity": "High" if confidence > 0.8 else "Medium",
        "explanation": f"The model detected {disease} with high confidence.",
        "immediateActions": [
            "Isolate affected crops",
            "Avoid overhead irrigation",
            "Consult local agriculture officer",
        ],
    }

@router.delete("/{detection_id}")
def delete_detection(detection_id: int, db: Session = Depends(get_db)):
    detection = db.query(Detection).filter(Detection.id == detection_id).first()

    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")

    db.delete(detection)
    db.commit()

    return {"message": "Detection deleted successfully"}