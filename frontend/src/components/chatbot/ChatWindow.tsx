import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { sendChatMessage } from "../../services/chatbotService";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    isTyping?: boolean;
};

// Utility to remove emojis for a cleaner look
const stripEmojis = (str: string) => {
    return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDDFF])/g, '');
};

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
        id: "welcome",
        role: "assistant",
        content: "Welcome! I am the **AgroGuard Hybrid Intelligence**. How can I assist you with your Rice, Potato, Corn, or Wheat crops today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  async function send() {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput("");
    
    // Add user message (stripping emoji)
    const sanitizedUser = stripEmojis(userMsg);
    const userMessageObj: Message = { id: Date.now().toString(), role: "user", content: sanitizedUser };
    setMessages((m) => [...m, userMessageObj]);
    setIsTyping(true);

    try {
      const res = await sendChatMessage(sanitizedUser);
      // Strip emoji from AI response
      const sanitizedReply = stripEmojis(res.reply);
      
      setMessages((m) => [
          ...m,
          { id: (Date.now() + 1).toString(), role: "assistant", content: sanitizedReply }
      ]);
    } catch {
      setMessages((m) => [
          ...m, 
          { id: (Date.now() + 1).toString(), role: "assistant", content: "I'm experiencing a technical issue. Please try again or check your regional alerts." }
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-slate-900/10 backdrop-blur-[2px]" onClick={onClose} />

      <motion.div 
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="fixed bottom-24 right-6 z-[201] w-full max-w-[420px] h-[600px] bg-white rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden ring-1 ring-slate-200"
      >
        {/* Header */}
        <div className="px-7 py-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <div className="font-black text-lg tracking-tight leading-none mb-1">AgroGuard AI</div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Regional Intelligence Active
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 px-6 py-6 overflow-y-auto bg-slate-50/50 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                    ${m.role === "user" ? "bg-slate-900 text-white" : "bg-emerald-600 text-white"}
                `}>
                   {m.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
                </div>
                
                <div className={`max-w-[75%] px-4 py-3 rounded-[1.25rem] text-[13px] font-medium leading-[1.6] shadow-[0_2px_10px_rgba(0,0,0,0.03)]
                  ${m.role === "user" 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "bg-white border border-slate-200/60 text-slate-800 rounded-tl-none"}
                `}>
                  <div className="prose prose-sm prose-slate prose-p:leading-relaxed prose-bold:font-black">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                   <Loader2 size={14} className="animate-spin" />
                </div>
                <div className="bg-white border border-slate-200/60 px-4 py-3 rounded-[1.25rem] rounded-tl-none shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 group">
            <input
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="Query hybrid intelligence..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={isTyping}
            />
          </div>
          <button
            onClick={send}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Send size={18} />
          </button>
        </div>
      </motion.div>
    </>
  );
}
