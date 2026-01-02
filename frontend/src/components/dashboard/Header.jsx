import { Leaf, Info, MapPin } from "lucide-react";

export default function Header({ location }) {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-2">
        <Leaf className="text-green-600" />
        <span className="font-black">AGRIGUARD</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-600">
        {location?.error ? (
          <span className="flex items-center gap-1 text-red-500">
            <MapPin size={14} />
            Location unavailable
          </span>
        ) : location?.city ? (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {location.city}, {location.state}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            Detecting location…
          </span>
        )}

        <Info className="cursor-pointer" />
      </div>
    </header>
  );
}
