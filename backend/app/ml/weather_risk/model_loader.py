import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(BASE_DIR / "assets/disease_model_optimized.pkl")
scaler = joblib.load(BASE_DIR / "assets/weather_scaler_optimized.pkl")
