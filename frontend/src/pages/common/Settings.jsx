// frontend/src/pages/common/Settings.jsx
import React, { useState } from "react";
import api from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [msg, setMsg] = useState("");

  if (!user) return <div className="p-4">Not authenticated</div>;

  const clearInbox = async () => {
    setMsg("");
    try {
      const res = await api.post(`/${user.role}/inbox/clear`);
      setMsg(`Cleared ${res.data?.deleted ?? 0} messages`);
    } catch {
      setMsg("Failed to clear inbox");
    }
  };

  const doLogout = async () => {
    await logout();
    // redirect handled by route guards (or add a navigate if you prefer)
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Settings</h2>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Theme</div>
            <div className="text-sm text-gray-600">Current: {theme}</div>
          </div>
          <button onClick={toggleTheme} className="px-3 py-1 rounded bg-gray-800 text-white">
            Toggle Dark / Light
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Inbox</div>
            <div className="text-sm text-gray-600">Delete all received messages</div>
          </div>
          <button onClick={clearInbox} className="px-3 py-1 rounded bg-red-600 text-white">
            Clear Inbox History
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Logout</div>
            <div className="text-sm text-gray-600">Sign out of this device</div>
          </div>
          <button onClick={doLogout} className="px-3 py-1 rounded bg-blue-600 text-white">
            Logout
          </button>
        </div>

        {msg && <div className="text-sm text-gray-700">{msg}</div>}
      </div>
    </div>
  );
}
