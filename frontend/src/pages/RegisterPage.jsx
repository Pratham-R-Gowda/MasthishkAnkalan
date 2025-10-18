// frontend/src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function RegisterPage() {
  const query = useQuery();
  const initialRole = query.get("role") || "patient";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [licenseNo, setLicenseNo] = useState("");
  const [linkedPatientId, setLinkedPatientId] = useState("");
  const [err, setErr] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const profile = {};
      if (role === "doctor") profile.license_no = licenseNo;
      if (role === "caretaker") profile.linked_patient_ids = linkedPatientId ? [linkedPatientId] : [];

      await register(email, password, name, role, profile);
      // if doctor: show message then redirect to login
      navigate("/login");
    } catch (error) {
      setErr(error?.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Register as {role}</h2>

        {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

        <label className="block mb-2 text-sm">Role</label>
        <select className="w-full p-2 mb-4 border rounded" value={role} onChange={(e)=>setRole(e.target.value)}>
          <option value="patient">Patient / User</option>
          <option value="doctor">Doctor</option>
          <option value="caretaker">Caretaker</option>
        </select>

        <label className="block mb-2 text-sm">Name</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full p-2 mb-4 border rounded" type="text" />

        <label className="block mb-2 text-sm">Email</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-2 mb-4 border rounded" type="email" />

        <label className="block mb-2 text-sm">Password</label>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-2 mb-4 border rounded" type="password" />

        {role === "doctor" && (
          <>
            <label className="block mb-2 text-sm">License No</label>
            <input value={licenseNo} onChange={(e)=>setLicenseNo(e.target.value)} className="w-full p-2 mb-4 border rounded" type="text" />
            <div className="text-xs text-gray-500 mb-4">Doctor accounts require verification by admin.</div>
          </>
        )}

        {role === "caretaker" && (
          <>
            <label className="block mb-2 text-sm">Linked Patient ID (optional)</label>
            <input value={linkedPatientId} onChange={(e)=>setLinkedPatientId(e.target.value)} className="w-full p-2 mb-4 border rounded" type="text" />
          </>
        )}

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Create account</button>
      </form>
    </div>
  );
}
