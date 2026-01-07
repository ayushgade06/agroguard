def build_disease_alert(disease, crop, distance_km, farmer):
    return {
        "title": "Disease Alert Nearby",
        "message": f"{disease} detected in {crop} crop",
        "metadata": {
            "disease": disease,
            "crop": crop,
            "distance_km": distance_km,
            "farmer": farmer
        }
    }
