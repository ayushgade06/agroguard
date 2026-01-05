from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)

    # user who made the detection
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # ML prediction output
    disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)

    # location where disease was detected
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # relationship
    user = relationship("User", back_populates="detections")
