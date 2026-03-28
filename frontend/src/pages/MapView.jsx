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

          {/* Regional Risk Infrastructure (15 Cities) */}
          {points.map((p, i) => (
            <CircleMarker
              key={`city-${i}`}
              center={[p.coordinates.lat, p.coordinates.lon]}
              radius={8}
              pathOptions={{ 
                  color: getColor(p.summary.risk), 
                  fillColor: getColor(p.summary.risk), 
                  fillOpacity: 0.8,
                  weight: 2
              }}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="font-sans w-64 overflow-hidden rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] ring-1 ring-slate-200">
                   <div style={{ backgroundColor: getColor(p.summary.risk), color: 'white', padding: '12px', textAlign: 'center' }}>
                      <h3 className="m-0 text-base font-black uppercase tracking-tight">{p.city}</h3>
                      <div className="text-[10px] opacity-90 font-bold uppercase tracking-widest mt-1">
                        STATEWIDE RISK: {p.summary.disease}
                      </div>
                   </div>
                   <div className="bg-white p-3">
                      <table className="w-full border-collapse text-[11px] text-center">
                         <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                               <th className="p-1 border-b">Date</th>
                               <th className="p-1 border-b">T</th>
                               <th className="p-1 border-b">H</th>
                               <th className="p-1 border-b">Risk (Conf.)</th>
                            </tr>
                         </thead>
                         <tbody>
                            {(p.forecast || []).map((day, idx) => (
                               <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                  <td className="p-2 font-black text-slate-600 tracking-tighter">{day.date.split("-").slice(1).join("/")}</td>
                                  <td className="p-2 text-slate-800 font-bold">{Math.round(day.temp)}°</td>
                                  <td className="p-2 text-slate-800 font-bold">{day.hum}%</td>
                                  <td className={`p-2 font-black leading-tight ${day.risk === 'High' ? 'text-red-600' : (day.risk === 'Medium' ? 'text-orange-500' : 'text-emerald-600')}`}>
                                    {day.disease.split(" ").slice(-2).join(" ")} <br/>
                                    <span className="text-[9px] text-slate-400 font-normal">({Math.round(day.confidence * 100)}%)</span>
                                  </td>
                                </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* User Location AND GPS Connection (with Distance Overlay) */}
          {userPoint && (
            <>
              <CircleMarker
                center={[userPoint.user_coords.lat, userPoint.user_coords.lon]}
                radius={22}
                pathOptions={{ 
                    color: '#3b82f6', 
                    fillColor: '#3b82f6', 
                    fillOpacity: 0.8,
                    weight: 4
                }}
              >
                <Popup className="custom-popup" autoPan={false}>
                   <div className="p-4 min-w-[220px] bg-white rounded-3xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                        <p className="font-black text-slate-900 uppercase tracking-tight text-base">Your Farm Intelligence</p>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Atmosphere</span>
                            <span className="text-emerald-600 text-xs font-black">{userPoint.summary.risk} RISK</span>
                        </div>
                        <p className="text-xl font-black text-slate-800 leading-none">{userPoint.realTimeState || userPoint.summary.disease}</p>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                           <div className="flex items-center gap-2">
                              <Thermometer size={14} className="text-orange-500" />
                              <span className="text-sm font-black text-slate-700">{Math.round(userPoint.summary.temp)}°C</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Droplets size={14} className="text-blue-500" />
                              <span className="text-sm font-black text-slate-700">{userPoint.summary.hum}%</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Powered by Hybrid Analysis</p>
                      </div>
                   </div>
                </Popup>
              </CircleMarker>
              
              {/* Dotted Connection Line */}
              <Polyline 
                positions={[
                  [userPoint.user_coords.lat, userPoint.user_coords.lon],
                  [userPoint.coordinates.lat, userPoint.coordinates.lon]
                ]}
                pathOptions={{ 
                    color: '#3b82f6', 
                    dashArray: '8, 12',
                    weight: 3,
                    opacity: 0.8
                }}
              />
              
              {/* Mid-point Distance Overlay (Folium DivIcon style) */}
              <CircleMarker
                 center={[
                    (userPoint.user_coords.lat + userPoint.coordinates.lat) / 2,
                    (userPoint.user_coords.lon + userPoint.coordinates.lon) / 2
                 ]}
                 radius={1}
                 pathOptions={{ color: 'transparent', fillColor: 'transparent' }}
              >
                 <Popup className="distance-popup" permanent>
                    <div className="px-3 py-1 bg-white border-2 border-blue-600 text-blue-800 font-black text-[10px] rounded-full shadow-lg">
                        {userPoint.distance_km} KM
                    </div>
                 </Popup>
              </CircleMarker>
            </>
          )}
        </MapContainer>

        {/* Floating Controls (Top Left) */}
        <div className="absolute top-8 left-8 z-[1000] flex flex-col gap-4">
            <button 
                onClick={() => {
                    setHybridResult(null); 
                    setShowHybridModal(true);
                }}
                className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-[0.2em] border border-white/10"
            >
                <Camera size={16} className="text-emerald-400" /> 
                New Hybrid Check
            </button>
        </div>

        {/* Diagnostic Report Overlay (Top Right) */}
        {hybridResult && (
          <div className="absolute top-8 right-8 w-80 bg-white/95 backdrop-blur-[15px] rounded-[2.5rem] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white z-[1000] animate-in slide-in-from-right-8 duration-500">
             <div className="flex items-center justify-between mb-6">
                <div>
                   <p className="text-[10px] uppercase font-black text-emerald-600 tracking-widest mb-1 leading-none">Intelligence Feed</p>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Diagnostic Report</h3>
                </div>
                <button 
                  onClick={() => setHybridResult(null)}
                  className="w-10 h-10 rounded-2xl bg-slate-100/50 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >✕</button>
             </div>

             <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-[1.75rem] border border-slate-100 shadow-sm">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-[0.1em]">Assessment Context</p>
                   <p className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-tight">
                      {hybridResult.visual_diagnosis?.disease || hybridResult.environmental_risk.disease}
                   </p>
                   <div className="flex items-center gap-3 mt-3">
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black ${hybridResult.environmental_risk.risk === 'High' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'}`}>
                            {hybridResult.environmental_risk.risk} RISK
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{hybridResult.location.nearest_city} Station</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center">
                      <p className="text-[9px] uppercase text-emerald-600 font-black mb-1 opacity-60">Humidity</p>
                      <p className="text-base font-black text-emerald-900 tracking-tight">{hybridResult.environmental_risk.hum}%</p>
                   </div>
                   <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center">
                      <p className="text-[9px] uppercase text-emerald-600 font-black mb-1 opacity-60">Barometer</p>
                      <p className="text-base font-black text-emerald-900 tracking-tight">{hybridResult.environmental_risk.pressure} hPa</p>
                   </div>
                </div>

                <button 
                   onClick={() => setShowHybridModal(true)}
                   className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 group"
                >
                   <Camera size={14} className="group-hover:text-emerald-400 transition-colors" /> Full Hybrid Details
                </button>
             </div>
          </div>
        )}

        {/* Risk Index Legend (Bottom Left - Repositioned) */}
        <div className="absolute bottom-10 left-10 z-[1000] bg-white/95 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_10px_50px_rgba(0,0,0,0.2)] border border-white/50 w-[240px]">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-3 text-center">Risk Index</h4>
            
            <div className="space-y-4">
               <div>
                  <div className="flex items-center gap-3">
                     <div className="w-4 h-4 rounded-md bg-[#2E7D32] shadow-sm" />
                     <span className="text-[11px] font-black text-slate-700 uppercase">Stable / Safe</span>
                  </div>
               </div>

               <div className="pt-1">
                  <p className="text-[9px] font-black text-red-600 uppercase mb-2 ml-1 tracking-widest">Late Blight Outbreak</p>
                  <div className="space-y-2.5">
                     <div className="flex items-center gap-3 opacity-90">
                        <div className="w-4 h-4 rounded-md bg-[#8B0000] border border-red-900/10 shadow-sm" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase">Severe (≥85%)</span>
                     </div>
                     <div className="flex items-center gap-3 opacity-80">
                        <div className="w-4 h-4 rounded-md bg-[#D32F2F] border border-red-900/10 shadow-sm" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase">Moderate (≥70%)</span>
                     </div>
                     <div className="flex items-center gap-3 opacity-70">
                        <div className="w-4 h-4 rounded-md bg-[#E57373] border border-red-900/10 shadow-sm" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase">At Risk (&lt;70%)</span>
                     </div>
                  </div>
               </div>

               <div className="pt-1">
                  <p className="text-[9px] font-black text-orange-600 uppercase mb-2 ml-1 tracking-widest">Early Blight Outbreak</p>
                  <div className="space-y-2.5">
                     <div className="flex items-center gap-3 opacity-90">
                        <div className="w-4 h-4 rounded-md bg-[#E65100] border border-orange-900/10 shadow-sm" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase">Severe (≥85%)</span>
                     </div>
                     <div className="flex items-center gap-3 opacity-80">
                        <div className="w-4 h-4 rounded-md bg-[#F57C00] border border-orange-900/10 shadow-sm" />
                        <span className="text-[10px] font-bold text-slate-700 uppercase">Moderate (≥70%)</span>
                     </div>
                  </div>
               </div>
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
