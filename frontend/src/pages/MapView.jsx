import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import { Camera, MapPin, Loader2, Thermometer, Droplets } from "lucide-react";
import "leaflet/dist/leaflet.css";

const API_BASE = "http://127.0.0.1:8000";

function getColor(risk) {
  if (risk === "High") return "#d32f2f"; // red
  if (risk === "Medium") return "#f57c00"; // orange
  return "#2e7d32"; // green
}

function FitToPoints({ points, userPoint }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length && !userPoint) return;
    const allCoords = points.map((p) => [
      p.coordinates.lat,
      p.coordinates.lon,
    ]);
    if (userPoint) {
      allCoords.push([userPoint.user_coords.lat, userPoint.user_coords.lon]);
    }
    if (allCoords.length > 0) {
      map.fitBounds(allCoords, { padding: [60, 60] });
    }
  }, [points, userPoint, map]);
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
  const [userPoint, setUserPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [crop, setCrop] = useState("potato");
  
  // Hybrid Diagnosis State
  const [showHybridModal, setShowHybridModal] = useState(false);
  const [hybridFile, setHybridFile] = useState(null);
  const [hybridResult, setHybridResult] = useState(null);
  const [isHybridAnalyzing, setIsHybridAnalyzing] = useState(false);
  const [isAutoDiscovery, setIsAutoDiscovery] = useState(false);

  useEffect(() => {
    async function loadRiskMap() {
      try {
        setLoading(true);
        setError("");
        let query = `${API_BASE}/risk-map?crop=${crop}`;
        if (location?.latitude && location?.longitude) {
          query += `&lat=${location.latitude}&lon=${location.longitude}`;
        }
        
        const res = await fetch(query);
        if (!res.ok) throw new Error("Failed to fetch map data");
        const data = await res.json();
        
        setPoints(data.points || []);
        setUserPoint(data.user_point || null);
        
        // AUTO-DISCOVERY: If user point exists, auto-run diagnostic for it!
        if (data.user_point && !hybridResult) {
            runAutoCheck(location);
        }
      } catch (err) {
        console.error("Map fetch error:", err);
        setError("Unable to sync with geo-intelligence server.");
      } finally {
        setLoading(false);
      }
    }

    loadRiskMap();
  }, [location, crop]);

  const runAutoCheck = async (loc) => {
    setIsAutoDiscovery(true);
    try {
        const formData = new FormData();
        formData.append("lat", loc.latitude);
        formData.append("lon", loc.longitude);
        const res = await fetch(`${API_BASE}/risk-map/hybrid-diagnosis`, {
            method: "POST",
            body: formData,
        });
        if (res.ok) {
            const data = await res.json();
            setHybridResult(data);
        }
    } finally {
        setIsAutoDiscovery(false);
    }
  };

  const handleHybridCheck = async () => {
    if (!location?.latitude) return;
    setIsHybridAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("lat", location.latitude);
      formData.append("lon", location.longitude);
      if (hybridFile) {
        formData.append("image", hybridFile);
      }

      const res = await fetch(`${API_BASE}/risk-map/hybrid-diagnosis`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Hybrid analysis failed");
      const data = await res.json();
      setHybridResult(data);
    } catch (err) {
      alert("Error during hybrid diagnosis: " + err.message);
    } finally {
      setIsHybridAnalyzing(false);
    }
  };

  const topHotspot = useMemo(() => {
    if (!points.length) return null;
    return [...points].sort(
      (a, b) => (b.summary?.confidence || 0) - (a.summary?.confidence || 0)
    )[0];
  }, [points]);

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center text-slate-500 glass-panel rounded-2xl animate-pulse">
        <Loader2 className="animate-spin mr-2" /> Syncing satellite data...
      </div>
    );
  }

  return (
    <div className="h-full min-h-[620px] w-full glass-panel rounded-3xl overflow-hidden flex flex-col shadow-xl border border-white/50">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200/50 bg-white/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[.3em] font-black text-emerald-600/70">Maharashtra Region</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hybrid Potato Risk Map</h2>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <p className="text-xs text-slate-500 font-medium italic">Live weather-ML hybrid feed active</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
           <button 
             onClick={() => setShowHybridModal(true)}
             className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
           >
             <Camera size={14} /> 
             LOCAL HYBRID CHECK
           </button>
        </div>
      </div>

      {/* Map Content */}
      <div className="relative flex-1">
        <MapContainer
          center={[19.6, 75.7]}
          zoom={7}
          className="h-full w-full"
          style={{ minHeight: "600px" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <AutoResize />
          <FitToPoints points={points} userPoint={userPoint} />

          {/* User Location */}
          {userPoint && (
            <>
              <CircleMarker
                center={[userPoint.user_coords.lat, userPoint.user_coords.lon]}
                radius={14}
                pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.9 }}
              >
                <Popup className="custom-popup">
                   <div className="p-1">
                      <p className="font-bold text-blue-700">Your Managed Farm</p>
                      <p className="text-xs text-slate-500">Nearest: {userPoint.nearest_station}</p>
                      <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
                         <div className="bg-slate-50 p-1 rounded">Temp: {userPoint.forecast?.[0]?.temp || "N/A"}°C</div>
                         <div className="bg-slate-50 p-1 rounded">Hum: {userPoint.forecast?.[0]?.hum || "N/A"}%</div>
                      </div>
                   </div>
                </Popup>
              </CircleMarker>
              
              {/* Dotted Line */}
              <Polyline 
                positions={[
                  [userPoint.user_coords.lat, userPoint.user_coords.lon],
                  [userPoint.coordinates.lat, userPoint.coordinates.lon]
                ]}
                pathOptions={{ dashArray: '5, 10', color: '#3b82f6', weight: 2 }}
              />
            </>
          )}

          {/* City Points */}
          {points.map((p, idx) => (
            <CircleMarker
              key={idx}
              center={[p.coordinates.lat, p.coordinates.lon]}
              radius={10}
              pathOptions={{
                color: getColor(p.summary.risk),
                fillColor: getColor(p.summary.risk),
                fillOpacity: 0.6,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-black text-slate-900 border-b pb-1 mb-2 uppercase tracking-wide">{p.city}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between gap-4">
                       <span className="text-slate-400">Risk Level</span>
                       <span className="font-bold" style={{ color: getColor(p.summary.risk) }}>{p.summary.risk}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                       <span className="text-slate-400">Target Disease</span>
                       <span className="font-medium text-slate-700">{p.summary.disease}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                       <span className="text-slate-400">Confidence</span>
                       <span className="text-slate-900">{Math.round(p.summary.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-6 left-6 glass-panel rounded-2xl p-4 shadow-2xl border border-white/80 z-1000 min-w-[140px]">
           <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 underline decoration-emerald-400 underline-offset-4">ML Risk Index</p>
           <div className="space-y-2">
              {[
                { l: "High Risk", c: "bg-red-600" },
                { l: "Medium Risk", c: "bg-orange-500" },
                { l: "Low/Safe", c: "bg-green-700" },
                { l: "Your Farm", c: "bg-blue-600" }
              ].map((lvl, i) => (
                <div key={i} className="flex items-center gap-3">
                   <div className={`w-3.5 h-3.5 rounded-full ${lvl.c} shadow-sm border border-white`}></div>
                   <span className="text-[11px] font-bold text-slate-700">{lvl.l}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Floating Live Local Risk Card */}
        {hybridResult && (
          <div className="absolute top-6 right-6 w-80 glass-panel rounded-3xl p-5 shadow-2xl border border-white/50 z-1000 animate-in fade-in slide-in-from-right-10 duration-500">
             <div className="flex items-center justify-between mb-4">
               <div>
                  <p className="text-[10px] uppercase font-black text-emerald-600 tracking-widest">Localized Threat</p>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">Your Farm Insights</h3>
               </div>
               <div className={`w-3 h-3 rounded-full animate-pulse ${hybridResult.environmental_risk.risk === 'High' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
                         <Thermometer size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Environment</span>
                   </div>
                   <span className={`text-sm font-black ${hybridResult.environmental_risk.risk === 'High' ? 'text-red-600' : 'text-emerald-700'}`}>
                      {hybridResult.environmental_risk.risk} Risk
                   </span>
                </div>

                <p className="text-xs text-slate-500 font-medium italic mb-2 leading-relaxed">
                   Atmospheric metrics at {hybridResult.location.nearest_city} station suggest high {hybridResult.environmental_risk.disease} favorability.
                </p>

                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                      <p className="text-[10px] uppercase text-emerald-700 font-bold mb-1 tracking-wider">Metrics</p>
                      <p className="text-sm font-black text-emerald-800">
                        {hybridResult.environmental_risk.temp}°C / {hybridResult.environmental_risk.hum}%
                      </p>
                   </div>
                   <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                      <p className="text-[10px] uppercase text-emerald-700 font-bold mb-1 tracking-wider">Proximity</p>
                      <p className="text-sm font-black text-emerald-800">{hybridResult.location.distance_km} KM</p>
                   </div>
                </div>

                <button 
                   onClick={() => setShowHybridModal(true)}
                   className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-[11px] font-black hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                >
                   <Camera size={14} /> Full Diagnostic Report
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Hybrid Diagnosis Modal */}
      {showHybridModal && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                   <Camera className="text-emerald-500" /> Hybrid Local Scan
                </h3>
                <button onClick={() => {setShowHybridModal(false); setHybridResult(null);}} className="text-slate-400 hover:text-slate-600">✕</button>
             </div>

             {!hybridResult ? (
               <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 text-center">
                     <p className="text-sm text-slate-600 mb-4">Enhance current location risk with a leaf image</p>
                     <input 
                        type="file" 
                        id="hybrid-upload" 
                        className="hidden" 
                        onChange={(e) => setHybridFile(e.target.files[0])}
                     />
                     <label 
                        htmlFor="hybrid-upload"
                        className="inline-block px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold cursor-pointer hover:bg-slate-50 shadow-sm"
                     >
                        {hybridFile ? hybridFile.name : "Select Image (Optional)"}
                     </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                     <div className="flex items-center gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                        <MapPin size={14} className="text-emerald-500" />
                        Lat: {location?.latitude?.toFixed(4)}
                     </div>
                     <div className="flex items-center gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                        <MapPin size={14} className="text-emerald-500" />
                        Lon: {location?.longitude?.toFixed(4)}
                     </div>
                  </div>

                  <button 
                    disabled={isHybridAnalyzing || !location?.latitude}
                    onClick={handleHybridCheck}
                    className="w-full py-4 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isHybridAnalyzing ? <Loader2 className="animate-spin" /> : "GENERATE HYBRID REPORT"}
                  </button>
               </div>
             ) : (
               <div className="space-y-5">
                  <div className="bg-emerald-50 p-4 rounded-2xl">
                     <p className="text-xs uppercase font-bold text-emerald-700 mb-2 tracking-widest">Consolidated Diagnosis</p>
                     <div className="flex justify-between items-center">
                        <div>
                           <p className="text-lg font-black text-slate-900">{hybridResult.location.nearest_city} Area</p>
                           <p className="text-xs text-slate-500 italic">{hybridResult.location.distance_km}km from station</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-xs font-black ${hybridResult.environmental_risk.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                           RISK: {hybridResult.environmental_risk.risk}
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                           <Thermometer size={14} />
                           <span className="text-[10px] font-bold">WEATHER STATUS</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{hybridResult.environmental_risk.disease}</p>
                        <p className="text-[10px] text-slate-500">{Math.round(hybridResult.environmental_risk.confidence * 100)}% Conf.</p>
                     </div>
                     <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                           <Camera size={14} />
                           <span className="text-[10px] font-bold">VISUAL SCAN</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{hybridResult.visual_diagnosis?.disease || "Not Provided"}</p>
                        {hybridResult.visual_diagnosis && (
                           <p className="text-[10px] text-slate-500">{Math.round(hybridResult.visual_diagnosis.confidence * 100)}% Conf.</p>
                        )}
                     </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-200">
                        <Thermometer size={20} />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-amber-900 mb-0.5 uppercase tracking-wide">Farmer Advisory</p>
                        <p className="text-[11px] text-amber-800/80 leading-relaxed uppercase font-medium">
                           The hybrid model suggests {hybridResult.environmental_risk.risk} environmental risk level. 
                           {hybridResult.visual_diagnosis?.disease === hybridResult.environmental_risk.disease 
                             ? " Physical symptoms match weather data - take immediate action." 
                             : " Environmental conditions favor disease outbreak even if symptoms are low."}
                        </p>
                     </div>
                  </div>
                  
                  <button 
                     onClick={() => {setShowHybridModal(false); setHybridResult(null);}}
                     className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                     CLOSE REPORT
                  </button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
