import { Notification } from "../../types/notification";

export default function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  return (
    <div
      className={`p-4 border-b cursor-pointer transition
        ${
          notification.is_read
            ? "bg-white"
            : "bg-green-50 hover:bg-green-100"
        }
      `}
    >
      {/* Title */}
      <p className="text-sm font-semibold text-slate-800">
        {notification.title}
      </p>

      {/* Message */}
      <p className="text-xs text-slate-600 mt-1">
        {notification.message}
      </p>

      {/* Date only */}
      <p className="text-[10px] text-slate-400 mt-2">
        {notification.created_at
          ? formatDateOnly(notification.created_at)
          : "—"}
      </p>
    </div>
  );
}

function formatDateOnly(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
  });
}
