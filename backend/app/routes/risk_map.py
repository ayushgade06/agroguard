from fastapi import APIRouter, Query, File, UploadFile, Form, Depends
from typing import Optional
import os
import shutil
from app.ml.weather_risk.predictor import (
    predict_risk_for_city, 
    predict_risk_by_coords, 
    CITY_COORDS, 
    CITIES_CONFIG
)
from app.ml.potato_disease.predictor import predict as predict_potato
from app.ml.image_classifier.predictor import predict_image
from app.ml.corn_disease.predictor import predict_corn_disease
from app.ml.wheat_disease.predictor import predict_wheat
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.orm import Session
from app.deps import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.detection import Detection
from app.utils.history_logger import compute_severity, save_prediction
from app.utils.constants import DEFAULT_API_KEY

router = APIRouter(prefix="/risk-map", tags=["Risk Map"])

@router.get("")
def get_risk_map(
    crop: str = Query("potato"),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
):
    """
    Returns risk data for a map.
    If lat/lon are provided, it includes a specific 'user_point' with hybrid details.
    By default, returns the 15-city Maharashtra risk map for the requested crop.
    """
    results = []
    
    # Generate the 15-city statewide map using parallel requests
    def fetch_city_risk(display_name, search_name):
        try:
            # Overriding to potato for Risk Map specifically
            risk = predict_city_risk(f"{search_name},IN", api_key=DEFAULT_API_KEY, crop="potato")
            risk["city"] = display_name
            return risk
        except Exception as e:
            print(f"Error fetching risk for {display_name}: {e}")
            return None

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(fetch_city_risk, dn, sn) for dn, sn in CITIES_CONFIG.items()]
        for future in futures:
            risk = future.result()
            if risk:
                results.append(risk)

    user_point = None
    if lat is not None and lon is not None:
        try:
            # Overriding to potato for Risk Map specifically
            user_point = predict_risk_by_coords(lat, lon, api_key=DEFAULT_API_KEY, crop="potato")
            user_point["type"] = "user_farm"
        except Exception as e:
            print(f"Error fetching user location risk: {e}")

    return {
        "crop": crop,
        "points": results,
        "user_point": user_point
    }

@router.post("/hybrid-diagnosis")
async def get_hybrid_diagnosis(
    lat: float = Form(...),
    lon: float = Form(...),
    crop: str = Form("potato"),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Combines environmental risk (weather) with visual diagnosis (image) 
    for a localized Hybrid Potato risk assessment.
    Uses 'current_only=True' for live weather-based risk.
    """
    # 1. Environmental Analysis (LIVE)
    weather_risk = predict_risk_by_coords(lat, lon, api_key=DEFAULT_API_KEY, current_only=True, crop=crop)
    
    visual_diagnosis = None
    # 2. Visual Diagnosis (if image provided)
    if image:
        # Save temp file
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, image.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        try:
            # Run vision model based on crop
            with Image.open(file_path).convert("RGB") as img:
                crop_normalized = crop.strip().lower()
                
                if crop_normalized == "potato":
                    res = predict_potato(img)
                    disease = res.get("disease", "Unknown")
                    confidence = float(res.get("confidence", 0.0))
                elif crop_normalized == "corn":
                    res = predict_corn_disease(img)
                    disease = res.get("display_name", "Unknown")
                    confidence = float(res.get("confidence", 0.0))
                elif crop_normalized == "wheat":
                    res = predict_wheat(img)
                    disease = res.get("disease", "Unknown")
                    confidence = float(res.get("confidence", 0.0))
                else: # Default to rice / general classifier
                    res = predict_image(img)
                    disease = res.get("class", "Unknown")
                    confidence = float(res.get("confidence", 0.0))
                    
            visual_diagnosis = {
                "disease": disease,
                "confidence": confidence,
            }
        finally:
            # Clean up
            if os.path.exists(file_path):
                os.remove(file_path)

        # Log to User History (if image provided)
        if visual_diagnosis:
            severity = compute_severity(visual_diagnosis["confidence"])
            detection = Detection(
                user_id=current_user.id,
                crop=crop, 
                disease=visual_diagnosis["disease"],
                confidence=visual_diagnosis["confidence"],
                severity=severity,
                latitude=lat,
                longitude=lon,
            )
            db.add(detection)
            db.commit()
            db.refresh(detection)

    # 3. Hybrid Logic
    # Returns a consolidated report of both data sources.
    
    hybrid_report = {
        "location": {
            "lat": lat,
            "lon": lon,
            "nearest_city": weather_risk.get("nearest_station"),
            "distance_km": weather_risk.get("distance_km")
        },
        "environmental_risk": weather_risk.get("summary"),
        "visual_diagnosis": visual_diagnosis
    }
    
    return hybrid_report
