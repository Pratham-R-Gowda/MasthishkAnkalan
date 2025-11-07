// frontend/src/pages/CaretakerDashboard.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Inbox from "./Caretaker/Inbox";
import Tasks from "./Caretaker/Tasks";
import { useAuth } from "../context/AuthContext";
import CaretakerProfile from "./Caretaker/Profile";
import CaretakerSettings from "./Caretaker/Settings";

export default function CaretakerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-white border-r p-6 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <div className="text-xl font-bold">Caretaker</div>
            <div className="text-sm text-gray-500">{user?.name}</div>
          </div>
          <div className="space-y-3">
            <button onClick={()=>navigate("/caretaker/tasks")} className="w-full p-3 rounded hover:bg-gray-100">TASKS TO DO</button>
            <button onClick={()=>navigate("/caretaker/inbox")} className="w-full p-3 rounded hover:bg-gray-100">INBOX</button>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={() => navigate("/caretaker/profile")} className="w-full p-3 rounded flex items-center gap-3 hover:bg-gray-100">
            <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">👤</span>
            <span>Profile</span>
          </button>
          <button onClick={() => navigate("/caretaker/settings")} className="w-full p-3 rounded flex items-center gap-3 hover:bg-gray-100">
            <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<div className="text-2xl">Welcome, {user?.name}</div>} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="profile" element={<CaretakerProfile />} />
          <Route path="settings" element={<CaretakerSettings />} />
        </Routes>
      </main>
    </div>
  );
}
