from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    # user who receives the notification
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # message shown in bell dropdown
    message = Column(String, nullable=False)

    # read status for bell badge
    is_read = Column(Boolean, default=False, nullable=False)

    # timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # relationship (many notifications → one user)
    user = relationship("User", back_populates="notifications")
