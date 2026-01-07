const API_URL = "http://127.0.0.1:8000";

export async function sendChatMessage(message: string) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_URL}/chatbot/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      conversation_id: "frontend-chat",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Chatbot request failed");
  }

  return res.json(); // { reply, conversation_id }
}
