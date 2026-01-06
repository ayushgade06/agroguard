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
    <div className="space-y-10">
      {/* ---------------- Header ---------------- */}
      <header className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">
          Crop Health Dashboard
        </h2>
        <p className="text-slate-600 max-w-2xl">
          Upload a crop image to detect pests or diseases and track your scan history.
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
          <p className="text-sm text-slate-500 mb-1">Confidence</p>
          <p className="text-2xl font-bold text-slate-800">
            {recent ? `${Math.round(recent.confidence * 100)}%` : "—"}
          </p>
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
        <div className="col-span-2 bg-white border rounded-xl p-8 shadow-sm">
          <label className="block h-full">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onSelectImage(e.target.files[0])}
            />

            <div className="h-full border-2 border-dashed border-slate-300 rounded-xl p-14 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-emerald-400 hover:bg-emerald-50/30">
              <p className="font-semibold text-lg text-slate-800">
                Upload crop image
              </p>
              <p className="text-slate-500 text-sm mt-1">
                JPG or PNG supported
              </p>

              <div className="mt-6 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
                Select Image
              </div>
            </div>
          </label>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">
            Quick Tips
          </h3>
          <ul className="text-slate-600 space-y-2 text-sm leading-relaxed">
            <li>• Use natural daylight</li>
            <li>• Focus on affected leaf area</li>
            <li>• Avoid blurry images</li>
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
            <span className="text-sm text-emerald-600 font-medium">
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
                className="bg-white border rounded-lg px-5 py-4 flex items-center justify-between shadow-sm hover:bg-slate-50 transition"
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
