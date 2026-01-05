export async function analyzeCropImage(file, latitude, longitude) {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    throw new Error("Please login again - your session has expired");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);

  const res = await fetch("http://127.0.0.1:8000/detections", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // ❌ DO NOT set Content-Type for FormData
    },
    body: formData, // 🔥 THIS WAS MISSING
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      throw new Error("Session expired - please login again");
    }

    const err = await res.text();
    console.error("Detection API error:", err);
    throw new Error(err || "Detection failed");
  }

  return res.json();
}
