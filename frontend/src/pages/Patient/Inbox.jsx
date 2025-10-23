import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";

export default function Inbox() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/patient/inbox");
        setMessages(res.data || []);
      } catch (e) {
        setMessages([]);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-2xl mb-4">Inbox</h2>
      {messages.length === 0 ? <div>No messages</div> : (
        <ul className="space-y-3">
          {messages.map(m => (
            <li key={m.id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold">{m.subject || "Message"}</div>
              <div className="text-sm text-gray-700 mt-1">{m.body}</div>
              <div className="text-xs text-gray-500 mt-2">{new Date(m.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
