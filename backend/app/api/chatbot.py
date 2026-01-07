from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid

from app.schemas.chatbot import ChatRequest, ChatResponse
from app.services.chatbot_service import generate_reply
from app.core.security import get_current_user
from app.deps import get_db
from app.models.user import User

router = APIRouter(
    tags=["Chatbot"],
    dependencies=[Depends(get_current_user)],
)

@router.post("/message", response_model=ChatResponse)
async def chatbot_message(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation_id = payload.conversation_id or str(uuid.uuid4())

    reply = await generate_reply(   # 🔥 FIX IS HERE
        current_user.id,
        payload.message,
        conversation_id,
        db,
    )

    return {
        "reply": reply,
        "conversation_id": conversation_id,
    }
