import React, { useEffect, useState } from "react";
import { fetchInbox } from "../../services/messageServices";
import { useAuth } from "../../context/AuthContext";

export default function CaretakerInbox() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetchInbox("caretaker");
        setMessages(res.data || []);
      } catch (err) {
        console.error("Caretaker inbox load failed", err);
      }
    })();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Caretaker Inbox</h2>

      {messages.length === 0 && <p>No messages available.</p>}

      {messages.map((m) => (
        <div
          key={m.id || m._id}
          className="border p-3 mb-3 rounded bg-white shadow-sm"
        >
          <p>
            <strong>From:</strong>{" "}
            {m.sender_role
              ? m.sender_role
              : m.from_id
              ? `User ${m.from_id}`
              : "Unknown"}
          </p>

          {m.metadata?.patient_id && (
            <p>
              <strong>For patient:</strong> {m.metadata.patient_id}
            </p>
          )}

          <p>
            <strong>Subject:</strong> {m.subject || "No subject"}
          </p>
          <p>{m.body || "No message content"}</p>

          {/* Display linked tasks if present */}
          {m.tasks?.length > 0 && (
            <div>
              <strong>Tasks to perform:</strong>
              <ul className="list-disc ml-5 text-sm">
                {m.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Show timestamp */}
          <small className="block text-gray-500 mt-2">
            {new Date(m.created_at || m.timestamp).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}
