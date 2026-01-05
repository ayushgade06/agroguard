export default function HomeView({ onSelectImage, history = [] }) {
  const safeHistory = Array.isArray(history) ? history : [];
  const recent = safeHistory[0];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header>
        <h2 className="text-3xl font-bold text-slate-900">
          Crop Health Dashboard
        </h2>
        <p className="text-slate-600">
          Upload a crop image to detect pests or diseases.
        </p>
      </header>

      {/* TOP SUMMARY */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Last Disease</p>
          <p className="text-xl font-bold text-emerald-700">
            {recent?.disease || "—"}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Confidence</p>
          <p className="text-xl font-bold">
            {recent ? `${Math.round(recent.confidence * 100)}%` : "—"}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Last Scan</p>
          <p className="text-sm font-semibold">
            {recent
              ? new Date(recent.created_at).toLocaleString()
              : "—"}
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-3 gap-6">
        {/* UPLOAD */}
        <div className="col-span-2 bg-white border rounded-xl p-6">
          <label>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onSelectImage(e.target.files[0])}
            />
            <div className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-slate-50">
              <p className="font-semibold text-lg">
                Click to upload crop image
              </p>
              <p className="text-slate-500 text-sm mt-1">
                JPG, PNG supported
              </p>
            </div>
          </label>
        </div>

        {/* TIPS */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-bold mb-4">Quick Tips</h3>
          <ul className="text-slate-600 space-y-2 text-sm">
            <li>• Use natural light</li>
            <li>• Focus on affected leaf</li>
            <li>• Avoid blurry images</li>
          </ul>
        </div>
      </div>

      {/* RECENT SCANS */}
      <div>
        <h3 className="font-bold mb-3">Recent Scans</h3>

        {safeHistory.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No scans yet.
          </p>
        ) : (
          <div className="space-y-3">
            {safeHistory.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-lg p-4 flex justify-between"
              >
                <div>
                  <p className="font-semibold">{item.disease}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <span className="text-sm font-medium">
                  {Math.round(item.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
