export default function HomeView({ onSelectImage }) {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">
          Crop Health Dashboard
        </h2>
        <p className="text-slate-600">
          Upload a crop image to detect pests or diseases.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-6">
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

        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-bold mb-4">Quick Tips</h3>
          <ul className="text-slate-600 space-y-2 text-sm">
            <li>• Use natural light</li>
            <li>• Focus on affected leaf</li>
            <li>• Avoid blurry images</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
