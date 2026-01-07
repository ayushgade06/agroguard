import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import ChatWidget from "./components/chatbot/ChatWidget";
// import AnalyzeCrop from "./pages/AnalyzeCrop";

function App() {
  return (
    <>
      {/* ---------- ROUTES ---------- */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* <Route path="/analyze-crop" element={<AnalyzeCrop />} /> */}
      </Routes>

      {/* ---------- GLOBAL CHATBOT ---------- */}
      <ChatWidget />
    </>
  );
}

export default App;
