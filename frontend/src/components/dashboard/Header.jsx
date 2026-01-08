import { Leaf, MapPin, Bell, User, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
} from "../../services/notificationService";
import NotificationList from "../notificaitons/NotificationList";

export default function Header({ location, farmerName }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.is_read).length
    : 0;

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

          <div className="relative">
            <button
              className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-emerald-600 hover:border-emerald-200 transition"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-semibold shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 flex gap-3 z-50">
                <NotificationList
                  notifications={notifications}
                  loading={false}
                  onSelect={handleNotificationClick}
                />
                {selectedNotification && (
                  <div className="w-80 glass-panel rounded-2xl p-4 shadow-2xl text-sm text-slate-700">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold mb-2">
                      Alert details
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedNotification.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(selectedNotification.created_at).toLocaleString(
                        "en-IN",
                        { timeZone: "Asia/Kolkata" }
                      )}
                    </p>
                    <div className="mt-3 space-y-1">
                      <p>
                        <span className="font-semibold">Crop:</span>{" "}
                        {selectedNotification.crop || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Disease/Pest:</span>{" "}
                        {selectedNotification.disease || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Farmer:</span>{" "}
                        {selectedNotification.farmer || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Distance:</span>{" "}
                        {selectedNotification.distance_km
                          ? `${selectedNotification.distance_km} km`
                          : "N/A"}
                      </p>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                      {selectedNotification.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
