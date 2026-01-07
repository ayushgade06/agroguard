import json
from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from PIL import Image

from app.deps import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.detection import Detection
from app.models.notification import Notification
from app.utils.distance import haversine

# ✅ REAL ML IMPORT (TensorFlow image classifier)
from app.ml.image_classifier.predictor import predict_image
from app.ml.potato_disease.predictor import predict as predict_potato

router = APIRouter(prefix="/detections", tags=["Detections"])

RADIUS_KM = 15


def compute_severity(confidence: float) -> str:
    if confidence >= 0.8:
        return "High"
    if confidence >= 0.5:
        return "Medium"
    return "Low"


@router.post("/")
async def detect_disease(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    crop: str = Form("rice"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    1. Receives image + location
    2. Runs ML model
    3. Stores detection
    4. Notifies users within 5km radius
    """

    # ---------------- VALIDATION ----------------
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid image format")

    try:
        image = Image.open(file.file).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # ---------------- ML INFERENCE ----------------
    crop_normalized = (crop or "rice").strip().lower()

    if crop_normalized == "potato":
        result = predict_potato(image)
        disease = result.get("disease", "Unknown")
        confidence = float(result.get("confidence", 0.0))
    else:
        result = predict_image(image)
        disease = result.get("class", "Unknown")
        confidence = float(result.get("confidence", 0.0))

    # clamp confidence between 0 and 1 to avoid >100% displays
    confidence = max(0.0, min(confidence, 1.0))
    severity = compute_severity(confidence)

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

    # ---------------- NOTIFY USERS WITHIN 5 KM ----------------
    nearby_users = (
        db.query(User)
        .filter(
            User.id != current_user.id,
            User.latitude.isnot(None),
            User.longitude.isnot(None),
        )
        .all()
    )

    for user in nearby_users:
        distance = haversine(
            latitude,
            longitude,
            user.latitude,
            user.longitude,
        )

        if distance <= RADIUS_KM:
            meta = {
                "disease": disease,
                "crop": "potato" if crop_normalized == "potato" else "rice",
                "distance_km": round(distance, 2),
                "farmer": current_user.name or "A nearby farmer",
            }
            notification = Notification(
                user_id=user.id,
                title="⚠️ Disease/Pest Alert Nearby",
                message=json.dumps(meta),
            )
            db.add(notification)

    db.commit()

    # ---------------- RESPONSE (FRONTEND SAFE) ----------------
    return {
        "disease": disease,
        "confidence": confidence,
        "severity": severity,
        "crop": "potato" if crop_normalized == "potato" else "rice",
        "explanation": f"The model detected {disease} with {confidence:.2%} confidence.",
        "immediateActions": [
            "Isolate affected crops",
            "Avoid overhead irrigation",
            "Consult local agriculture officer",
        ],
    }


@router.delete("/{detection_id}")
def delete_detection(
    detection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    detection = (
        db.query(Detection)
        .filter(
            Detection.id == detection_id,
            Detection.user_id == current_user.id,
        )
        .first()
    )

    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")

    db.delete(detection)
    db.commit()

    return {"message": "Detection deleted successfully"}
