import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";
import { useNavigate } from "react-router-dom";

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [newPatient, setNewPatient] = useState({ name: "", email: "" });
  const navigate = useNavigate();

  const loadPatients = async () => {
    try {
      const res = await api.get("/doctor/patients");
      setPatients(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load patients");
      setPatients([]);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const addPatient = async () => {
    setMsg("");
    if (!newPatient.email) {
      setMsg("❗ Email is required");
      return;
    }
    try {
      const res = await api.post("/doctor/patients", newPatient);
      setMsg("✅ Patient added successfully!");
      setNewPatient({ name: "", email: "" });
      loadPatients();
    } catch (e) {
      setMsg("❌ Failed to add patient");
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Patients</h2>

      {/* Add New Patient Section */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <h3 className="font-medium text-lg mb-2">Add New Patient</h3>

        <input
          type="text"
          placeholder="Patient Name"
          value={newPatient.name}
          onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          type="email"
          placeholder="Patient Email"
          value={newPatient.email}
          onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={addPatient}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Patient
          </button>
          {msg && <p className="text-sm text-gray-700">{msg}</p>}
        </div>
      </div>

      {/* Existing Patients Section */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {patients.length === 0 ? (
          <div className="text-gray-500">No patients found</div>
        ) : (
          <ul className="space-y-3">
            {patients.map((p) => (
              <li
                key={p.id || p._id}
                className="bg-white p-4 rounded shadow flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <div className="font-semibold text-gray-800">{p.name || "—"}</div>
                  <div className="text-sm text-gray-600">{p.email || "—"}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last message:{" "}
                    {p.last_message_at
                      ? new Date(p.last_message_at).toLocaleString()
                      : "—"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/doctor/outbox?patientId=${p.id || p._id}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Send Report
                  </button>
                  <button
                    onClick={() => navigate(`/doctor/inbox`, { state: { patientId: p.id || p._id } })}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    View Messages
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
