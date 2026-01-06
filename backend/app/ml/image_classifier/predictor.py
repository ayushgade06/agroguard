import numpy as np
import tensorflow as tf
from .model_loader import model
from .preprocess import preprocess_image
from .labels import CLASS_NAMES

def predict_image(image):
    input_tensor = preprocess_image(image)

    logits = model.predict(input_tensor)
    
    probs = tf.nn.softmax(logits, axis=1).numpy()

    confidence = float(np.max(probs))
    class_idx = int(np.argmax(probs))

    print("Real TF model predict called")

    return {
        "class": CLASS_NAMES[class_idx],
        "confidence": round(confidence, 4)
    }
