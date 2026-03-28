import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import { Camera, MapPin, Loader2, Thermometer, Droplets, Sun } from "lucide-react";
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

export default function MapView({ location, crop = "potato", setCrop }) {
  const [points, setPoints] = useState([]);
  const [userPoint, setUserPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
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
        let query = `${API_BASE}/risk-map?crop=potato`;
        if (location?.latitude && location?.longitude) {
          query += `&lat=${location.latitude}&lon=${location.longitude}`;
        }
        
        const res = await fetch(query);
        if (!res.ok) throw new Error("Failed to fetch map data");
        const data = await res.json();
        
        setPoints(data.points || []);
        setUserPoint(data.user_point || null);
        
        // AUTO-DISCOVERY
        if (data.user_point && !hybridResult) {
            runAutoCheck(location);
        }
      } catch (err) {
        console.error("Map fetch error:", err);
        setError("Sync error.");
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
        formData.append("crop", "potato");
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/risk-map/hybrid-diagnosis`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });
        if (res.ok) {
            const data = await res.json();
            setResultEnhanced(data);
        }
    } finally {
        setIsAutoDiscovery(false);
    }
  };

  const setResultEnhanced = (data) => {
      setHybridResult(data);
      // If we got a visual result, move the user point view to that disease
      if (data.visual_diagnosis?.disease) {
          setUserPoint(prev => ({
              ...prev,
              realTimeState: data.visual_diagnosis.disease
          }));
      } else {
          setUserPoint(prev => ({
            ...prev,
            realTimeState: data.environmental_risk.disease
          }));
      }
  };

  const handleHybridCheck = async () => {
    if (!location?.latitude) return;
    setIsHybridAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("lat", location.latitude);
      formData.append("lon", location.longitude);
      formData.append("crop", "potato");
      if (hybridFile) {
        formData.append("image", hybridFile);
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/risk-map/hybrid-diagnosis`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Hybrid analysis failed");
      const data = await res.json();
      setResultEnhanced(data);
      setShowHybridModal(true);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsHybridAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center text-slate-500 glass-panel rounded-3xl">
        <Loader2 className="animate-spin mb-4 text-emerald-500" size={32} /> 
        <p className="font-bold text-slate-700">Connecting to Geo-Intelligence Feed...</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[650px] w-full glass-panel rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white relative">
      
      {/* Map Content */}
      <div className="relative flex-1">
        <MapContainer
          center={[19.6, 75.7]}
          zoom={7}
          className="h-full w-full"
          style={{ minHeight: "650px" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <AutoResize />
          <FitToPoints points={points} userPoint={userPoint} />

          {/* Statewide Network (Maharashtra) */}
          {points.map((p, idx) => (
            <CircleMarker
              key={`city-${idx}`}
              center={[p.coordinates.lat, p.coordinates.lon]}
              radius={7}
              pathOptions={{ 
                  color: getColor(p.summary.risk), 
                  fillColor: getColor(p.summary.risk), 
                  fillOpacity: 0.7,
                  weight: 1
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-1">{p.city}</p>
                  <p className="text-sm font-black text-slate-800 leading-tight mb-2">{p.summary.disease}</p>
                  <div className={`inline-block px-2 py-0.5 rounded text-[9px] font-black ${p.summary.risk === 'High' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      {p.summary.risk} RISK
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* User Location ONLY (per user request) */}
          {userPoint && (
            <div key="user-marker">
              <CircleMarker
                center={[userPoint.user_coords.lat, userPoint.user_coords.lon]}
                radius={20}
                pathOptions={{ 
                    color: getColor(userPoint.summary.risk), 
                    fillColor: getColor(userPoint.summary.risk), 
                    fillOpacity: 0.8,
                    weight: 3
                }}
              >
                <Popup className="custom-popup">
                   <div className="p-3 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                        <p className="font-black text-slate-900 uppercase tracking-tighter text-sm">Real-Time Crop State</p>
                      </div>
                      <p className="text-xl font-black text-slate-800 leading-none mb-1">{userPoint.realTimeState || "Analyzing..."}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{userPoint.summary.risk} Risk Level</p>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                         <div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase">Temperature</p>
                            <p className="text-sm font-black text-slate-700">{userPoint.forecast?.[0]?.temp}°C</p>
                         </div>
                         <div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase">Humidity</p>
                            <p className="text-sm font-black text-slate-700">{userPoint.forecast?.[0]?.hum}%</p>
                         </div>
                      </div>
                   </div>
                </Popup>
              </CircleMarker>
              
              {/* Dotted Line to Station */}
              <Polyline 
                positions={[
                  [userPoint.user_coords.lat, userPoint.user_coords.lon],
                  [userPoint.coordinates.lat, userPoint.coordinates.lon]
                ]}
                pathOptions={{ dashArray: '10, 15', color: '#64748b', weight: 1, opacity: 0.5 }}
              />
            </div>
          )}
        </MapContainer>

        {/* Floating UI Elements (Ensured Z-Index) */}
        
        <div className="absolute top-6 left-6 z-1000 flex items-center gap-3">
            <button 
                onClick={() => {
                    setHybridResult(null); // Clear previous result to show upload screen
                    setShowHybridModal(true);
                }}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2 uppercase tracking-widest"
            >
                <Camera size={14} className="text-emerald-400" /> 
                New Hybrid Check
            </button>
        </div>

        {/* Farm Stats Summary Card (Always Visible if ready) */}
        {hybridResult && (
          <div className="absolute top-6 right-6 w-80 glass-panel rounded-3xl p-6 shadow-2xl border border-white/50 z-1001 animate-in slide-in-from-top-4 duration-300">
             <div className="flex items-center justify-between mb-4">
               <div>
                  <p className="text-[10px] uppercase font-black text-emerald-600 tracking-widest">Live Farm Intelligence</p>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">Crop Integrity Report</h3>
               </div>
               <button 
                 onClick={() => setHybridResult(null)}
                 className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
               >✕</button>
             </div>

             <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Detected Prediction</p>
                   <p className="text-lg font-black text-slate-800 uppercase tracking-tight">
                      {hybridResult.visual_diagnosis?.disease || hybridResult.environmental_risk.disease}
                   </p>
                   <div className="flex items-center gap-2 mt-2">
                       <div className={`px-2 py-0.5 rounded text-[10px] font-black ${hybridResult.environmental_risk.risk === 'High' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                           {hybridResult.environmental_risk.risk} RISK
                       </div>
                       <span className="text-[10px] text-slate-400 font-bold uppercase">{hybridResult.location.nearest_city} Station</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                      <p className="text-[10px] uppercase text-emerald-700 font-bold mb-1">Humidity</p>
                      <p className="text-sm font-black text-emerald-800">{hybridResult.environmental_risk.hum}%</p>
                   </div>
                   <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                      <p className="text-[10px] uppercase text-emerald-700 font-bold mb-1">Pressure</p>
                      <p className="text-sm font-black text-emerald-800">{hybridResult.environmental_risk.pressure} hPa</p>
                   </div>
                </div>

                <button 
                   onClick={() => setShowHybridModal(true)}
                   className="w-full py-4 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-[11px] font-black hover:opacity-90 transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                >
                   <Camera size={14} /> Full Advisory Details
                </button>
             </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-6 left-6 glass-panel rounded-2xl p-4 shadow-xl border border-white/80 z-1000">
           <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-3 underline decoration-emerald-400 underline-offset-4">Risk Legend</p>
           <div className="flex flex-col gap-2">
              {[
                { l: "High Threat", c: "bg-red-600" },
                { l: "Medium Threat", c: "bg-orange-500" },
                { l: "Stable/Ideal", c: "bg-green-700" }
              ].map((lvl, i) => (
                <div key={i} className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-sm ${lvl.c} shadow-sm`}></div>
                   <span className="text-[10px] font-bold text-slate-700 uppercase">{lvl.l}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Hybrid Diagnosis Modal (Z-INDEX 20000) */}
      {showHybridModal && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(0,0,0,0.3)] border border-slate-200 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                        <Camera size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">POTATO Scan</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Hybrid Vision + Weather Analytics</p>
                    </div>
                </div>
                <button onClick={() => setShowHybridModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-light">✕</button>
             </div>

             {!hybridResult || isHybridAnalyzing ? (
               <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                     <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                        <Camera size={32} />
                     </div>
                     <p className="text-sm font-bold text-slate-600 mb-6">Enhance detection with a live leaf image</p>
                     <input 
                        type="file" 
                        id="hybrid-upload" 
                        className="hidden" 
                        onChange={(e) => setHybridFile(e.target.files[0])}
                     />
                     <label 
                        htmlFor="hybrid-upload"
                        className="inline-flex px-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black cursor-pointer hover:bg-slate-50 shadow-sm transition-all"
                     >
                        {hybridFile ? hybridFile.name : "Select Image Asset"}
                     </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">FARM LATITUDE</p>
                        <p className="text-sm font-black text-slate-700">{location?.latitude?.toFixed(4)}</p>
                     </div>
                     <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">FARM LONGITUDE</p>
                        <p className="text-sm font-black text-slate-700">{location?.longitude?.toFixed(4)}</p>
                     </div>
                  </div>

                  <button 
                    disabled={isHybridAnalyzing || !location?.latitude}
                    onClick={handleHybridCheck}
                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-sm"
                  >
                    {isHybridAnalyzing ? <Loader2 className="animate-spin" /> : "GENERATE INTELLIGENCE REPORT"}
                  </button>
               </div>
             ) : (
               <div className="space-y-6">
                  <div className="bg-emerald-50 p-6 rounded-3xl">
                     <p className="text-[10px] uppercase font-bold text-emerald-700 mb-2 tracking-widest">Diagnosis Overview</p>
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-2xl font-black text-slate-900">{hybridResult.location.nearest_city}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Monitoring Region</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm ${hybridResult.environmental_risk.risk === 'High' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                           {hybridResult.environmental_risk.risk} RISK
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                           <Thermometer size={14} />
                           <span className="text-[10px] font-black uppercase">ENVIRONMENT</span>
                        </div>
                        <p className="text-sm font-black text-slate-800 leading-tight mb-1">{hybridResult.environmental_risk.disease}</p>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${hybridResult.environmental_risk.confidence * 100}%` }}></div>
                        </div>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                           <Camera size={14} />
                           <span className="text-[10px] font-black uppercase">VISUAL SCAN</span>
                        </div>
                        <p className="text-sm font-black text-slate-800 leading-tight mb-1">{hybridResult.visual_diagnosis?.disease || "Not Provided"}</p>
                        {hybridResult.visual_diagnosis && (
                             <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full" style={{ width: `${hybridResult.visual_diagnosis.confidence * 100}%` }}></div>
                            </div>
                        )}
                     </div>
                  </div>

                  <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100 flex items-start gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-200">
                        <Sun size={24} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-amber-900 mb-1 uppercase tracking-widest">Expert Advisory</p>
                        <p className="text-xs text-amber-800/80 leading-relaxed font-bold">
                           {hybridResult.visual_diagnosis?.disease === hybridResult.environmental_risk.disease 
                             ? "Physical symptoms match weather data - Take immediate action." 
                             : "Condition favors outbreak. Monitor for symptoms daily."}
                        </p>
                     </div>
                  </div>
                  
                  <div className="flex gap-3">
                      <button 
                         onClick={() => setHybridResult(null)}
                         className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black hover:bg-emerald-700 transition-colors uppercase tracking-widest"
                      >
                         New Vision Scan
                      </button>
                      <button 
                         onClick={() => setShowHybridModal(false)}
                         className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-200 transition-colors uppercase tracking-widest"
                      >
                         CLOSE
                      </button>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
