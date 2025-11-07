// frontend/src/pages/Patient/Tasks.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/patient/tasks");
        setTasks(res.data || []);
      } catch (e) {
        console.error(e);
        setTasks([]);
      }
    })();
  }, []);

  const markDone = async (taskId) => {
    try {
      await api.post(`/patient/tasks/${taskId}/complete`);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">My Tasks</h2>
      {tasks.length === 0 ? (
        <div className="text-gray-500">No tasks yet.</div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-gray-800">{t.task || "Task"}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : "N/A"}
                </div>
              </div>
              <div>
                {!t.completed ? (
                  <button
                    onClick={() => markDone(t.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Done
                  </button>
                ) : (
                  <span className="text-green-600 font-medium">Completed</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

