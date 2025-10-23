// frontend/src/pages/Caretaker/Tasks.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";

export default function CaretakerTasks() {
  const [tasks, setTasks] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/caretaker/tasks");
        setTasks(res.data || []);
      } catch (e) {
        setTasks([]);
      }
    })();
  }, []);

  const create = async () => {
    setMsg("");
    if (!patientId || !title) {
      setMsg("Patient ID and title required");
      return;
    }
    try {
      const payload = { patient_id: patientId, task: { title, description: desc } };
      const res = await api.post("/caretaker/tasks", payload);
      setTasks(prev => [{ id: res.data.task_id, user_id: patientId, task: payload.task }, ...prev]);
      setMsg("Created");
      setPatientId(""); setTitle(""); setDesc("");
    } catch (e) {
      setMsg("Failed to create task");
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Tasks</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Create Task</h3>
        <div className="space-y-2">
          <input placeholder="Patient ID" value={patientId} onChange={(e)=>setPatientId(e.target.value)} className="w-full p-2 border rounded" />
          <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full p-2 border rounded" />
          <textarea placeholder="Description" value={desc} onChange={(e)=>setDesc(e.target.value)} className="w-full p-2 border rounded h-28" />
          <div className="flex items-center gap-3">
            <button onClick={create} className="px-4 py-2 bg-green-600 text-white rounded">Create Task</button>
            {msg && <div className="text-sm">{msg}</div>}
          </div>
        </div>
      </div>

      <div>
        {tasks.length === 0 ? <div>No tasks</div> : (
          <ul className="space-y-3">
            {tasks.map(t => (
              <li key={t.id} className="bg-white p-4 rounded shadow">
                <div className="font-semibold">{t.task?.title || "Task"}</div>
                <div className="text-sm mt-1">{t.task?.description}</div>
                <div className="text-xs text-gray-500 mt-2">Patient: {t.user_id || "—"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
