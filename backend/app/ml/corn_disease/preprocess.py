import numpy as np
from tensorflow.keras.applications.resnet50 import preprocess_input

def preprocess_image(image, target_size=(224, 224)):
    image = image.resize(target_size)
    image = np.array(image, dtype=np.float32)
    image = np.expand_dims(image, axis=0)

    image = preprocess_input(image)

    return image