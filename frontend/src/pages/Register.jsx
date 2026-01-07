import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { motion } from "framer-motion";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Auto-detect location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      () => {
        console.warn("Location permission denied");
      }
    );
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await registerUser(
        name.trim(),
        email.trim(),
        password,
        latitude,
        longitude
      );

      // store name for next login screen
      localStorage.setItem("farmerName", name.trim());
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass-panel rounded-3xl p-8 lg:p-10 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 text-white flex items-center justify-center shadow-lg shadow-emerald-400/40 text-2xl">
              🌿
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                AgriGuard
              </p>
              <h1 className="text-3xl font-black text-slate-900">
                Create your account
              </h1>
              <p className="text-slate-600">
                Start monitoring and protecting your crops today.
              </p>
            </div>
          </div>

          {latitude === null && (
            <p className="mb-4 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
              Allow location to receive nearby disease alerts.
            </p>
          )}

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Full name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Farmers name"
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="farmer@domain.com"
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:shadow-lg shadow-emerald-400/30 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 font-semibold">
              Login
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          className="hidden lg:flex flex-col gap-4 glass-panel rounded-3xl p-10 shadow-xl"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
            What you get
          </p>
          <h2 className="text-3xl font-black text-slate-900">
            Smarter farming from day one
          </h2>
          <ul className="space-y-3 text-slate-700">
            <li>✅ Scan leaves to detect diseases instantly</li>
            <li>✅ Risk map based on your detected location</li>
            <li>✅ Actionable steps in your preferred language</li>
            <li>✅ History log to track progress over time</li>
          </ul>
          <div className="mt-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wide">
              Stay ahead
            </p>
            <p className="text-lg font-bold mt-2">
              Turn on notifications to never miss a critical alert.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
