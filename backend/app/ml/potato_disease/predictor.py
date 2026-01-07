import tensorflow as tf
import numpy as np
from PIL import Image

from .classes import CLASS_NAMES

model = tf.keras.models.load_model(
    "app/ml/potato_disease/model.keras"
)

def preprocess(image: Image.Image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

def predict(image: Image.Image):
    img = preprocess(image)
    logits = model.predict(img)[0]
    probs = tf.nn.softmax(logits).numpy()
    idx = int(np.argmax(probs))

    confidence = float(probs[idx])

    return {
        "disease": CLASS_NAMES[idx],
        "confidence": confidence,
    }
