export default function ScanView({
  image,
  onBack,
  onAnalyze,
  isAnalyzing,
  crop,
  setCrop,
}) {
  if (!image || !image.preview) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 mb-6 transition hover:text-emerald-900"
      >
        ← Back to dashboard
      </button>

      <div className="glass-panel rounded-3xl p-8 md:p-10 space-y-7">
        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">
            Review & confirm
          </p>
          <h2 className="text-3xl font-black text-slate-900 mt-2">
            Scan Crop Image
          </h2>
          <p className="text-slate-600 mt-2">
            Review the selected image before running the AI analysis.
          </p>
        </div>

        {/* Image Preview */}
        <div className="flex justify-center">
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 shadow-inner">
            <img
              src={image.preview}
              alt="Crop Preview"
              className="max-h-[420px] rounded-xl object-contain"
            />
          </div>
        </div>

        {/* Crop selection */}
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-800">Crop:</span>
          <div className="flex gap-2">
            {["rice", "potato", "corn", "wheat"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCrop?.(c)}
                className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition ${
                  crop === c
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200/70">
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold transition hover:shadow-lg shadow-emerald-400/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Analyzing…" : "Analyze Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
