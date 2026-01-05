import tensorflow as tf
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "weights" / "model.keras"

model = tf.keras.models.load_model(MODEL_PATH)
