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
        setTasks([]);
      }
    })();
  }, []);

  const markDone = async (taskId) => {
    try {
      await api.post(`/patient/tasks/${taskId}/complete`);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Tasks</h2>
      {tasks.length === 0 ? <div>No tasks</div> : (
        <ul className="space-y-3">
          {tasks.map(t => (
            <li key={t.id} className="bg-white p-4 rounded shadow flex justify-between">
              <div>
                <div className="font-medium">{t.task.title || "Task"}</div>
                <div className="text-sm text-gray-600">{t.task.description}</div>
                <div className="text-xs text-gray-500 mt-1">Due: {t.due_date || "N/A"}</div>
              </div>
              <div>
                {!t.completed ? (
                  <button onClick={() => markDone(t.id)} className="px-3 py-1 bg-green-600 text-white rounded">Done</button>
                ) : (
                  <span className="text-green-600">Completed</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
