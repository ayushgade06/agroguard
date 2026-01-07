from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def generate_reply(user_id, message, conversation_id, db):
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # ✅ FIXED MODEL
            messages=[
                {
                    "role": "system",
                    "content": "You are AgroGuard, an expert agricultural advisor. Give short, practical advice."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            temperature=0.4,
            max_tokens=200,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("❌ Groq error:", e)
        return "Unable to generate advice right now. Please try again."
