import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function getColor(risk) {
  if (risk === "High") return "#d32f2f";     // red
  if (risk === "Medium") return "#f57c00";  // orange
  return "#2e7d32";                         // green
}

export default function MapView({ location }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRiskMap() {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/risk-map?crop=rice"
        );
        const data = await res.json();
        setPoints(data.points || []);
      } catch (err) {
        console.error("Failed to load risk map", err);
      } finally {
        setLoading(false);
      }
    }

    loadRiskMap();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 bg-white border rounded-xl">
        Loading risk map…
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800">
          Regional Crop Risk Map
        </h2>
        <p className="text-sm text-slate-500">
          Disease risk visualization based on weather & historical data
        </p>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <MapContainer
          center={[19.6, 75.7]}
          zoom={7}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {points.map((p, idx) => (
            <CircleMarker
              key={idx}
              center={[p.coordinates.lat, p.coordinates.lon]}
              radius={10}
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
        <div className="absolute bottom-4 left-4 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-md text-sm">
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
      </div>
    </div>
  );
}
