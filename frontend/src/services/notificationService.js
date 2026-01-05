const API = "http://127.0.0.1:8000";

export async function fetchNotifications() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found, skipping notifications fetch");
      return [];
    }

    const res = await fetch(`${API}/notifications/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch notifications:", res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationRead(id) {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(`${API}/notifications/${id}/read`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}
