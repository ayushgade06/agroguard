import tensorflow as tf
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.keras")

model = tf.keras.models.load_model(MODEL_PATH)