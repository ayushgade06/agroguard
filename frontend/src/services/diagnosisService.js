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

  let endpoint = "http://127.0.0.1:8000/detections/";
  
  formData.append("crop", crop || "rice");
  formData.append("latitude", (latitude || 0).toString());
  formData.append("longitude", (longitude || 0).toString());

  const res = await fetch(endpoint, {
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

  const data = await res.json();

  return data;
}

export async function analyzeARImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://127.0.0.1:8000/predict/ar", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "AR Detection failed");
  }

  return await res.json();
}
