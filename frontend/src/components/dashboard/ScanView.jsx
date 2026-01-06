export default function ScanView({ image, onBack, onAnalyze, isAnalyzing }) {
  if (!image || !image.preview) return null;

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 mb-6 transition hover:text-slate-900"
      >
        ← Back
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Scan Crop Image
          </h2>
          <p className="text-slate-500 mt-1">
            Review the selected image before running the AI analysis.
          </p>
        </div>

        {/* Image Preview */}
        <div className="flex justify-center">
          <div className="border rounded-xl p-4 bg-slate-50">
            <img
              src={image.preview}
              alt="Crop Preview"
              className="max-h-[420px] rounded-lg object-contain"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Analyzing…" : "Analyze Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
