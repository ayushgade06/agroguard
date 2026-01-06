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
      <div className="h-full flex items-center justify-center text-slate-500">
        Loading map…
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[19.6, 75.7]}
        zoom={7}
        scrollWheelZoom
        className="h-full w-full rounded-xl"
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
              fillOpacity: 0.7,
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{p.city}</strong>
                <br />
                Disease: {p.summary.disease}
                <br />
                Risk: {p.summary.risk}
                <br />
                Confidence: {Math.round(p.summary.confidence * 100)}%
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
