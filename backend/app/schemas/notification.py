from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationOut(BaseModel):
    id: str
    title: str
    message: str
    metadata: Optional[dict]
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True