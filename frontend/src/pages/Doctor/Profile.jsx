// frontend/src/pages/Doctor/Profile.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/doctor/profile");
        setProfile(res.data);
        setName(res.data?.name || "");
        setLicenseNo(res.data?.license_no || "");
      } catch {
        setProfile(null);
      }
    })();
  }, []);

  const save = async () => {
    setMsg("");
    try {
      await api.put("/doctor/profile", { name, license_no: licenseNo });
      setMsg("Saved");
    } catch {
      setMsg("Failed to save");
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <div className="bg-white p-4 rounded shadow space-y-3">
        <div><strong>ID:</strong> {profile.id}</div>
        <div className="space-y-1">
          <label className="text-sm">Name</label>
          <input className="w-full p-2 border rounded" value={name} onChange={(e)=>setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Licence Number</label>
          <input className="w-full p-2 border rounded" value={licenseNo} onChange={(e)=>setLicenseNo(e.target.value)} />
        </div>
        <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
        {msg && <div className="text-sm">{msg}</div>}
      </div>
    </div>
  );
}
