from fastapi import APIRouter, UploadFile, File
from PIL import Image
import io

from app.ml.ar_model.inference import predict

router = APIRouter()

@router.post("/predict/ar")
async def predict_ar(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    result = predict(image)
    return result