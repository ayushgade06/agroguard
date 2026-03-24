from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
from app.ml.corn_disease.predictor import predict_corn_disease

router = APIRouter(prefix="/ml", tags=["ML"])

@router.post("/corn-disease")
def detect_corn_disease(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid image format")

    try:
        image = Image.open(file.file).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    result = predict_corn_disease(image)
    return result
