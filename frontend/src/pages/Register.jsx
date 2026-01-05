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

      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-emerald-700">
            AgriGuard
          </h1>
          <p className="text-slate-500 mt-2">
            Create your account
          </p>
        </div>

        {latitude === null && (
          <p className="mb-4 text-xs text-yellow-600 text-center">
            Location access is required for nearby disease alerts
          </p>
        )}

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Full name"
            className="w-full p-3 rounded-lg border border-slate-200"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email address"
            className="w-full p-3 rounded-lg border border-slate-200"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg border border-slate-200"
          />

          <button
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700
              text-white font-medium py-3 rounded-lg transition
              disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-medium">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
