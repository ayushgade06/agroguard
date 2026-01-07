import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getColor(risk) {
  if (risk === "High") return "#d32f2f"; // red
  if (risk === "Medium") return "#f57c00"; // orange
  return "#2e7d32"; // green
}

function FitToPoints({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = points.map((p) => [
      p.coordinates.lat,
      p.coordinates.lon,
    ]);
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [points, map]);
  return null;
}

function AutoResize() {
  const map = useMap();
  useEffect(() => {
    map.whenReady(() => {
      setTimeout(() => map.invalidateSize(), 50);
    });
    const handle = () => map.invalidateSize();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [map]);
  return null;
}

export default function MapView({ location }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRiskMap() {
      try {
        setError("");
        const res = await fetch(`${API_BASE}/risk-map?crop=rice`);
        if (!res.ok) {
          throw new Error(`Server responded ${res.status}`);
        }
        const data = await res.json();
        setPoints(Array.isArray(data.points) ? data.points : []);
      } catch (err) {
        console.error("Failed to load risk map", err);
        setError(
          "Could not load risk map. Check backend/ML service availability."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRiskMap();
  }, []);

  const topHotspot = useMemo(() => {
    if (!points.length) return null;
    const severityOrder = { High: 3, Medium: 2, Low: 1 };
    return [...points].sort(
      (a, b) =>
        (severityOrder[b.summary?.risk] || 0) -
          (severityOrder[a.summary?.risk] || 0) ||
        (b.summary?.confidence || 0) - (a.summary?.confidence || 0)
    )[0];
  }, [points]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 glass-panel rounded-2xl">
        Loading risk map…
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full glass-panel rounded-2xl p-6 flex flex-col gap-3 justify-center text-center text-slate-600">
        <p className="text-lg font-semibold text-slate-800">
          Risk map unavailable
        </p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[620px] w-full glass-panel rounded-3xl overflow-hidden flex flex-col shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/70 bg-white/70 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">
            Geo intelligence
          </p>
          <h2 className="text-xl font-bold text-slate-900">
            Regional Crop Risk Map
          </h2>
          <p className="text-sm text-slate-500">
            Disease risk visualization powered by the ML weather model
          </p>
        </div>

        {topHotspot && (
          <div className="px-4 py-3 rounded-2xl bg-red-50 text-red-700 border border-red-100 shadow-sm">
            <p className="text-xs uppercase tracking-wide font-semibold">
              Highest risk now
            </p>
            <p className="text-sm font-bold">
              {topHotspot.city}: {topHotspot.summary.disease} (
              {topHotspot.summary.risk})
            </p>
            <p className="text-xs">
              Confidence {Math.round(topHotspot.summary.confidence * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <MapContainer
          center={[19.6, 75.7]}
          zoom={7}
          scrollWheelZoom
          className="h-full w-full"
          style={{ minHeight: "600px" }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <AutoResize />
          <FitToPoints points={points} />

          {points.map((p, idx) => (
            <CircleMarker
              key={idx}
              center={[p.coordinates.lat, p.coordinates.lon]}
              radius={12}
              pathOptions={{
                color: getColor(p.summary.risk),
                fillColor: getColor(p.summary.risk),
                fillOpacity: 0.75,
              }}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-slate-800">
                    {p.city}
                  </p>
                  <p>
                    <span className="font-medium">Disease:</span>{" "}
                    {p.summary.disease}
                  </p>
                  <p>
                    <span className="font-medium">Risk:</span>{" "}
                    {p.summary.risk}
                  </p>
                  <p>
                    <span className="font-medium">Confidence:</span>{" "}
                    {Math.round(p.summary.confidence * 100)}%
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-panel rounded-xl px-4 py-3 text-sm">
          <p className="font-semibold text-slate-800 mb-2">
            Risk Levels
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-700" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600" />
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Forecast panel */}
        {topHotspot?.forecast && (
          <div className="absolute bottom-4 right-4 glass-panel rounded-2xl px-4 py-3 text-xs max-w-sm max-h-60 overflow-y-auto space-y-2">
            <p className="font-semibold text-slate-800">
              5-day noon forecast: {topHotspot.city}
            </p>
            {topHotspot.forecast.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1"
              >
                <span className="text-slate-600">{f.date}</span>
                <span className="font-semibold text-slate-800">
                  {f.disease}
                </span>
                <span
                  className={`text-xs font-bold ${
                    f.risk === "High"
                      ? "text-red-600"
                      : f.risk === "Medium"
                      ? "text-orange-500"
                      : "text-emerald-600"
                  }`}
                >
                  {f.risk}
                </span>
                <span className="text-slate-500">
                  {Math.round(f.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
