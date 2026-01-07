import { Notification } from "../../types/notification";
import { formatDistance } from "../../utils/formatDistance";
import { formatToIST } from "../../utils/formatTime";

export default function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick?: (n: Notification) => void;
}) {
  const meta = notification.metadata;
  const distance = formatDistance(meta?.distance_km);

  return (
    <div
      onClick={() => onClick?.(notification)}
      className={`p-4 border-b transition cursor-pointer
        ${
          notification.is_read
            ? "bg-white"
            : "bg-green-50 hover:bg-green-100"
        }`}
    >
      {/* Title */}
      <p className="text-sm font-semibold text-red-700">
        {notification.title}
      </p>

      {/* Main message */}
      <p className="text-sm mt-1 text-slate-800">
        <b>{meta?.disease ?? "Disease"}</b> detected in{" "}
        <b>{meta?.crop ?? "crop"}</b>
      </p>

      {/* Farmer */}
      {meta?.farmer && (
        <p className="text-xs text-slate-600 mt-0.5">
          👨‍🌾 Farmer: {meta.farmer}
        </p>
      )}

      {/* Distance */}
      {distance && (
        <p className="text-xs text-slate-600">
          📍 Distance: {distance}
        </p>
      )}

      {/* Date */}
      <p className="text-[10px] text-slate-400 mt-2">
        {formatToIST(notification.created_at)}
      </p>
    </div>
  );
}
