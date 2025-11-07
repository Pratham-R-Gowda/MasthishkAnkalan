// frontend/src/pages/Caretaker/Tasks.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";

export default function CaretakerTasks() {
  const [tasks, setTasks] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [taskText, setTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [msg, setMsg] = useState("");

  // Fetch caretaker + linked patient tasks
  const loadTasks = async () => {
    try {
      const res = await api.get("/caretaker/tasks");
      setTasks(res.data || []);
    } catch (e) {
      console.error(e);
      setTasks([]);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Create new task
  const create = async () => {
    setMsg("");
    if (!patientId || !taskText) {
      setMsg("Patient ID and task description are required.");
      return;
    }
    try {
      const payload = { patient_id: patientId, task: taskText, due_date: dueDate || null };
      await api.post("/caretaker/tasks", payload);
      setMsg("✅ Task created successfully!");
      setPatientId("");
      setTaskText("");
      setDueDate("");
      await loadTasks(); // Refresh the list from DB
    } catch (e) {
      console.error(e);
      setMsg("❌ Failed to create task.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Caretaker Tasks</h2>

      {/* Create Task Form */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Create Task for Patient</h3>
        <div className="space-y-2">
          <input
            placeholder="Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Task description"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            className="w-full p-2 border rounded h-24"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={create}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Add Task
            </button>
            {msg && <div className="text-sm text-gray-700">{msg}</div>}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div>
        {tasks.length === 0 ? (
          <div className="text-gray-500">No tasks yet.</div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((t) => (
              <li key={t.id} className="bg-white p-4 rounded shadow">
                <div className="font-semibold text-gray-800">{t.task || "Untitled Task"}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Patient ID: {t.user_id || "—"}
                </div>
                <div className="text-xs text-gray-500">
                  Due Date: {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}
                </div>
                <div className="text-xs mt-1 text-gray-500">
                  Status: {t.completed ? "✅ Completed" : "🕓 Pending"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


// import React, { useEffect, useState } from "react";
// import api from "../../services/apiClient";

// export default function CaretakerTasks() {
//   const [tasks, setTasks] = useState([]);
//   const [patientId, setPatientId] = useState("");
//   const [title, setTitle] = useState("");
//   const [desc, setDesc] = useState("");
//   const [msg, setMsg] = useState("");

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await api.get("/caretaker/tasks");
//         setTasks(res.data || []);
//       } catch (e) {
//         setTasks([]);
//       }
//     })();
//   }, []);

//   const create = async () => {
//     setMsg("");
//     if (!patientId || !title) {
//       setMsg("Patient ID and title required");
//       return;
//     }
//     try {
//       const payload = { patient_id: patientId, task: { title, description: desc } };
//       const res = await api.post("/caretaker/tasks", payload);
//       setTasks(prev => [{ id: res.data.task_id, user_id: patientId, task: payload.task }, ...prev]);
//       setMsg("Created");
//       setPatientId(""); setTitle(""); setDesc("");
//     } catch (e) {
//       setMsg("Failed to create task");
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl mb-4">Tasks</h2>

//       <div className="bg-white p-4 rounded shadow mb-6">
//         <h3 className="font-semibold mb-2">Create Task</h3>
//         <div className="space-y-2">
//           <input placeholder="Patient ID" value={patientId} onChange={(e)=>setPatientId(e.target.value)} className="w-full p-2 border rounded" />
//           <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full p-2 border rounded" />
//           <textarea placeholder="Description" value={desc} onChange={(e)=>setDesc(e.target.value)} className="w-full p-2 border rounded h-28" />
//           <div className="flex items-center gap-3">
//             <button onClick={create} className="px-4 py-2 bg-green-600 text-white rounded">Create Task</button>
//             {msg && <div className="text-sm">{msg}</div>}
//           </div>
//         </div>
//       </div>

//       <div>
//         {tasks.length === 0 ? <div>No tasks</div> : (
//           <ul className="space-y-3">
//             {tasks.map(t => (
//               <li key={t.id} className="bg-white p-4 rounded shadow">
//                 <div className="font-semibold">{t.task?.title || "Task"}</div>
//                 <div className="text-sm mt-1">{t.task?.description}</div>
//                 <div className="text-xs text-gray-500 mt-2">Patient: {t.user_id || "—"}</div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }
