import React, { useState } from "react";
import { createTest } from "../../services/patientServices";

export default function Tests() {
  const [msg, setMsg] = useState("");

  const startTest = async () => {
    try {
      const res = await createTest({ notes: "Started from UI" });
      setMsg("Created session: " + res.data.session_id);
    } catch (e) {
      setMsg("Error creating test");
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Start Test</h2>
      <p className="mb-4">You can start a test (upload integration later).</p>
      <button onClick={startTest} className="px-4 py-2 bg-indigo-600 text-white rounded">Start TEST</button>
      {msg && <div className="mt-4 text-sm">{msg}</div>}
    </div>
  );
}
