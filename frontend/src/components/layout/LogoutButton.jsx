import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Redirect to login
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-4 py-3 rounded-lg font-semibold 
        text-red-600 hover:bg-red-50 transition-colors"
    >
      Logout
    </button>
  );
}
