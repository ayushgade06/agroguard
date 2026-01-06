export default function HomeView({ onSelectImage, history = [] }) {
  const safeHistory = Array.isArray(history) ? history : [];
  const recent = safeHistory[0];

  function formatDateOnly(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
    });
  }

  return (
    <div className="space-y-12">
      {/* ---------------- Header ---------------- */}
      <header className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">
          Crop Health Dashboard
        </h2>
        <p className="text-slate-600 max-w-2xl">
          Scan your crop to detect pests or diseases and review past results.
        </p>
      </header>

      {/* ---------------- Stats ---------------- */}
      <section className="grid grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Last Disease</p>
          <p className="text-2xl font-bold text-emerald-700">
            {recent?.disease || "—"}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-slate-500 mb-2">Confidence</p>

          {recent ? (
            <>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all"
                  style={{
                    width: `${Math.round(recent.confidence * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {Math.round(recent.confidence * 100)}%
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-slate-800">—</p>
          )}
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Last Scan</p>
          <p className="text-base font-semibold text-slate-800">
            {recent?.created_at
              ? formatDateOnly(recent.created_at)
              : "—"}
          </p>
        </div>
      </section>

      {/* ---------------- Upload + Tips ---------------- */}
      <section className="grid grid-cols-3 gap-6">
        {/* Upload */}
        <div className="col-span-2 bg-white border rounded-xl p-8 shadow-sm">
          <label className="block h-full">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onSelectImage(e.target.files[0])}
            />

            <div className="h-full border-2 border-dashed border-slate-300 rounded-xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/40 hover:scale-[1.01]">
              <div className="text-emerald-600 text-3xl mb-4">📸</div>

              <p className="font-semibold text-lg text-slate-800">
                Scan your crop
              </p>

              <p className="text-slate-500 text-sm mt-1">
                Upload or click to select an image
              </p>

              <div className="mt-6 px-6 py-3 rounded-lg bg-emerald-600 text-white text-sm font-semibold shadow hover:bg-emerald-700 transition">
                Start Scan
              </div>

              <p className="text-xs text-slate-400 mt-3">
                JPG or PNG • Clear daylight image recommended
              </p>
            </div>
          </label>
        </div>

        {/* Tips */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">
            Quick Tips
          </h3>
          <ul className="text-slate-600 space-y-3 text-sm leading-relaxed">
            <li>🌤 Use natural daylight</li>
            <li>🍃 Focus on affected leaf area</li>
            <li>📷 Avoid blurry images</li>
          </ul>
        </div>
      </section>

      {/* ---------------- Recent Scans ---------------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">
            Recent Scans
          </h3>
          {safeHistory.length > 5 && (
            <span className="text-sm text-emerald-600 font-medium cursor-pointer">
              View all
            </span>
          )}
        </div>

        {safeHistory.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No scans yet.
          </p>
        ) : (
          <div className="space-y-3">
            {safeHistory.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-lg px-5 py-4 flex items-center justify-between shadow-sm transition hover:bg-slate-50 hover:shadow"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">
                    {item.disease}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.created_at
                      ? formatDateOnly(item.created_at)
                      : "—"}
                  </p>
                </div>

                <span className="text-sm font-semibold text-slate-700">
                  {Math.round(item.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
