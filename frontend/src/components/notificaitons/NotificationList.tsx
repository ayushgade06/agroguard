import { motion, AnimatePresence } from "framer-motion";
import { Trash2, BellOff } from "lucide-react";
import NotificationItem from "./NotificationItem";
import { Notification } from "../../types/notification";

export default function NotificationList({
  notifications,
  loading,
  onSelect,
  onClearAll,
}: {
  notifications: Notification[];
  loading: boolean;
  onSelect?: (n: Notification) => void;
  onClearAll?: () => void;
}) {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute right-0 top-14 w-80 md:w-96 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-slate-200/60 z-50 origin-top-right flex flex-col max-h-[70vh]"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <div>
           <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
           <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mt-0.5">
             You have {unreadCount} unread alert{unreadCount !== 1 && 's'}
           </p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-6 space-y-4">
             {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="animate-pulse flex space-x-4 mb-4">
                  <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-slate-100">
              <BellOff className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">All caught up!</p>
            <p className="text-xs mt-1 text-slate-500 leading-relaxed max-w-[200px]">There are no new alerts to show right now. Check back later.</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={onSelect}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
