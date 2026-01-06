import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="
        w-full
        flex items-center gap-2
        px-4 py-3
        rounded-xl
        text-sm font-semibold
        text-red-600
        transition
        hover:bg-red-50
      "
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
