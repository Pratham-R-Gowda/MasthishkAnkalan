// frontend/src/pages/Doctor/Inbox.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";
import { useLocation } from "react-router-dom";

export default function DoctorInbox() {
  const [msgs, setMsgs] = useState([]);
  const [error, setError] = useState("");
  const loc = useLocation();
  const preselectedPatientId = loc.state?.patientId;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/doctor/inbox");
        setMsgs(res.data || []);
      } catch (e) {
        setError("Failed to load inbox");
        setMsgs([]);
      }
    })();
  }, []);

  // optional filter by patient id (if coming from patients list)
  const filtered = preselectedPatientId ? msgs.filter(m => m.from_id === preselectedPatientId) : msgs;

  return (
    <div>
      <h2 className="text-2xl mb-4">Inbox</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {filtered.length === 0 ? (
        <div>No messages</div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => (
            <li key={m.id} className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{m.subject || "Message"}</div>
                <div className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
              </div>

              <div className="mt-2 text-sm text-gray-700">{m.body}</div>

              {m.metadata?.session_id && (
                <div className="mt-3 text-xs text-indigo-600">
                  Session: {m.metadata.session_id}
                </div>
              )}

              <div className="mt-2 text-xs text-gray-400">From: {m.from_id}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
