import numpy as np
from PIL import Image
from .model_loader import model
from .labels import plant_class_names

IMG_SIZE = 224  # change if needed

def get_severity(confidence):
    if confidence > 0.85:
        return "High"
    elif confidence > 0.6:
        return "Medium"
    else:
        return "Low"


def get_actions(disease):
    if "Healthy" in disease:
        return ["No action needed. Plant is healthy 🌿"]

    return [
        "Remove infected leaves",
        "Avoid overhead watering",
        "Apply recommended fungicide",
        "Monitor nearby plants"
    ]


def predict(image: Image.Image):
    # preprocess
    image = image.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # predict
    predictions = model.predict(img_array)
    confidence = float(np.max(predictions))
    class_index = int(np.argmax(predictions))

    disease = plant_class_names[class_index]

    return {
        "disease": disease,
        "confidence": confidence,
        "severity": get_severity(confidence),
        "immediateActions": get_actions(disease),
        "explanation": f"The model detected {disease} with {(confidence * 100):.2f}% confidence."
    }