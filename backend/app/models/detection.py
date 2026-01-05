from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.database import Base


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)

    # user who detected the disease
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # ML prediction output
    disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)

    # location of detection
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # relationship (many detections → one user)
    user = relationship("User", back_populates="detections")
