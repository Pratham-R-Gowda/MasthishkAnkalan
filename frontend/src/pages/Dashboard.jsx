// frontend/src/pages/Dashboard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import PatientDashboard from "./PatientDashboard";
import DoctorDashboard from "./DoctorDashboard"; // you will create later
import CaretakerDashboard from "./CaretakerDashboard"; // optional later

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">Not authenticated</div>;

  const role = user.role;

  if (role === "doctor") {
    return <DoctorDashboard />;
  }
  if (role === "caretaker") {
    return <CaretakerDashboard />;
  }
  // default patient
  return <PatientDashboard />;
}
