from fastapi import APIRouter, Query
from app.ml.weather_risk.predictor import predict_risk_for_city

router = APIRouter(prefix="/risk-map", tags=["Risk Map"])

@router.get("")
def get_risk_map(
    crop: str = Query("rice"),
):
    # for now crop is fixed (rice)
    cities = {
        "Pune": "Pune,IN",
        "Nagpur": "Nagpur,IN",
        "Kolhapur": "Kolhapur,IN"
    }

    results = []
    for name, city in cities.items():
        results.append(predict_risk_for_city(city, api_key="fd3e4a7873ba30c646f32933bbc03e89"))

    return {
        "crop": crop,
        "points": results
    }
