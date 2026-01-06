import NotificationItem from "./NotificationItem";
import { Notification } from "../../types/notification";

export default function NotificationList({
  notifications,
  loading,
}: {
  notifications: Notification[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="w-80 bg-white rounded-xl shadow-xl p-4 text-sm text-slate-500">
        Loading notifications…
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="w-80 bg-white rounded-xl shadow-xl p-6 text-sm text-slate-500 text-center">
        No notifications
      </div>
    );
  }

  return (
    <div className="w-80 bg-white shadow-xl rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-slate-50">
        <p className="text-sm font-semibold text-slate-800">
          Notifications
        </p>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}
      </div>
    </div>
  );
}
