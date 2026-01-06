import { Bell } from "lucide-react";

export default function NotificationBell({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        relative
        p-2
        rounded-full
        transition
        hover:bg-slate-100
        focus:outline-none
        focus:ring-2
        focus:ring-emerald-500
        focus:ring-offset-2
      "
      aria-label="Notifications"
    >
      <Bell className="w-6 h-6 text-slate-700" />

      {unreadCount > 0 && (
        <span
          className="
            absolute
            -top-1
            -right-1
            min-w-[18px]
            h-[18px]
            px-1
            flex items-center justify-center
            bg-red-600
            text-white
            text-[10px]
            font-semibold
            rounded-full
            shadow
          "
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
}
