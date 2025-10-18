// frontend/src/pages/HomePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLE_OPTIONS = [
  { key: "patient", label: "Patient / User" },
  { key: "doctor", label: "Doctor" },
  { key: "caretaker", label: "Caretaker" },
];

export default function HomePage() {
  const [role, setRole] = useState("patient");
  const navigate = useNavigate();

  const goRegister = () => {
    navigate(`/register?role=${role}`);
  };
  const goLogin = () => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Welcome to Brain Health</h1>
        <p className="mb-4">Choose your role and either register or login.</p>

        <div className="mb-4">
          <label className="block text-sm mb-2">I am a:</label>
          <div className="flex gap-2">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`px-4 py-2 rounded border ${role === r.key ? "bg-blue-600 text-white" : "bg-white"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={goRegister} className="flex-1 py-2 bg-green-600 text-white rounded">Register</button>
          <button onClick={goLogin} className="flex-1 py-2 bg-blue-600 text-white rounded">Login</button>
        </div>
      </div>
    </div>
  );
}
