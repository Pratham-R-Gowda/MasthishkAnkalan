// frontend/src/pages/Patient/Tests.jsx
import React, { useState } from "react";
import api from "../../services/apiClient";

export default function Tests() {
  const [file, setFile] = useState(null);
  const [doctorId, setDoctorId] = useState("");
  const [msg, setMsg] = useState("");

  const uploadTest = async () => {
    if (!file) {
      setMsg("Please select an EEG file first.");
      return;
    }
    try {
      const metadata = {
        file_uri: file.name,
        status: "uploaded",
        created_at: new Date().toISOString(),
      };
      await api.post("/patient/tests", { metadata });
      setMsg("✅ EEG uploaded successfully!");
    } catch (e) {
      console.error(e);
      setMsg("❌ Failed to upload test.");
    }
  };

  const sendToDoctor = async () => {
    if (!doctorId) {
      setMsg("Doctor ID required to send result.");
      return;
    }
    try {
      await api.post("/doctor/outbox", {
        patient_id: "self",
        subject: "EEG Test Result",
        body: "Patient EEG test results for analysis.",
        report: {},
      });
      setMsg("✅ Sent to doctor successfully!");
    } catch (e) {
      console.error(e);
      setMsg("❌ Failed to send to doctor.");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Upload and Send EEG Test</h2>

      {/* Upload EEG File */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button
          onClick={uploadTest}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Upload EEG
        </button>
      </div>

      {/* Send to Doctor */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <input
          placeholder="Doctor ID"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={sendToDoctor}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Send to Doctor
        </button>
      </div>

      {msg && <div className="text-sm text-gray-700 mt-2">{msg}</div>}
    </div>
  );
}

