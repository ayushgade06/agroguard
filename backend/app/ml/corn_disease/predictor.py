import numpy as np
import tensorflow as tf
from .model_loader import model
from .preprocess import preprocess_image
from .classes import CLASS_NAMES

def format_label(label):
    return label.replace("_", " ").title()

def predict_corn_disease(image):
    input_tensor = preprocess_image(image)

    logits = model.predict(input_tensor)

    probs = tf.nn.softmax(logits, axis=1).numpy()

    confidence = float(np.max(probs))
    class_idx = int(np.argmax(probs))

    raw_label = CLASS_NAMES[class_idx]
    formatted_label = format_label(raw_label)

    return {
        "class": raw_label,              # for internal use
        "display_name": formatted_label, # for UI
        "confidence": round(confidence, 4)
    }