// frontend/src/pages/Caretaker/Profile.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/apiClient";

export default function CaretakerProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/caretaker/profile");
        setProfile(res.data);
      } catch (e) {
        setError("Failed to load profile");
      }
    })();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Caretaker Profile</h2>
      <div className="bg-white p-4 rounded shadow">
        <p><strong>Name:</strong> {profile.name || "—"}</p>
        <p><strong>Email:</strong> {profile.email || "—"}</p>
        <p className="mt-2"><strong>Linked patient IDs:</strong></p>
        <ul className="list-disc pl-6">
          {(profile.linked_patient_ids || []).map(id => (
            <li key={id}>{id}</li>
          ))}
          {(profile.linked_patient_ids || []).length === 0 && <li>No linked patients</li>}
        </ul>
      </div>
    </div>
  );
}
