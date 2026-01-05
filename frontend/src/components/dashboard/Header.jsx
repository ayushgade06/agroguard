import { Leaf, MapPin, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
} from "../../services/notificationService";

export default function Header({ location }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter((n) => !n.is_read).length 
    : 0;

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await fetchNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    };
    
    loadNotifications();
    
    // Poll every 30 seconds
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
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white border-b">
      {/* LEFT: LOGO */}
      <div className="flex items-center gap-2">
        <Leaf className="text-emerald-600" size={22} />
        <span className="font-black tracking-wide text-slate-800">
          AGRIGUARD
        </span>
      </div>

      {/* RIGHT: LOCATION + NOTIFICATIONS */}
      <div className="flex items-center gap-6 text-sm text-slate-600">
        {/* LOCATION */}
        {location?.error ? (
          <span className="flex items-center gap-1 text-red-500">
            <MapPin size={14} />
            Location unavailable
          </span>
        ) : location?.city ? (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {location.city}, {location.state}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            Detecting location…
          </span>
        )}

        {/* NOTIFICATION BELL */}
        <div className="relative">
          <Bell
            size={20}
            className="cursor-pointer text-slate-700 hover:text-emerald-600 transition"
            onClick={() => setShowNotifications(!showNotifications)}
          />

          {unreadCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5
              bg-red-600 text-white text-[10px]
              w-5 h-5 flex items-center justify-center
              rounded-full font-semibold shadow"
            >
              {unreadCount}
            </span>
          )}

          {/* NOTIFICATION DROPDOWN */}
          {showNotifications && (
            <div className="absolute right-0 top-8 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b bg-slate-50">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No notifications
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 cursor-pointer hover:bg-slate-50 ${
                        !notif.is_read ? "bg-emerald-50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <p className="text-sm text-slate-800">{notif.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
