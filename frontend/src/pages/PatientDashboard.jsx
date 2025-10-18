import React, { useEffect, useState } from "react";
import api from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

export default function PatientDashboard() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/auth/me");
        setProfile(res.data);
      } catch (e) {
        setProfile(null);
      }
    })();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Patient Dashboard</h1>

      <div className="bg-white p-4 rounded shadow">
        <p><strong>Name:</strong> {profile?.name || user?.name}</p>
        <p><strong>Email:</strong> {profile?.email || user?.email}</p>
        <p><strong>Role:</strong> {profile?.role || user?.role}</p>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <ul className="list-disc pl-6">
          <li>Upload EEG session (coming soon)</li>
          <li>View AI results & doctor reports (coming soon)</li>
        </ul>
      </div>
    </div>
  );
}
