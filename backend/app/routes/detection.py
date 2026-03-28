from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from PIL import Image

from app.deps import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.detection import Detection
from app.models.notification import Notification
from app.utils.distance import haversine

from app.ml.image_classifier.predictor import predict_image
from app.ml.potato_disease.predictor import predict as predict_potato
from app.ml.corn_disease.predictor import predict_corn_disease
from app.ml.wheat_disease.predictor import predict_wheat
from app.ml.weather_risk.predictor import predict_risk_by_coords
from app.utils.history_logger import compute_severity
from app.utils.constants import DEFAULT_API_KEY

router = APIRouter(prefix="/detections", tags=["Detections"])

RADIUS_KM = 15


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
    4. Notifies nearby users
    """

    # ---------- VALIDATION ----------
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid image format")

    try:
        image = Image.open(file.file).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # ---------- ML INFERENCE ----------
    crop_normalized = (crop or "rice").strip().lower()

    if crop_normalized == "potato":
        result = predict_potato(image)
        disease = result.get("disease", "Unknown")
        confidence = float(result.get("confidence", 0.0))
    elif crop_normalized == "corn":
        result = predict_corn_disease(image)
        disease = result.get("display_name", "Unknown")
        confidence = float(result.get("confidence", 0.0))
    elif crop_normalized == "wheat":
        result = predict_wheat(image)
        disease = result.get("disease", "Unknown")
        confidence = float(result.get("confidence", 0.0))
    else:
        # Default to rice (general classifier)
        result = predict_image(image)
        disease = result.get("class", "Unknown")
        confidence = float(result.get("confidence", 0.0))

    confidence = max(0.0, min(confidence, 1.0))
    severity = compute_severity(confidence)

    # ---------- STORE DETECTION ----------
    detection = Detection(
        user_id=current_user.id,
        crop=crop,
        disease=disease,
        confidence=confidence,
        severity=severity,  # ✅ FIXED LINE
        latitude=latitude,
        longitude=longitude,
    )
    db.add(detection)

    # ---------- UPDATE USER LOCATION ----------
    current_user.latitude = latitude
    current_user.longitude = longitude

    db.commit()
    db.refresh(detection)

    # ---------- NOTIFY NEARBY USERS ----------
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
            notification = Notification(
                user_id=user.id,
                title="⚠️ Disease/Pest Alert Nearby",
                message=f"{disease} detected near your location",
                data={
                    "disease": disease,
                    "crop": crop_normalized,
                    "distance_km": round(distance, 2),
                    "farmer": current_user.name or "A nearby farmer",
                },
            )
            db.add(notification)

    db.commit()

    # ---------- ENVIRONMENTAL ANALYSIS (HYBRID) ----------
    environmental_risk = None
    location_info = None
    try:
        weather_res = predict_risk_by_coords(latitude, longitude, api_key=DEFAULT_API_KEY, current_only=True, crop=crop_normalized)
        environmental_risk = weather_res.get("summary")
        location_info = {
            "nearest_city": weather_res.get("nearest_station"),
            "distance_km": weather_res.get("distance_km")
        }
    except Exception as e:
        print(f"Environmental risk fetch failed: {e}")

    # ---------- RESPONSE ----------
    is_healthy = "healthy" in (disease or "").lower()
    
    if is_healthy:
        explanation = f"Your {crop_normalized} crop appears healthy with {confidence:.2%} confidence. Continue regular monitoring."
        actions = [
            "Continue regular field monitoring",
            "Maintain optimal irrigation schedule",
            "Document field conditions for tracking",
        ]
    else:
        explanation = f"The model detected {disease} in your {crop_normalized} crop with {confidence:.2%} confidence."
        actions = [
            "Isolate affected crops to prevent spread",
            "Avoid overhead irrigation on infected areas",
            "Apply recommended fungicide or treatment",
            "Consult a local agriculture officer or extension service",
        ]

    return {
        "disease": disease,
        "confidence": confidence,
        "severity": severity,
        "crop": crop_normalized,
        "explanation": explanation,
        "immediateActions": actions,
        "environmental_risk": environmental_risk,
        "location_info": location_info
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
