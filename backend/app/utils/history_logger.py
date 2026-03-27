import json
import os
from datetime import datetime

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "prediction_history.json")

def save_prediction(crop, disease, confidence):
    timestamp = datetime.utcnow().isoformat() + "Z"
    record = {
        "crop": crop,
        "disease": disease,
        "confidence": confidence,
        "timestamp": timestamp
    }
    
    # Load existing history
    history = []
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r") as f:
                history = json.load(f)
        except json.JSONDecodeError:
            pass
            
    # Append new prediction
    history.append(record)
    
    # Save back to file
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)

def get_history(limit=20):
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r") as f:
            history = json.load(f)
        # Sort by latest first
        history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return history[:limit]
    except json.JSONDecodeError:
        return []

def check_bias(crop: str, limit: int = 20, threshold: float = 0.8):
    """
    Checks recent prediction history for a specific crop.
    Logs a warning if one class dominates more than `threshold`% of the last `limit` predictions.
    """
    history = get_history(limit=limit)
    crop_history = [h for h in history if h.get("crop") == crop]
    
    if len(crop_history) < 5:
        return # Not enough data to determine bias
        
    disease_counts = {}
    for h in crop_history:
        d = h.get("disease")
        disease_counts[d] = disease_counts.get(d, 0) + 1
        
    for d, count in disease_counts.items():
        ratio = count / len(crop_history)
        if ratio >= threshold:
            print(f"⚠️ WARNING: Model bias detected for {crop}! Class '{d}' appears {ratio*100:.0f}% of the time in the last {len(crop_history)} predictions.")

