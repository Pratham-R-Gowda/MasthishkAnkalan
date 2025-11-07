// frontend/src/pages/Caretaker/Profile.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";

export default function CaretakerProfile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [linked, setLinked] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/caretaker/profile");
      setProfile(res.data);
      setName(res.data?.name || "");
      const ids = (res.data?.linked_patient_ids || []).join(",");
      setLinked(ids);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setMsg("");
    try {
      const list = linked.split(",").map(s => s.trim()).filter(Boolean);
      await api.put("/caretaker/profile", { name, linked_patient_ids: list });
      setMsg("Saved");
      await load();
    } catch {
      setMsg("Failed to save");
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Caretaker Profile</h2>
      <div className="bg-white p-4 rounded shadow space-y-3">
        <div><strong>ID:</strong> {profile.id}</div>
        <div className="space-y-1">
          <label className="text-sm">Name</label>
          <input className="w-full p-2 border rounded" value={name} onChange={(e)=>setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Linked Patient IDs (comma separated)</label>
          <input className="w-full p-2 border rounded" value={linked} onChange={(e)=>setLinked(e.target.value)} />
        </div>
        <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
        {msg && <div className="text-sm">{msg}</div>}
      </div>
    </div>
  );
}
