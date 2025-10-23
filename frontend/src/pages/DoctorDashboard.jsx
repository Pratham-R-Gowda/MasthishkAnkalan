// frontend/src/pages/DoctorDashboard.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import PatientsList from "./Doctor/PatientsList";
import Inbox from "./Doctor/Inbox";
import Outbox from "./Doctor/Outbox";
import { useAuth } from "../context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-white border-r p-6">
        <div className="mb-6">
          <div className="text-xl font-bold">Doctor</div>
          <div className="text-sm text-gray-500">{user?.name}</div>
        </div>
        <div className="space-y-3">
          <button onClick={() => navigate("/doctor/patients")} className="w-full p-3 rounded hover:bg-gray-100">PATIENTS LIST</button>
          <button onClick={() => navigate("/doctor/inbox")} className="w-full p-3 rounded hover:bg-gray-100">INBOX</button>
          <button onClick={() => navigate("/doctor/outbox")} className="w-full p-3 rounded hover:bg-gray-100">OUTBOX</button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<div className="text-2xl">Welcome, Dr. {user?.name}</div>} />
          <Route path="patients" element={<PatientsList />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="outbox" element={<Outbox />} />
        </Routes>
      </main>
    </div>
  );
}
