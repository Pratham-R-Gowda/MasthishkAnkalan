// frontend/src/pages/Caretaker/Inbox.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";

export default function CaretakerInbox() {
  const [msgs, setMsgs] = useState([]);
  const [error, setError] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendMsg, setSendMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/caretaker/inbox");
        setMsgs(res.data || []);
      } catch (e) {
        setError("Failed to load inbox");
        setMsgs([]);
      }
    })();
  }, []);

  // NOTE: backend doesn't currently expose a caretaker->doctor send endpoint.
  // As a pragmatic placeholder, we'll create a "Request Doctor" by creating a task for the linked patient.
  const contactDoctor = async (e) => {
    e.preventDefault();
    setSendMsg("");
    if (!doctorId || !messageBody) {
      setSendMsg("doctor id and message required");
      return;
    }
    try {
      // create a caretaker task (will appear for patient); backend will route to patient tasks.
      // You may later replace this with a proper send-message endpoint
      const payload = {
        patient_id: "", // optional: you can fill linked patient id manually in UI
        task: { title: "Request: contact doctor", description: `To Dr ${doctorId}: ${messageBody}` }
      };
      await api.post("/caretaker/tasks", payload);
      setSendMsg("Request created (task). Doctor/caregiver will be notified via the workflow.");
      setDoctorId("");
      setMessageBody("");
    } catch (e) {
      setSendMsg("Failed to create request");
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Inbox</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {msgs.length === 0 ? <div>No messages</div> : (
        <ul className="space-y-3 mb-6">
          {msgs.map((m) => (
            <li key={m.id} className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{m.subject || "Message"}</div>
                <div className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              <div className="mt-2 text-sm text-gray-700">{m.body}</div>
            </li>
          ))}
        </ul>
      )}

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Contact Doctor (create request)</h3>
        <form onSubmit={contactDoctor} className="space-y-2">
          <input placeholder="Doctor ID" value={doctorId} onChange={(e)=>setDoctorId(e.target.value)} className="w-full p-2 border rounded" />
          <textarea placeholder="Message to doctor" value={messageBody} onChange={(e)=>setMessageBody(e.target.value)} className="w-full p-2 border rounded h-28" />
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">Create Request</button>
            {sendMsg && <div className="text-sm text-gray-700">{sendMsg}</div>}
          </div>
        </form>
      </div>
    </div>
  );
}
