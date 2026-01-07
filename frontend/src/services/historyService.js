const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Fetch detection history
 */
export async function fetchHistory(severity) {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found, skipping history fetch");
    return [];
  }

  const params = severity && severity !== "All" ? `?severity=${severity}` : "";

  const res = await fetch(`${API_BASE_URL}/detections/${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔐 Handle expired / invalid token
  if (res.status === 401) {
    console.warn("Token expired while fetching history");
    localStorage.clear();
    window.location.href = "/login";
    return [];
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to fetch history");
  }

  return Array.isArray(data) ? data : [];
}

/**
 * Delete a history item (DB delete)
 */
export async function deleteHistoryItem(id) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_BASE_URL}/detections/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // 🔐 Handle expired / invalid token
  if (res.status === 401) {
    console.warn("Token expired while deleting history item");
    localStorage.clear();
    window.location.href = "/login";
    return;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Delete failed");
  }

  return data;
}
