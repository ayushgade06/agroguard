const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Fetch detection history
 */
export async function fetchHistory() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/detections`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to fetch history");
  }

  return data;
}

/**
 * Delete a history item (DB delete)
 */
export async function deleteHistoryItem(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/detections/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Delete failed");
  }

  return data;
}
