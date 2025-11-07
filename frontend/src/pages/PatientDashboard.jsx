// frontend/src/pages/PatientDashboard.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Tests from "./Patient/Tests";
import Inbox from "./Patient/Inbox";
import TestHistory from "./Patient/TestHistory";
import Tasks from "./Patient/Tasks";
import Settings from "./Patient/Settings";
import PatientProfile from "./Patient/Profile";


export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-72 bg-white border-r p-6 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <div className="text-xl font-bold">Patient</div>
            <div className="text-sm text-gray-500">{user?.name}</div>
          </div>

          <nav className="space-y-3">
            <button onClick={() => navigate("/patient/tests")} className="w-full text-left p-3 rounded hover:bg-gray-100">TEST</button>
            <button onClick={() => navigate("/patient/inbox")} className="w-full text-left p-3 rounded hover:bg-gray-100">INBOX</button>
            <button onClick={() => navigate("/patient/history")} className="w-full text-left p-3 rounded hover:bg-gray-100">TEST HISTORY</button>
            <button onClick={() => navigate("/patient/tasks")} className="w-full text-left p-3 rounded hover:bg-gray-100">TASKS TO DO</button>
          </nav>
        </div>

        <div className="space-y-2">
          <button onClick={() => navigate("/patient/profile")} className="w-full p-3 rounded flex items-center gap-3 hover:bg-gray-100">
            <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">👤</span>
            <span>Profile</span>
          </button>
          <button onClick={() => navigate("/patient/settings")} className="w-full p-3 rounded flex items-center gap-3 hover:bg-gray-100">
            <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<div className="text-2xl">Welcome, {user?.name || "Patient"}</div>} />
          <Route path="tests" element={<Tests />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="history" element={<TestHistory />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="settings" element={<Settings/>} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}
