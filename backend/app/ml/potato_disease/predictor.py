import tensorflow as tf
import numpy as np
from PIL import Image

from .classes import CLASS_NAMES

DEBUG_ML = True
from app.utils.history_logger import save_prediction, check_bias

# Lazy loader — model is loaded on first request, not at import time.
_model = None

def get_model():
    global _model
    if _model is None:
        _model = tf.keras.models.load_model("app/ml/potato_disease/model.keras")
    return _model

def preprocess(image: Image.Image):
    # Model expects 300x300 (per error logs)
    image = image.resize((300, 300))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

def predict(image: Image.Image):
    model = get_model()
    img = preprocess(image)
    logits = model.predict(img)[0]
    probs = tf.nn.softmax(logits).numpy()
    
    # Normalize predictions explicitly
    probs = probs / np.sum(probs)
    
    idx = int(np.argmax(probs))
    confidence = float(probs[idx])

    if DEBUG_ML:
        print("\n--- POTATO ML DEBUG LOG ---")
        print("Raw Probabilities:", probs)
        print("Argmax (Predicted Class Index):", idx)
        
        top_2 = np.argsort(probs)[-2:][::-1]
        print("Top 2 Predictions:", {CLASS_NAMES[i]: float(probs[i]) for i in top_2})

    disease = CLASS_NAMES[idx].replace("Potato__", "").replace("_", " ")

    # --- BIAS CORRECTION & SENSITIVITY BOOST ---
    # If the model is leaning towards "Healthy" but not with high certainty,
    # and "Late Blight" is a strong contender (Top 2), we prioritize Late Blight.
    if disease == "Healthy" and confidence < 0.7:
        top_2_indices = np.argsort(probs)[-2:]
        if 0 in top_2_indices: # 0 is Late Blight
            disease = "Late Blight"
            confidence = float(probs[0])
            if DEBUG_ML:
                print(">>> SENSITIVITY BOOST: Overriding 'Healthy' with 'Late Blight'")

    # Add confidence threshold
    if confidence < 0.2:
        disease = "Uncertain"

    if DEBUG_ML:
        check_bias(crop="potato", limit=20, threshold=0.8)

    save_prediction("potato", disease, confidence)

    return {
        "disease": disease,
        "confidence": confidence,
    }
