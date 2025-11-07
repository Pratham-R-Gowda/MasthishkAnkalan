// frontend/src/pages/Patient/TestHistory.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";

export default function TestHistory() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/patient/tests");
        setTests(res.data || []);
      } catch (e) {
        console.error(e);
        setTests([]);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Test History</h2>
      {tests.length === 0 ? (
        <div className="text-gray-500">No test records yet.</div>
      ) : (
        <ul className="space-y-3">
          {tests.map((t) => (
            <li key={t.id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold text-gray-800">
                Test Session: {t.session_id || "—"}
              </div>
              <div className="text-sm text-gray-700 mt-1">
                <strong>AI Result:</strong> {t.metadata?.ai_result || "Pending"}
              </div>
              <div className="text-sm text-gray-700">
                <strong>EEG File:</strong> {t.metadata?.file_uri || "Not uploaded"}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
