from pydantic import BaseModel
from datetime import datetime

class NotificationOut(BaseModel):
    id: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True
