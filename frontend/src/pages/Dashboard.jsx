import React from "react";
import { Bell, ShieldAlert, Leaf, History, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = (props) => {
  const navigate = useNavigate();

  // const user = JSON.parse(localStorage.getItem("user"));  
  // const userName = user?.name || "Farmer";

  const summary = {
    riskLevel: "Medium",
    weather: {
      temp: "29°C",
      humidity: "78%",
      rain: "Light",
    },
    alertsCount: 1,
  };

  const alerts = [
    {
      crop: "Cotton",
      issue: "Bollworm",
      risk: "High",
      reason: "High humidity and temperature pattern",
    },
  ];

  const preventions = [
    "Spray neem oil in early morning",
    "Avoid excess irrigation today",
    "Monitor leaves for early signs",
  ];

  const advisories = [
    "High humidity favors fungal diseases",
    "Early prevention reduces crop loss",
    "Regular field monitoring is recommended",
  ];

  return (
    <div className="min-h-screen bg-[#fffbef] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Welcome back, Farmer
          </h1>
          <p className="text-slate-500">
            Crop health overview for today
          </p>
        </div>

        <button className="relative p-2 rounded-full bg-white border border-slate-200">
          <Bell className="text-slate-600" />
          {summary.alertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Analyze CTA */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Analyze your crop using AI
          </h2>
          <p className="text-slate-500 text-sm">
            Upload crop images to detect pests or diseases
          </p>
        </div>

        <button
          onClick={() => navigate("/analyze")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
        >
          <Camera size={18} />
          Analyze Crop
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-sm text-slate-500">Overall Risk</p>
          <h2 className="text-2xl font-semibold text-orange-600">
            {summary.riskLevel}
          </h2>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-sm text-slate-500">Weather</p>
          <p className="font-medium text-slate-700">
            🌡 {summary.weather.temp} | 💧 {summary.weather.humidity}
          </p>
          <p className="text-sm text-slate-500">
            🌧 {summary.weather.rain}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-sm text-slate-500">Active Alerts</p>
          <h2 className="text-2xl font-semibold text-red-600">
            {summary.alertsCount}
          </h2>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="text-orange-500" />
          <h2 className="text-lg font-semibold text-slate-800">
            Risk Alerts
          </h2>
        </div>

        {alerts.map((alert, index) => (
          <div
            key={index}
            className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-3"
          >
            <p className="font-medium text-slate-800">
              ⚠️ {alert.issue} risk for {alert.crop}
            </p>

            <p className="text-sm text-slate-600 mt-1">
              Risk Level:{" "}
              <span className="font-semibold text-orange-700">
                {alert.risk}
              </span>
            </p>

            <p className="text-sm text-slate-500 mt-1">
              {alert.reason}
            </p>
          </div>
        ))}
      </div>

      {/* Preventive Measures */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="text-green-600" />
          <h2 className="text-lg font-semibold text-slate-800">
            Preventive Suggestions
          </h2>
        </div>

        <ul className="list-disc list-inside space-y-1 text-slate-700">
          {preventions.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Advisories */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <History className="text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">
            Advisories
          </h2>
        </div>

        <ul className="space-y-2 text-slate-700">
          {advisories.map((tip, index) => (
            <li key={index}>🌾 {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
