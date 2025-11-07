import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function PatientProfile() {
  const { user } = useAuth();

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
      <p><strong>Patient ID:</strong> {user.id}</p>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  );
}
