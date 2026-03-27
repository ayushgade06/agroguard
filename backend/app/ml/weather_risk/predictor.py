import math
import requests
import pandas as pd
from .model_loader import model, scaler
from .disease_labels import DISEASE_MAP

OPENWEATHER_FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast"
OPENWEATHER_CURRENT_URL = "http://api.openweathermap.org/data/2.5/weather"

# --- City Coordinates Database (Maharashtra) ---
CITY_COORDS = {
    "Pune": (18.5204, 73.8567), "Mumbai": (19.0760, 72.8777), "Nagpur": (21.1458, 79.0882),
    "Nashik": (19.9975, 73.7898), "Chhatrapati Sambhajinagar": (19.8762, 75.3433),
    "Ahilyanagar": (19.0952, 74.7496), "Solapur": (17.6599, 75.9064), "Kolhapur": (16.7050, 74.2433),
    "Amravati": (20.9320, 77.7523), "Akola": (20.7059, 77.0019), "Latur": (18.4088, 76.5604),
    "Dhule": (20.9042, 74.7749), "Chandrapur": (19.9615, 79.2961), "Parbhani": (19.2644, 76.7767), "Jalgaon": (21.0077, 75.5626)
}

# Mapping display names to OpenWeather query names if they differ
CITIES_CONFIG = {
    "Chhatrapati Sambhajinagar": "Aurangabad",
    "Ahilyanagar": "Ahmednagar",
    "Pune": "Pune", "Mumbai": "Mumbai", "Nagpur": "Nagpur", "Nashik": "Nashik",
    "Solapur": "Solapur", "Kolhapur": "Kolhapur", "Amravati": "Amravati", 
    "Akola": "Akola", "Latur": "Latur", "Dhule": "Dhule", "Chandrapur": "Chandrapur", 
    "Parbhani": "Parbhani", "Jalgaon": "Jalgaon"
}

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat, dlon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

def calculate_risk_from_metrics(temp, hum, pressure, wind_speed, wind_deg, visibility):
    """Core ML logic to calculate risk from raw weather features."""
    interaction = temp * hum
    df = pd.DataFrame([{
        "Temperature": temp,
        "Humidity": hum,
        "Wind Speed": wind_speed,
        "Wind Bearing": wind_deg,
        "Visibility": visibility,
        "Pressure": pressure,
        "Temp_Humidity_Interaction": interaction
    }])

    X = scaler.transform(df)
    pred = model.predict(X)[0]
    prob = model.predict_proba(X).max()

    disease = DISEASE_MAP[pred]

    if prob >= 0.85:
        risk = "High"
        severity = 5
    elif prob >= 0.7:
        risk = "Medium"
        severity = 3
    else:
        risk = "Low"
        severity = 1

    return {
        "severity_score": severity,
        "disease": disease,
        "risk": risk,
        "confidence": round(prob, 2),
        "temp": temp,
        "hum": hum
    }

def solve_weather_risk(data):
    """Calculates risk from OpenWeather forecast data (5-day)."""
    worst_case = {
        "severity_score": -1,
        "disease": "Safe",
        "risk": "Low",
        "confidence": 0
    }

    daily = []
    for entry in data["list"]:
        if "12:00:00" not in entry["dt_txt"]:
            continue

        metrics = calculate_risk_from_metrics(
            temp=entry["main"]["temp"],
            hum=entry["main"]["humidity"],
            pressure=entry["main"]["pressure"],
            wind_speed=entry["wind"].get("speed", 0),
            wind_deg=entry["wind"].get("deg", 0),
            visibility=entry.get("visibility", 10000) / 1000
        )

        if metrics["severity_score"] > worst_case["severity_score"]:
            worst_case = metrics

        daily.append({
            "date": entry["dt_txt"].split(" ")[0],
            "disease": metrics["disease"],
            "risk": metrics["risk"],
            "confidence": metrics["confidence"],
            "temp": metrics["temp"],
            "hum": metrics["hum"]
        })

    return {
        "city": data["city"]["name"],
        "coordinates": data["city"]["coord"],
        "summary": worst_case,
        "forecast": daily
    }

def predict_risk_for_city(city: str, api_key: str):
    params = {"q": city, "appid": api_key, "units": "metric"}
    res = requests.get(OPENWEATHER_FORECAST_URL, params=params)
    res.raise_for_status()
    return solve_weather_risk(res.json())

def predict_current_risk_for_city(city: str, api_key: str):
    """Calculates risk based on CURRENT weather (live)."""
    params = {"q": city, "appid": api_key, "units": "metric"}
    res = requests.get(OPENWEATHER_CURRENT_URL, params=params)
    res.raise_for_status()
    data = res.json()
    
    metrics = calculate_risk_from_metrics(
        temp=data["main"]["temp"],
        hum=data["main"]["humidity"],
        pressure=data["main"]["pressure"],
        wind_speed=data["wind"].get("speed", 0),
        wind_deg=data["wind"].get("deg", 0),
        visibility=data.get("visibility", 10000) / 1000
    )
    
    return {
        "city": data["name"],
        "coordinates": data["coord"],
        "summary": metrics
    }

def predict_risk_by_coords(lat: float, lon: float, api_key: str, current_only: bool = False):
    """Finds nearest station and predicts risk."""
    closest_city_name = min(CITY_COORDS.keys(), key=lambda city: haversine_distance(lat, lon, CITY_COORDS[city][0], CITY_COORDS[city][1]))
    search_name = CITIES_CONFIG.get(closest_city_name, closest_city_name)
    
    if current_only:
        result = predict_current_risk_for_city(f"{search_name},IN", api_key)
    else:
        result = predict_risk_for_city(f"{search_name},IN", api_key)
    
    dist = haversine_distance(lat, lon, CITY_COORDS[closest_city_name][0], CITY_COORDS[closest_city_name][1])
    result["nearest_station"] = closest_city_name
    result["distance_km"] = round(dist, 2)
    result["user_coords"] = {"lat": lat, "lon": lon}
    return result
