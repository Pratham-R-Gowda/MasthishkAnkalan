// frontend/src/pages/CaretakerDashboard.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Inbox from "./Caretaker/Inbox";
import Tasks from "./Caretaker/Tasks";
import { useAuth } from "../context/AuthContext";

export default function CaretakerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-white border-r p-6">
        <div className="mb-6">
          <div className="text-xl font-bold">Caretaker</div>
          <div className="text-sm text-gray-500">{user?.name}</div>
        </div>
        <div className="space-y-3">
          <button onClick={()=>navigate("/caretaker/tasks")} className="w-full p-3 rounded hover:bg-gray-100">TEST HISTORY</button>
          <button onClick={()=>navigate("/caretaker/inbox")} className="w-full p-3 rounded hover:bg-gray-100">INBOX</button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<div className="text-2xl">Welcome, {user?.name}</div>} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="tasks" element={<Tasks />} />
        </Routes>
      </main>
    </div>
  );
}
