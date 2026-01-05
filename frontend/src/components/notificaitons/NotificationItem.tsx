import { Notification } from "../../types/notification";

export default function NotificationItem({ notification }: { notification: Notification }) {
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
      <p className="text-sm font-semibold text-slate-800">
        {notification.title}
      </p>

      <p className="text-xs text-slate-600 mt-1">
        {notification.message}
      </p>

      <p className="text-[10px] text-slate-400 mt-2">
        {formatToIST(notification.created_at)}
      </p>
    </div>
  );
}


function formatToIST(dateString: string) {
  return new Date(dateString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
