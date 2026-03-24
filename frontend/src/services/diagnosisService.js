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
  
  if (crop === "corn") {
    endpoint = "http://127.0.0.1:8000/ml/corn-disease";
  } else {
    formData.append("crop", crop || "rice");
    formData.append("latitude", latitude.toString());
    formData.append("longitude", longitude.toString());
  }

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

  if (crop === "corn") {
    return {
      disease: data.display_name || data.class || "Unknown",
      confidence: data.confidence || 0,
      explanation: `The model detected ${data.display_name || data.class || "a condition"} with ${(
        (data.confidence || 0) * 100
      ).toFixed(2)}% confidence.`,
      immediateActions: [
        "Isolate affected crops",
        "Avoid overhead irrigation",
        "Consult local agriculture officer",
      ],
    };
  }

  return data;
}
