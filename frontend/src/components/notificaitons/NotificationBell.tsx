import { Bell } from "lucide-react";

export default function NotificationBell({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) {
  return (
    <button className="relative" onClick={onClick}>
      <Bell className="w-6 h-6 text-slate-700" />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
