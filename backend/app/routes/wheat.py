from fastapi import APIRouter, UploadFile, File
from PIL import Image
import io

from app.ml.wheat_disease.predictor import predict_wheat

router = APIRouter()


@router.post("/predict/wheat")
async def predict_wheat_api(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    result = predict_wheat(image)
    return result