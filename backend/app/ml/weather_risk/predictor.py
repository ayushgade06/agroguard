import requests
import pandas as pd
from .model_loader import model, scaler
from .disease_labels import DISEASE_MAP

OPENWEATHER_URL = "http://api.openweathermap.org/data/2.5/forecast"

def predict_risk_for_city(city: str, api_key: str):
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }

    res = requests.get(OPENWEATHER_URL, params=params)
    res.raise_for_status()
    data = res.json()

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

        temp = entry["main"]["temp"]
        hum = entry["main"]["humidity"]
        pressure = entry["main"]["pressure"]
        wind_speed = entry["wind"].get("speed", 0)
        wind_deg = entry["wind"].get("deg", 0)
        visibility = entry.get("visibility", 10000) / 1000
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

        # Severity logic (simplified but consistent)
        if prob >= 0.85:
            risk = "High"
            severity = 3
        elif prob >= 0.7:
            risk = "Medium"
            severity = 2
        else:
            risk = "Low"
            severity = 1

        if severity > worst_case["severity_score"]:
            worst_case = {
                "severity_score": severity,
                "disease": disease,
                "risk": risk,
                "confidence": round(prob, 2)
            }

        daily.append({
            "date": entry["dt_txt"].split(" ")[0],
            "disease": disease,
            "risk": risk,
            "confidence": round(prob, 2)
        })

    return {
        "city": city,
        "coordinates": data["city"]["coord"],
        "summary": worst_case,
        "forecast": daily
    }
