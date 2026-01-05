import random

def predict(image):
    """
    Mock prediction function for disease detection.
    In a real app, this would load a PyTorch/TensorFlow model and run inference.
    """
    diseases = ["Healthy", "Rust", "Blight", "Powdery Mildew", "Leaf Spot"]
    
    return {
        "class": random.choice(diseases),
        "confidence": round(random.uniform(0.7, 0.99), 2)
    }
