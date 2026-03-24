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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 text-white flex items-center justify-center shadow-lg shadow-emerald-400/40 text-2xl">
            🌿
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              AgroGuard
            </p>
            <h1 className="text-3xl font-black text-slate-900">
              Create your account
            </h1>
            <p className="text-slate-600">
              Start protecting your crops today.
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
              placeholder="Farmer's name"
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
    </div>
  );
};

export default Register;
