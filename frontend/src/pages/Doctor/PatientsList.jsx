// frontend/src/pages/Doctor/PatientsList.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";
import { useNavigate } from "react-router-dom";

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/doctor/patients");
        setPatients(res.data || []);
      } catch (e) {
        setError("Failed to load patients");
        setPatients([]);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-2xl mb-4">Patients</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {patients.length === 0 ? (
        <div>No patients found</div>
      ) : (
        <ul className="space-y-3">
          {patients.map((p) => (
            <li key={p.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold">{p.name || "—"}</div>
                <div className="text-sm text-gray-600">{p.email || "—"}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Last message: {p.last_message_at ? new Date(p.last_message_at).toLocaleString() : "—"}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/doctor/outbox?patientId=${p.id}`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Send Report
                </button>
                <button
                  onClick={() => navigate(`/doctor/inbox`, { state: { patientId: p.id } })}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  View Messages
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
