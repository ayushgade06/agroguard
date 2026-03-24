import tensorflow as tf
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "corn_disease_v2_robust.keras"

model = tf.keras.models.load_model(MODEL_PATH)