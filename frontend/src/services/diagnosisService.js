export async function analyzeCropImage(base64Image) {
  // Simulate network delay (feels real)
  await new Promise((res) => setTimeout(res, 1200));

  // You can randomize later if you want
  return {
    disease: "Leaf Blight",
    severity: "HIGH",
    explanation:
      "The leaf shows brown patches and dry edges, which usually indicate a fungal infection.",
    immediateActions: [
      "Remove heavily infected leaves",
      "Avoid overhead watering",
      "Spray recommended fungicide within 24 hours",
    ],
    organicTreatment:
      "Spray neem oil mixed with water once every 5 days.",
    chemicalTreatment:
      "Use Mancozeb or Copper-based fungicide as per label instructions.",
    preventionTips: [
      "Maintain proper plant spacing",
      "Avoid excess moisture on leaves",
      "Inspect crops weekly",
    ],
  };
}
