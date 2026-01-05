import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Check if token exists and is valid format (JWT tokens are long)
    if (!token || token === "undefined" || token === "null" || token.length < 50) {
      console.warn("Invalid or missing token, redirecting to login");
      localStorage.clear(); // Clear all auth data
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return children;
}

