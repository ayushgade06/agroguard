import { useEffect, useState } from "react";
import { fetchNotifications } from "../services/notificationService";
import { Notification } from "../types/notification";

export function useNotifications(
  userId: string | null,
  token: string | null
) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !token) return;

    setLoading(true);

    fetchNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, [userId, token]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { notifications, unreadCount, loading };
}
