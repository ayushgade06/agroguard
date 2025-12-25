import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

const Login = () => {
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

      // store token
      localStorage.setItem("token", data.access_token);

      // redirect
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#fffbef]">
      <div className="p-6 rounded w-1/3 bg-white shadow">
        <h1 className="mb-8 text-center text-2xl font-bold">
          Login to AgroGuard
        </h1>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <form onSubmit={submitHandler}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded border focus:outline-none focus:ring-2 focus:ring-green-200"
            type="email"
            placeholder="Email"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-3 rounded border focus:outline-none focus:ring-2 focus:ring-green-200"
            type="password"
            placeholder="Password"
          />

          <button
            disabled={loading}
            className="w-full mt-4 bg-green-500 text-white p-2 rounded disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <Link to="/register" className="block mt-4 text-center">
          Don’t have an account?{" "}
          <span className="text-green-600 font-medium">Register</span>
        </Link>
      </div>
    </div>
  );
};

export default Login;
