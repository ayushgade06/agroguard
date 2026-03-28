import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, User, Leaf, Clock, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Notification } from "../../types/notification";
import { formatToIST } from "../../utils/formatTime";
import { useEffect } from "react";

export default function NotificationDetailModal({
  notification,
  onClose,
}: {
  notification: Notification | null;
  onClose: () => void;
}) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (notification) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [notification, onClose]);

  if (!notification) return null;

  const meta = notification;

  const content = `${notification.title} ${notification.message}`.toLowerCase();
  
  let headerColor = "from-emerald-500 to-teal-600";
  let alertBadge = <><Info size={14} /> System Alert</>;
  
  if (content.includes("high") || content.includes("late blight") || content.includes("severe")) {
    headerColor = "from-red-500 to-rose-600";
    alertBadge = <><AlertTriangle size={14} /> High Risk Alert</>;
  } else if (content.includes("medium") || content.includes("early blight") || content.includes("spot")) {
    headerColor = "from-amber-500 to-orange-500";
    alertBadge = <><AlertCircle size={14} /> Warning Alert</>;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 mx-auto"
        >
          {/* Header Banner */}
          <div className={`px-7 py-6 bg-gradient-to-r ${headerColor} text-white flex justify-between items-start`}>
            <div className="pr-8">
              <h2 className="text-2xl font-black leading-tight tracking-tight shadow-sm drop-shadow-sm">
                {alertBadge}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/30 rounded-full transition-colors absolute top-5 right-5 shadow-sm"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Content */}
          <div className="p-7 bg-slate-50/50 flex-1">
            <div className="p-4 rounded-2xl mb-6 bg-white shadow-sm border border-slate-100">
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                     <Leaf size={14} className="text-emerald-500"/> Crop Detected
                  </p>
                  <p className="text-sm font-bold text-slate-800 tracking-tight">{meta?.crop || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                     <AlertTriangle size={14} className="text-red-500"/> Diagnosis
                  </p>
                  <p className="text-sm font-bold text-slate-800 tracking-tight">{meta?.disease || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <User size={14} className="text-blue-500"/> Farmer Name
                  </p>
                  <p className="text-sm font-bold text-slate-800 tracking-tight">{meta?.farmer || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                     <MapPin size={14} className="text-amber-500"/> Distance
                  </p>
                  <p className="text-sm font-bold text-slate-800 tracking-tight">{meta?.distance_km ? `${meta.distance_km} km` : "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="mb-2 bg-slate-100 p-4 rounded-xl border border-slate-200/50">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Info size={14} className="text-slate-400" /> Explanation
              </p>
              <p className="text-[13px] text-slate-700 font-medium leading-relaxed tracking-wide">
                {notification.message || "No further details have been logged for this alert instance."}
              </p>
            </div>
            
            <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider justify-end">
               <Clock size={14} />
               {formatToIST(notification.created_at)}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
