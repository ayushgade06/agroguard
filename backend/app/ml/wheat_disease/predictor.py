import numpy as np
from PIL import Image

from .model_loader import get_wheat_model
from .classes import WHEAT_CLASSES, WHEAT_LABEL_MAP

IMG_SIZE = 224  # change if your model uses a different input size


def preprocess_image(image: Image.Image):
    image = image.resize((IMG_SIZE, IMG_SIZE))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image


def predict_wheat(image: Image.Image):
    wheat_model = get_wheat_model()
    processed = preprocess_image(image)
    preds = wheat_model.predict(processed)

    idx = np.argmax(preds)

    raw_class = WHEAT_CLASSES[idx]
    readable_class = WHEAT_LABEL_MAP[raw_class]

    return {
        "crop": "wheat",
        "disease": readable_class,
        "confidence": float(preds[0][idx])
    }