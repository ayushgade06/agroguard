from fastapi import APIRouter, Query, File, UploadFile, Form
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
from PIL import Image

router = APIRouter(prefix="/risk-map", tags=["Risk Map"])

# Standardize this or move to .env
DEFAULT_API_KEY = "fd3e4a7873ba30c646f32933bbc03e89"

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
    
    # Generate the 15-city statewide map (as seen in HybridPotato.ipynb)
    for display_name, search_name in CITIES_CONFIG.items():
        try:
            # We add ",IN" to be more specific to India
            risk = predict_risk_for_city(f"{search_name},IN", api_key=DEFAULT_API_KEY)
            # Override name back to display name if we queried by search_name
            risk["city"] = display_name
            results.append(risk)
        except Exception as e:
            print(f"Error fetching risk for {display_name}: {e}")
            continue

    user_point = None
    if lat is not None and lon is not None:
        try:
            user_point = predict_risk_by_coords(lat, lon, api_key=DEFAULT_API_KEY)
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
    image: Optional[UploadFile] = File(None)
):
    """
    Combines environmental risk (weather) with visual diagnosis (image) 
    for a localized Hybrid Potato risk assessment.
    Uses 'current_only=True' for live weather-based risk.
    """
    # 1. Environmental Analysis (LIVE)
    weather_risk = predict_risk_by_coords(lat, lon, api_key=DEFAULT_API_KEY, current_only=True)
    
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
            # Run vision model
            with Image.open(file_path).convert("RGB") as img:
                vision_result = predict_potato(img)
                
            visual_diagnosis = {
                "disease": vision_result.get("disease"),
                "confidence": vision_result.get("confidence"),
            }
        finally:
            # Clean up
            if os.path.exists(file_path):
                os.remove(file_path)

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
