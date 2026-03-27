import numpy as np
import tensorflow as tf
from PIL import Image

from .model_loader import get_wheat_model
from .classes import WHEAT_CLASSES, WHEAT_LABEL_MAP

DEBUG_ML = True
from app.utils.history_logger import save_prediction, check_bias

IMG_SIZE = 224  # change if your model uses a different input size


def preprocess_image(image: Image.Image):
    image = image.resize((IMG_SIZE, IMG_SIZE))
    # The wheat model has a built-in Rescaling layer (1/255),
    # so we should NOT divide by 255 here to avoid double-scaling.
    image = np.array(image, dtype=np.float32)
    image = np.expand_dims(image, axis=0)
    return image


def predict_wheat(image: Image.Image):
    wheat_model = get_wheat_model()
    processed = preprocess_image(image)
    preds = wheat_model.predict(processed)

    # The model already has a softmax activation, so we just take the first result.
    preds = preds[0]

    idx = int(np.argmax(preds))
    confidence = float(preds[idx])

    if DEBUG_ML:
        print("\n--- WHEAT ML DEBUG LOG ---")
        print("Raw Probabilities:", preds)
        print("Argmax (Predicted Class Index):", idx)
        
        top_2 = np.argsort(preds)[-2:][::-1]
        print("Top 2 Predictions:", {WHEAT_CLASSES[i]: float(preds[i]) for i in top_2})

    raw_class = WHEAT_CLASSES[idx]
    readable_class = WHEAT_LABEL_MAP[raw_class]

    # Add confidence threshold
    if confidence < 0.5:
        readable_class = "Uncertain"
        raw_class = "Uncertain"

    if DEBUG_ML:
        check_bias(crop="wheat", limit=20, threshold=0.8)

    save_prediction("wheat", readable_class, confidence)

    return {
        "crop": "wheat",
        "disease": readable_class,
        "confidence": confidence
    }