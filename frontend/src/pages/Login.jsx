import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchProfile, loginUser } from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email.trim(), password);

      localStorage.setItem("token", data.access_token);

      // fetch profile to store farmer name
      try {
        const profile = await fetchProfile(data.access_token);
        if (profile?.name) {
          localStorage.setItem("farmerName", profile.name);
        }
      } catch (profileErr) {
        console.warn("Profile fetch failed", profileErr);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 text-white flex items-center justify-center shadow-lg shadow-emerald-400/40 text-2xl">
            🌱
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              AgroGuard
            </p>
            <h1 className="text-3xl font-black text-slate-900">
              Welcome back
            </h1>
            <p className="text-slate-600">
              Sign in to monitor and protect your crops.
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              placeholder="farmer@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:shadow-lg shadow-emerald-400/30 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
