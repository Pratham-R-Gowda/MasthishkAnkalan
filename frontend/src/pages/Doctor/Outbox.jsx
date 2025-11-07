// frontend/src/pages/Patient/Inbox.jsx (same pattern for Caretaker/Doctor inbox)
import React, { useEffect, useState } from "react";
import { fetchInbox } from "../../services/messageServices";
import { useAuth } from "../../context/AuthContext";

export default function Inbox() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetchInbox(user.role);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Inbox load failed", err);
      }
    })();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        {user?.role === "doctor"
          ? "Messages from Patients"
          : "Inbox - Messages from Doctor"}
      </h2>

      {messages.length === 0 && <p>No messages yet.</p>}

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
          <p>
            <strong>Subject:</strong> {m.subject || "No subject"}
          </p>
          <p>{m.body || "No message content"}</p>

          {/* If AI result or metadata present */}
          {m.metadata?.session_id && (
            <p className="text-sm text-gray-500">
              Linked session: {m.metadata.session_id}
            </p>
          )}

          {/* If tasks present */}
          {m.tasks?.length > 0 && (
            <div>
              <strong>Tasks:</strong>
              <ul className="list-disc ml-5 text-sm">
                {m.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          <small className="block text-gray-500 mt-2">
            {new Date(m.created_at || m.timestamp).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}
