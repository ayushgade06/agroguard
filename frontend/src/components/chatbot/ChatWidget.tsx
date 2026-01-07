import { useState } from "react";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatWindow onClose={() => setOpen(false)} />}

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-emerald-700"
      >
        AgroGuard AI
      </button>
    </>
  );
}
