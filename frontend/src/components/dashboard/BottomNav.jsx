import { Home, History, Camera } from "lucide-react";

export default function BottomNav({ active, onHome, onHistory, onScan }) {
  return (
    <nav className="fixed bottom-0 w-full flex justify-around p-4 border-t bg-white">
      <button onClick={onHome}>
        <Home />
      </button>

      <label>
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onScan(e.target.files[0])}
        />
        <Camera className="text-green-600" />
      </label>

      <button onClick={onHistory}>
        <History />
      </button>
    </nav>
  );
}
