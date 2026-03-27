import tensorflow as tf
from pathlib import Path

# Get current directory
BASE_DIR = Path(__file__).resolve().parent

# Model path
WHEAT_MODEL_PATH = BASE_DIR / "wheat_model.keras"

# Lazy loader — model is loaded on first request, not at import time.
# This lets the server start even if wheat_model.keras isn't placed yet.
_wheat_model = None


def get_wheat_model():
    global _wheat_model
    if _wheat_model is None:
        if not WHEAT_MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Wheat model not found at {WHEAT_MODEL_PATH}. "
                "Please place wheat_model.keras in app/ml/wheat_disease/"
            )
        _wheat_model = tf.keras.models.load_model(WHEAT_MODEL_PATH)
    return _wheat_model