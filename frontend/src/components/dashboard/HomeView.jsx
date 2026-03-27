export default function HomeView({
  onSelectImage,
  history = [],
  crop = "rice",
  setCrop,
}) {
  const safeHistory = Array.isArray(history) ? history : [];
  const recent = safeHistory[0];

  function formatDateOnly(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
    });
  }

  return (
    <div className="space-y-10">
      {/* ---------------- Header ---------------- */}
      <header className="glass-panel rounded-3xl px-8 py-7 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-400/30">
            🌾
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              Crop & Pest Health Command
            </h2>
            <p className="text-slate-600 max-w-2xl">
              Scan your crops for diseases and pests, see localized risk, and act fast with AI guidance.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="tag">Real-time crop & pest insights</span>
          <span className="tag bg-slate-100 text-slate-700">Weather-aware risk</span>
          <span className="tag bg-emerald-100 text-emerald-700">Multi-language tips</span>
        </div>
      </header>

      {/* ---------------- Stats ---------------- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-sm text-slate-500 mb-2">Last Disease</p>
          <p className="text-3xl font-bold text-emerald-700">
            {recent?.disease || "No detections yet"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Latest diagnosis at a glance
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <p className="text-sm text-slate-500 mb-3">Confidence</p>
          {recent ? (
            <>
              <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all"
                  style={{
                    width: `${Math.round(recent.confidence * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {Math.round(recent.confidence * 100)}%
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-slate-800">—</p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            AI certainty for the last scan
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <p className="text-sm text-slate-500 mb-2">Last Scan</p>
          <p className="text-lg font-semibold text-slate-800">
            {recent?.created_at ? formatDateOnly(recent.created_at) : "Run your first scan"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Timestamp of your latest upload
          </p>
        </div>
      </section>

      {/* ---------------- Upload + Tips ---------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8">
          <label className="block h-full">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onSelectImage(e.target.files[0])}
            />

            <div className="h-full border-2 border-dashed border-emerald-200 rounded-2xl p-12 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left cursor-pointer transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/50 hover:-translate-y-0.5">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                  Smart Crop & Pest Scan
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  Upload a crop image to diagnose diseases or pests instantly
                </p>
                <p className="text-slate-500 text-sm">
                  Drag & drop or click to choose. Clear daylight shots work best.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-800">Crop:</span>
                  <div className="flex gap-2">
                    {["rice", "potato", "corn", "wheat"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setCrop?.(c);
                        }}
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold shadow hover:bg-emerald-700 transition">
                  Start Scan
                </div>
                <p className="text-xs text-slate-400">
                  JPG or PNG • Focus on the affected leaf area
                </p>
              </div>
              <div className="hidden lg:block w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-50 text-5xl flex items-center justify-center shadow-inner">
                📸
              </div>
            </div>
          </label>
        </div>

        {/* Tips */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Pro Tips</h3>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              Boost accuracy
            </span>
          </div>
          <ul className="text-slate-700 space-y-3 text-sm leading-relaxed">
            <li>🌤 Capture in natural daylight</li>
            <li>🍃 Keep the affected leaf in focus</li>
            <li>📷 Avoid blur; hold steady for 2 seconds</li>
          </ul>
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 p-4 text-xs text-emerald-700 font-semibold">
            New: Multi-language recommendations in results
          </div>
        </div>
      </section>

      {/* ---------------- Recent Scans ---------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Recent scans
            </p>
            <h3 className="text-xl font-bold text-slate-900">
              History at a glance
            </h3>
          </div>
          {safeHistory.length > 5 && (
            <span className="text-sm text-emerald-600 font-medium cursor-pointer">
              View all
            </span>
          )}
        </div>

        {safeHistory.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-slate-500 text-sm">
            No scans yet. Upload your first image to see insights here.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {safeHistory.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="glass-panel rounded-2xl px-5 py-4 flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">
                    {item.disease}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.created_at
                      ? formatDateOnly(item.created_at)
                      : "—"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Confidence
                  </p>
                  <span className="text-lg font-bold text-emerald-700">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
