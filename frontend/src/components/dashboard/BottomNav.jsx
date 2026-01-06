import { Home, History, Camera } from "lucide-react";

export default function BottomNav({ active, onHome, onHistory, onScan }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between px-10 py-3">
        {/* Home */}
        <button
          onClick={onHome}
          className={`flex flex-col items-center gap-1 text-sm transition ${
            active === "home"
              ? "text-emerald-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Home size={22} />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* Scan */}
        <label className="relative -mt-8">
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onScan(e.target.files[0])}
          />

          <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg cursor-pointer hover:bg-emerald-700 transition">
            <Camera size={24} className="text-white" />
          </div>
        </label>

        {/* History */}
        <button
          onClick={onHistory}
          className={`flex flex-col items-center gap-1 text-sm transition ${
            active === "history"
              ? "text-emerald-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <History size={22} />
          <span className="text-xs font-medium">History</span>
        </button>
      </div>
    </nav>
  );
}
