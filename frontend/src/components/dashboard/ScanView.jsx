export default function ScanView({ image, onBack, onAnalyze, isAnalyzing }) {
  if (!image || !image.preview) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-slate-600 font-medium mb-6 hover:text-slate-900"
      >
        ← Back
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Scan Crop Image
        </h2>

        <p className="text-slate-500 mb-6">
          Review the selected image before running the AI analysis.
        </p>

        <div className="flex justify-center mb-6">
          <img
            src={image.preview}
            alt="Crop Preview"
            className="max-h-96 rounded-xl border"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onBack}
            className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold
                       hover:bg-emerald-700 disabled:opacity-60"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
