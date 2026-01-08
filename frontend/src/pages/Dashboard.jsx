import React, { useState, useEffect } from "react";
import {
  Leaf,
  Home,
  Map,
  ScanLine,
  History,
  Sun,
} from "lucide-react";

import Header from "../components/dashboard/Header";
import ScanView from "../components/dashboard/ScanView";
import ResultView from "../components/dashboard/ResultView";
import HistoryView from "../components/dashboard/HistoryView";
import LogoutButton from "../components/layout/LogoutButton";
import SidebarButton from "../components/layout/SidebarButton";
import HomeView from "../components/dashboard/HomeView";
import MapView from "../pages/MapView";
import { analyzeCropImage } from "../services/diagnosisService";
import {
  fetchHistory,
  deleteHistoryItem,
} from "../services/historyService";
import { fetchProfile } from "../api/auth";

export default function Dashboard() {
  const [view, setView] = useState("home");
  const [currentImage, setCurrentImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [farmerName, setFarmerName] = useState(
    localStorage.getItem("farmerName") || ""
  );
  const [crop, setCrop] = useState("rice");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [location, setLocation] = useState({
    city: "Detecting…",
    state: "",
    country: "",
    latitude: null,
    longitude: null,
    error: null,
  });

  /* ---------------- Location ---------------- */
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: "Geolocation not supported",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        setLocation((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();

          setLocation((prev) => ({
            ...prev,
            city:
              data.city ||
              data.locality ||
              data.principalSubdivision ||
              "Unknown",
            state: data.principalSubdivision || "",
            country: data.countryName || "",
          }));
        } catch {
          setLocation((prev) => ({
            ...prev,
            city: "Location unavailable",
          }));
        }
      },
      () => {
        setLocation((prev) => ({
          ...prev,
          error: "Location permission denied",
        }));
      }
    );
  }, []);

  /* ---------------- History ---------------- */
  useEffect(() => {
    loadHistory(severityFilter);
  }, [severityFilter]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // if we already have a cached name, skip fetch
    if (farmerName) return;

    fetchProfile(token)
      .then((profile) => {
        if (profile?.name) {
          setFarmerName(profile.name);
          localStorage.setItem("farmerName", profile.name);
        }
      })
      .catch((err) => {
        console.warn("Could not load farmer profile", err);
      });
  }, [farmerName]);

  async function loadHistory(filter = "All") {
    const token = localStorage.getItem("token");
    if (!token) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const data = await fetchHistory(filter);
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete record");
    }
  };

  /* ---------------- Scan ---------------- */
  const handleFileChange = (file) => {
    if (!file) return;

    if (currentImage?.preview) {
      URL.revokeObjectURL(currentImage.preview);
    }

    setCurrentImage({
      file,
      preview: URL.createObjectURL(file),
    });

    setView("scan");
  };

  const startAnalysis = async () => {
    if (!currentImage?.file) return;

    if (!location.latitude || !location.longitude) {
      alert("Location not ready yet. Please wait.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const diagnosis = await analyzeCropImage(
        currentImage.file,
        location.latitude,
        location.longitude,
        crop
      );

      setResult(diagnosis);
      await loadHistory();
      setView("result");
    } catch (err) {
      console.error(err);

      if (
        err.message?.includes("session") ||
        err.message?.includes("login")
      ) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      alert("Detection failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const locationReady =
    location.latitude && location.longitude && !location.error;

  /* ---------------- UI ---------------- */
  const navItems = [
    { key: "home", label: "Home", icon: <Home size={18} /> },
    { key: "map", label: "Risk Map", icon: <Map size={18} /> },
    {
      key: "scan",
      label: "Scan",
      icon: <ScanLine size={18} />,
      disabled: !locationReady,
    },
    { key: "history", label: "History", icon: <History size={18} /> },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-emerald-50/40 to-white">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 px-6 py-8 flex flex-col gap-6 border-r border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
            <Leaf size={22} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              AgroGuard
            </p>
            <h1 className="text-xl font-black text-slate-900">
              Crop AI Control
            </h1>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-50 text-amber-700 flex items-center justify-center shadow-inner">
            <Sun size={18} />
          </div>
          <div className="text-sm text-slate-700">
            <p className="font-semibold">Live weather-aware risk</p>
            <p className="text-slate-500 text-xs">
              Location powered insights
            </p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <SidebarButton
              key={item.key}
              label={item.label}
              active={view === item.key}
              disabled={item.disabled}
              onClick={() => {
                if (item.key === "scan") {
                  item.disabled ||
                    document.getElementById("scan-input").click();
                } else {
                  setView(item.key);
                }
              }}
              icon={item.icon}
            />
          ))}
        </nav>

        <div className="pt-2">
          <LogoutButton />
        </div>

        <input
          id="scan-input"
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header location={location} farmerName={farmerName} />

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {view === "home" && (
              <HomeView
                onSelectImage={handleFileChange}
                history={history}
                crop={crop}
                setCrop={setCrop}
              />
            )}

            {view === "map" && (
              <div className="h-full">
                <MapView location={location} />
              </div>
            )}

            {view === "scan" && currentImage && (
              <ScanView
                image={currentImage}
                onBack={() => setView("home")}
                onAnalyze={startAnalysis}
                isAnalyzing={isAnalyzing}
                crop={crop}
                setCrop={setCrop}
              />
            )}

            {view === "result" && result && (
              <ResultView
                result={result}
                onDone={() => {
                  setView("home");
                  setCurrentImage(null);
                }}
              />
            )}

            {view === "history" && (
              <HistoryView
                history={history}
                loading={historyLoading}
                severityFilter={severityFilter}
                setSeverityFilter={setSeverityFilter}
                onSelect={(item) => {
                  setResult({
                    disease: item.disease,
                    confidence: item.confidence,
                    severity: item.severity,
                    explanation:
                      item.explanation ||
                      `The model detected ${item.disease} with ${(item.confidence * 100).toFixed(2)}% confidence.`,
                    immediateActions:
                      item.immediate_actions || [
                        "Isolate affected crops",
                        "Avoid overhead irrigation",
                        "Consult local agriculture officer",
                      ],
                  });

                  setView("result");
                }}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
