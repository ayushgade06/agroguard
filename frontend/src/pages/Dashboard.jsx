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

  useEffect(() => {
    const saved = localStorage.getItem("agri_history");
    if (saved) setHistory(JSON.parse(saved));
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
        <Header />

        <div className="flex-1 p-10 overflow-y-auto">
          {view === "home" && <HomeView onSelectImage={handleFileChange} />}

          {view === "scan" && (
            <ScanView
              image={currentImage}
              onBack={() => setView("home")}
              onAnalyze={startAnalysis}
              isAnalyzing={isAnalyzing}
            />
          )}

          {view === "result" && (
            <ResultView
              result={result}
              onDone={() => setView("home")}
            />
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
