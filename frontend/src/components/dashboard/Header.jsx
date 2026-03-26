import { Leaf, MapPin, Bell, User, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  fetchNotifications,
  markNotificationRead,
} from "../../services/notificationService";
import NotificationList from "../notificaitons/NotificationList";
import NotificationBell from "../notificaitons/NotificationBell";
import NotificationDetailModal from "../notificaitons/NotificationDetailModal";
import { AnimatePresence } from "framer-motion";

export default function Header({ location, farmerName }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.is_read).length
    : 0;

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await fetchNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    };

    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }
    setSelectedNotification(notification);
  };

  return (
    <header className="sticky top-0 z-30 px-6 py-4 backdrop-blur-md bg-white/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-400/30">
            <Leaf size={22} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Agro intelligence
            </p>
            <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Smart Crop & Pest Guardian
              {/* <span className="tag">
                <Sparkles size={14} />
                Live
              </span> */}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-slate-700">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MapPin size={16} />
            </div>
            {location?.error ? (
              <span className="text-red-500">Location unavailable</span>
            ) : location?.city ? (
              <span className="font-medium">
                {location.city}
                {location.state ? `, ${location.state}` : ""}
              </span>
            ) : (
              <span>Detecting location…</span>
            )}
          </div>

          <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Farmer
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {farmerName ? `Hi, ${farmerName}` : "Welcome back"}
              </p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <NotificationBell 
              unreadCount={unreadCount} 
              onClick={() => setShowNotifications(!showNotifications)} 
            />

            <AnimatePresence>
              {showNotifications && (
                <NotificationList
                  notifications={notifications}
                  loading={false}
                  onSelect={handleNotificationClick}
                  onClearAll={() => setNotifications([])}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedNotification && (
            <NotificationDetailModal
              notification={selectedNotification}
              onClose={() => setSelectedNotification(null)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
