import React, { useState, useEffect } from "react";

import Header from "../components/dashboard/Header";
import HomeView from "../components/dashboard/HomeView";
import ScanView from "../components/dashboard/ScanView";
import ResultView from "../components/dashboard/ResultView";
import HistoryView from "../components/dashboard/HistoryView";
import LogoutButton from "../components/layout/LogoutButton";
import { analyzeCropImage } from "../services/diagnosisService";
import SidebarButton from "../components/layout/SidebarButton";

export default function Dashboard() {
  const [view, setView] = useState("home");
  const [history, setHistory] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [location, setLocation] = useState({
    city: "",
    state: "",
    country: "",
    error: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem("agri_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, error: "Geolocation not supported" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          setLocation({
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "",
            state: data.address.state || "",
            country: data.address.country || "",
            error: null,
          });
        } catch {
          setLocation((prev) => ({ ...prev, error: "Failed to fetch location" }));
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

  const handleFileChange = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentImage(reader.result);
      setView("scan");
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!currentImage) return;
    setIsAnalyzing(true);

    try {
      const diagnosis = await analyzeCropImage(currentImage);
      setResult(diagnosis);

      const newItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        image: currentImage,
        diagnosis,
        location,
      };

      const updated = [newItem, ...history];
      setHistory(updated);
      localStorage.setItem("agri_history", JSON.stringify(updated));

      setView("result");
    } catch {
      alert("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteHistoryItem = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("agri_history", JSON.stringify(updated));
  };

  const lastScan = history[0];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 p-6">
        <h1 className="text-2xl font-black text-emerald-700 mb-10">
          AGRIGUARD
        </h1>

        <nav className="space-y-2">
          <SidebarButton
            label="Home"
            active={view === "home"}
            onClick={() => setView("home")}
          />
          <SidebarButton
            label="Scan Crop"
            active={view === "scan"}
            onClick={() => document.getElementById("scan-input").click()}
          />
          <SidebarButton
            label="History"
            active={view === "history"}
            onClick={() => setView("history")}
          />
        </nav>

        <div className="mt-106 border-t border-slate-200">
          <LogoutButton />
        </div>

        <input
          id="scan-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />
      </aside>

      <main className="flex-1 flex flex-col">
        <Header location={location} />

        <div className="flex-1 p-10 overflow-y-auto">
          {view === "home" && (
            <>
              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-5 rounded-xl border">
                  <p className="text-sm text-slate-500">Last Scan</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {lastScan?.diagnosis?.disease || "—"}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border">
                  <p className="text-sm text-slate-500">Risk Level</p>
                  <p className="text-xl font-bold text-red-600">
                    {lastScan?.diagnosis?.severity || "—"}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border">
                  <p className="text-sm text-slate-500">Last Scanned</p>
                  <p className="text-xl font-semibold">
                    {lastScan?.date || "—"}
                  </p>
                </div>
              </div>

              <HomeView onSelectImage={handleFileChange} />

              {history.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Scans
                  </h3>

                  <div className="space-y-3">
                    {history.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-lg border flex justify-between"
                      >
                        <div>
                          <p className="font-semibold">
                            {item.diagnosis.disease}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.location?.city}, {item.location?.state}
                          </p>
                        </div>

                        <span className="text-sm font-medium text-red-600">
                          {item.diagnosis.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {view === "scan" && (
            <ScanView
              image={currentImage}
              onBack={() => setView("home")}
              onAnalyze={startAnalysis}
              isAnalyzing={isAnalyzing}
            />
          )}

          {view === "result" && (
            <ResultView result={result} onDone={() => setView("home")} />
          )}

          {view === "history" && (
            <HistoryView
              history={history}
              onSelect={(item) => {
                setResult(item.diagnosis);
                setCurrentImage(item.image);
                setView("result");
              }}
              onBack={() => setView("home")}
              onDelete={deleteHistoryItem}
            />
          )}
        </div>
      </main>
    </div>
  );
}
