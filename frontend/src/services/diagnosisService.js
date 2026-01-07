export async function analyzeCropImage(
  file,
  latitude,
  longitude,
  crop
) {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    throw new Error("Please login again - your session has expired");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("crop", crop || "rice");
  formData.append("latitude", latitude.toString());
  formData.append("longitude", longitude.toString());

  const res = await fetch("http://127.0.0.1:8000/detections/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Detection failed");
  }

  return res.json();
}
