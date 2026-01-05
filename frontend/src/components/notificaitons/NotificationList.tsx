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
    return <div className="p-4 text-sm">Loading...</div>;
  }

  if (notifications.length === 0) {
    return <div className="p-4 text-sm">No notifications</div>;
  }

  return (
    <div className="w-80 bg-white shadow-xl rounded-xl overflow-hidden">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}
