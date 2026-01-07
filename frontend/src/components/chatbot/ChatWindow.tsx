import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../../services/chatbotService";

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  async function send() {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");

    // 1️⃣ Add user message
    setMessages((m) => [...m, `You: ${userMsg}`]);

    // 2️⃣ Add thinking placeholder
    setMessages((m) => [...m, "AgroGuard: thinking"]);

    const startTime = Date.now();

    try {
      const res = await sendChatMessage(userMsg);

      // 3️⃣ Ensure minimum 2s delay
      const elapsed = Date.now() - startTime;
      const delay = Math.max(2000 - elapsed, 0);

      setTimeout(() => {
        setMessages((m) => {
          const updated = [...m];
          // replace last "thinking"
          const index = updated.lastIndexOf("AgroGuard: thinking");
          if (index !== -1) {
            updated[index] = `AgroGuard: ${res.reply}`;
          }
          return updated;
        });
      }, delay);

    } catch {
      setMessages((m) => {
        const updated = [...m];
        const index = updated.lastIndexOf("AgroGuard: thinking");
        if (index !== -1) {
          updated[index] =
            "AgroGuard: Unable to respond right now. Please try again.";
        }
        return updated;
      });
    }
  }

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Chat Window */}
      <div className="fixed bottom-20 right-6 z-50 w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3 bg-emerald-600 text-white flex justify-between">
          <div className="font-semibold tracking-wide">AgroGuard AI</div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
          {messages.map((m, i) => {
            const isUser = m.startsWith("You:");
            const isThinking = m === "AgroGuard: thinking";

            return (
              <div
                key={i}
                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed shadow-sm
                  ${
                    isUser
                      ? "ml-auto bg-emerald-600 text-white rounded-br-none"
                      : "mr-auto bg-white border text-slate-800 rounded-bl-none"
                  }
                `}
              >
                {isThinking ? (
                  <span className="italic text-slate-500 animate-pulse">
                    AgroGuard AI is thinking…
                  </span>
                ) : (
                  m.replace(/^You:\s|^AgroGuard:\s/, "")
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-white flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Ask about your crop…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button
            onClick={send}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
