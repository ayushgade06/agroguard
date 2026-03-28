from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def generate_reply(user_id, message, conversation_id, db):
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are the AgroGuard Lead Agricultural Intelligence Officer. Your mission is to assist farmers in "
                        "Maharashtra with high-precision advice on crop health, specifically for Rice, Potato, Corn, and Wheat. "
                        "You specialize in Hybrid Diagnosis (Vision + Weather). Focus on actionable, organic and chemical mitigation "
                        "strategies, irrigation adjustment based on humidity, and regional disease patterns. "
                        "Keep advice practical, encouraging, and scientifically sound. Use bullet points for steps. "
                        "If asked about yourself, mention you are the AgroGuard Hybrid AI."
                    )
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            temperature=0.6,
            max_tokens=450,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("❌ Groq error:", e)
        return "Unable to generate advice right now. Please try again."
