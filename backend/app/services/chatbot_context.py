from app.models.detection import Detection

def get_user_context(user_id: int, db):
    last = (
        db.query(Detection)
        .filter(Detection.user_id == user_id)
        .order_by(Detection.created_at.desc())
        .first()
    )

    if not last:
        print("🧠 Chatbot context: NO previous detection")
        return {
            "crop": "Unknown",
            "disease": "None",
            "confidence": "N/A",
            "risk": "Low",
            "nearby_alerts": 0,
            "location": "Unknown",
        }

    # ✅ DEBUG LOG (THIS IS THE PROOF)
    print("🧠 Last detection used for chatbot:")
    print("Crop:", last.crop)
    print("Disease:", last.disease)
    print("Confidence:", last.confidence)
    print("Risk:", last.risk)
    print("Created at:", last.created_at)

    return {
        "crop": last.crop,
        "disease": last.disease,
        "confidence": round(last.confidence * 100, 1),
        "risk": last.risk,
        "nearby_alerts": last.nearby_count,
        "location": last.location,
    }
