import numpy as np
import tensorflow as tf
from .model_loader import model
from .preprocess import preprocess_image
from .labels import CLASS_NAMES

DEBUG_ML = True
from app.utils.history_logger import save_prediction, check_bias

def predict_image(image):
    input_tensor = preprocess_image(image)

    logits = model.predict(input_tensor)
    
    probs = tf.nn.softmax(logits, axis=1).numpy()[0]
    
    # Normalize predictions explicitly
    probs = probs / np.sum(probs)

    idx = int(np.argmax(probs))
    confidence = float(probs[idx])

    if DEBUG_ML:
        print("\n--- GENERAL ML DEBUG LOG ---")
        print("Raw Probabilities:", probs)
        print("Argmax (Predicted Class Index):", idx)
        
        top_2 = np.argsort(probs)[-2:][::-1]
        print("Top 2 Predictions:", {CLASS_NAMES[i]: float(probs[i]) for i in top_2})

    disease = CLASS_NAMES[idx]

    if confidence < 0.5:
        disease = "Uncertain"
        
    if DEBUG_ML:
        check_bias(crop="general/rice", limit=20, threshold=0.8)
        
    save_prediction("general/rice", disease, confidence)

    return {
        "class": disease,
        "confidence": round(confidence, 4)
    }
