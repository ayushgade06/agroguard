const API = "http://127.0.0.1:8000";

export async function fetchNotifications() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found, skipping notifications fetch");
    return [];
  }

  try {
    const res = await fetch(`${API}/notifications/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 🔐 Handle expired / invalid token
    if (res.status === 401) {
      console.warn("Token expired while fetching notifications");
      localStorage.clear();
      window.location.href = "/login";
      return [];
    }

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
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const res = await fetch(`${API}/notifications/${id}/read`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 🔐 Handle expired / invalid token
    if (res.status === 401) {
      console.warn("Token expired while marking notification read");
      localStorage.clear();
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}
