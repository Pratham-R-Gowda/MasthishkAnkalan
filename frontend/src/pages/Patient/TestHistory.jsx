import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";

export default function TestHistory() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/patient/ai-results");
        setResults(res.data || []);
      } catch (e) {
        setResults([]);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-2xl mb-4">Test History</h2>
      {results.length === 0 ? <div>No results yet</div> : (
        <ul className="space-y-3">
          {results.map(r => (
            <li key={r.id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold">Session {r.session_id}</div>
              <div className="text-sm mt-1 break-words">{JSON.stringify(r.result)}</div>
              <div className="text-xs text-gray-500 mt-2">{new Date(r.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
