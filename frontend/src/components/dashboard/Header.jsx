import { Leaf, MapPin, Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
} from "../../services/notificationService";

export default function Header({ location, farmerName }) {
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
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b">
      {/* LEFT: BRAND */}
      <div className="flex items-center gap-2">
        <Leaf className="text-emerald-600" size={22} />
        <span className="font-extrabold tracking-wide text-slate-800">
          AGRIGUARD
        </span>
      </div>

      {/* CENTER: LOCATION */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        {location?.error ? (
          <span className="flex items-center gap-1 text-red-500">
            <MapPin size={14} />
            Location unavailable
          </span>
        ) : location?.city ? (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {location.city}
            {location.state ? `, ${location.state}` : ""}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            Detecting location…
          </span>
        )}
      </div>

      {/* RIGHT: USER + NOTIFICATIONS */}
      <div className="flex items-center gap-6">
        {/* Farmer Name */}
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <User size={16} />
          <span className="font-medium">
            {farmerName ? `Hi, ${farmerName}` : "Welcome"}
          </span>
        </div>

        {/* Notifications */}
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

          {showNotifications && (
            <div className="absolute right-0 top-9 w-80 bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b bg-slate-50">
                <h3 className="font-semibold text-sm text-slate-800">
                  Notifications
                </h3>
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No notifications
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 cursor-pointer transition ${
                        !notif.is_read
                          ? "bg-emerald-50 hover:bg-emerald-100"
                          : "hover:bg-slate-50"
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <p className="text-sm text-slate-800">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(notif.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                          }
                        )}
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
