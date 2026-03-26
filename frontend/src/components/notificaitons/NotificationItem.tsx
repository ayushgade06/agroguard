import { motion } from "framer-motion";
import { MapPin, User, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Notification } from "../../types/notification";
import { formatDistance } from "../../utils/formatDistance";
import { formatToIST } from "../../utils/formatTime";

export default function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick?: (n: Notification) => void;
}) {
  const meta = notification;
  const distance = formatDistance(meta?.distance_km);

  // Determine severity based on content hints
  let borderColor = "border-l-emerald-400";
  let icon = <Info className="text-emerald-500 w-5 h-5" />;
  
  const content = `${notification.title} ${notification.message}`.toLowerCase();
  
  if (content.includes("high") || content.includes("late blight") || content.includes("severe")) {
    borderColor = "border-l-red-500";
    icon = <AlertTriangle className="text-red-500 w-5 h-5" />;
  } else if (content.includes("medium") || content.includes("early blight") || content.includes("spot")) {
    borderColor = "border-l-amber-500";
    icon = <AlertCircle className="text-amber-500 w-5 h-5" />;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01, backgroundColor: notification.is_read ? "#f8fafc" : "#f0fdf4" }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick?.(notification)}
      className={`relative p-4 border-b border-slate-100 cursor-pointer border-l-4 ${borderColor} ${
        notification.is_read ? "bg-white" : "bg-emerald-50/40"
      } transition-colors`}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 shrink-0 bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
           <div className="flex justify-between items-start">
             <h4 className={`text-sm truncate pr-2 ${notification.is_read ? 'text-slate-600 font-semibold' : 'text-slate-900 font-bold'}`}>
               {notification.title}
             </h4>
             <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap shrink-0">
               {formatToIST(notification.created_at)}
             </span>
           </div>
           
           <p className={`text-xs mt-1 truncate ${notification.is_read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
             {meta?.disease ? <b>{meta.disease}</b> : "Detected condition"} in {meta?.crop ? <b>{meta.crop}</b> : "crop"}
           </p>

           <div className="flex gap-3 mt-2.5 text-[10px] text-slate-500 font-medium">
             {meta?.farmer && (
               <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded"><User size={12}/> {meta.farmer}</span>
             )}
             {distance && (
               <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded"><MapPin size={12}/> {distance}</span>
             )}
           </div>
        </div>
        {!notification.is_read && (
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
        )}
      </div>
    </motion.div>
  );
}
