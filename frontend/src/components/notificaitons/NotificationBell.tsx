import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function NotificationBell({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) {
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setIsRinging(true);
      const timeout = setTimeout(() => setIsRinging(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [unreadCount]);

  return (
    <button
      onClick={onClick}
      className="relative w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-emerald-600 hover:border-emerald-200 transition focus:outline-none"
      aria-label="Notifications"
    >
      <motion.div
        animate={isRinging ? { rotate: [0, -25, 25, -20, 20, -10, 10, 0] } : {}}
        transition={{ duration: 0.6 }}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-emerald-600" : "text-slate-700"}`} />
      </motion.div>

      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-sm"
        >
          {isRinging && (
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          )}
          <span className="relative inline-flex items-center justify-center text-[10px] font-bold text-white">
             {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </motion.span>
      )}
    </button>
  );
}
