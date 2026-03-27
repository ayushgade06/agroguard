from fastapi import APIRouter
from app.utils.history_logger import get_history

router = APIRouter(tags=["ML Prediction History"])

@router.get("/history")
def get_prediction_history(limit: int = 20):
    return get_history(limit=limit)
