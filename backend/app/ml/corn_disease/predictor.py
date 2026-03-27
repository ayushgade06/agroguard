import numpy as np
import tensorflow as tf
from .model_loader import model
from .preprocess import preprocess_image
from .classes import CLASS_NAMES

DEBUG_ML = True
from app.utils.history_logger import save_prediction, check_bias

def format_label(label):
    return label.replace("_", " ").title()

def predict_corn_disease(image):
    input_tensor = preprocess_image(image)

    logits = model.predict(input_tensor)

    probs = tf.nn.softmax(logits, axis=1).numpy()[0]

    # Normalize predictions explicitly
    probs = probs / np.sum(probs)

    idx = int(np.argmax(probs))
    confidence = float(probs[idx])

    if DEBUG_ML:
        print("\n--- CORN ML DEBUG LOG ---")
        print("Raw Probabilities:", probs)
        print("Argmax (Predicted Class Index):", idx)
        
        top_2 = np.argsort(probs)[-2:][::-1]
        print("Top 2 Predictions:", {CLASS_NAMES[i]: float(probs[i]) for i in top_2})

    raw_label = CLASS_NAMES[idx]
    formatted_label = format_label(raw_label)

    # Add confidence threshold
    if confidence < 0.5:
        raw_label = "Uncertain"
        formatted_label = "Uncertain"

    if DEBUG_ML:
        check_bias(crop="corn", limit=20, threshold=0.8)

    save_prediction("corn", formatted_label, confidence)

    return {
        "class": raw_label,              # for internal use
        "display_name": formatted_label, # for UI
        "confidence": round(confidence, 4)
    }