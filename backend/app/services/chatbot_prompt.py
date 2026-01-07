from groq import Groq
import os
from app.chatbot.chatbot_prompt import build_prompt
from app.chatbot.chatbot_context import get_user_context

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def generate_reply(user_id, message, conversation_id, db):
    try:
        ctx = get_user_context(user_id, db)
        prompt = build_prompt(message, ctx)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=120,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("❌ Groq error:", e)
        return (
            "• Retry later\n"
            "• Service unavailable\n"
            "• No action\n"
            "• Severity unknown"
        )
