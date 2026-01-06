import React, { useState, useEffect } from "react";

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

export default function Dashboard() {
  const [view, setView] = useState("home");
  const [currentImage, setCurrentImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
    loadHistory();
  }, []);

  async function loadHistory() {
    const token = localStorage.getItem("token");
    if (!token) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const data = await fetchHistory();
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
        location.longitude
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

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r px-6 py-8 flex flex-col">
        <h1 className="text-2xl font-extrabold tracking-wide text-emerald-700 mb-12">
          AGRIGUARD
        </h1>

        <nav className="space-y-1 flex-1">
          <SidebarButton
            label="Home"
            active={view === "home"}
            onClick={() => setView("home")}
          />

          <SidebarButton
            label="Map"
            active={view === "map"}
            onClick={() => setView("map")}
          />

          <SidebarButton
            label="Scan Crop"
            active={view === "scan"}
            disabled={!locationReady}
            onClick={() =>
              locationReady &&
              document.getElementById("scan-input").click()
            }
          />

          <SidebarButton
            label="History"
            active={view === "history"}
            onClick={() => setView("history")}
          />
        </nav>

        <div className="pt-6 border-t">
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
        <Header location={location} />

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {view === "home" && (
            <HomeView
              onSelectImage={handleFileChange}
              history={history}
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
      </main>
    </div>
  );
}
