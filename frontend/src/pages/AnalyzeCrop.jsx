import React, { useState } from "react";

const AnalyzeCrop = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submitHandler = async () => {
    if (!image) {
      alert("Please upload an image");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Image submitted for AI analysis (mock)");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fffbef] flex justify-center p-6">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          Analyze Crop Image
        </h1>

        <p className="text-slate-500 mb-4">
          Upload a clear image of the crop leaf or affected area.
        </p>

        <label className="block border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <p className="text-slate-600">
            Click to upload or drag & drop
          </p>
        </label>

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-4 rounded-lg border"
          />
        )}

        <button
          onClick={submitHandler}
          disabled={loading}
          className="w-full mt-5 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Submit for Analysis"}
        </button>
      </div>
    </div>
  );
};

export default AnalyzeCrop;
