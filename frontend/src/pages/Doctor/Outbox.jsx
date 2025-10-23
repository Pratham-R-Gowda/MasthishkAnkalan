// frontend/src/pages/Doctor/Outbox.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/apiClient";
import { useSearchParams } from "react-router-dom";

export default function DoctorOutbox() {
  const [searchParams] = useSearchParams();
  const prePatient = searchParams.get("patientId") || "";
  const [patientId, setPatientId] = useState(prePatient);
  const [sessionId, setSessionId] = useState("");
  const [subject, setSubject] = useState("Prescription / Report");
  const [body, setBody] = useState("");
  const [reportJson, setReportJson] = useState(""); // optional structured report
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (prePatient) setPatientId(prePatient);
  }, [prePatient]);

  const send = async () => {
    setMsg("");
    if (!patientId) {
      setMsg("Patient ID required");
      return;
    }
    try {
      let reportBody = {};
      if (reportJson) {
        try {
          reportBody = JSON.parse(reportJson);
        } catch (e) {
          setMsg("Report JSON invalid");
          return;
        }
      }
      const payload = {
        patient_id: patientId,
        session_id: sessionId || None,
        report: reportBody,
        subject,
        body,
      };
      // avoid sending `None` literal
      if (!payload.session_id) delete payload.session_id;
      const res = await api.post("/doctor/outbox", payload);
      setMsg("Sent message: " + (res.data.message_id || "ok"));
      setBody("");
      setReportJson("");
    } catch (e) {
      setMsg("Error sending message");
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Send Report / Prescription</h2>

      <div className="space-y-3 bg-white p-4 rounded shadow">
        <label className="text-sm block">Patient ID</label>
        <input value={patientId} onChange={(e)=>setPatientId(e.target.value)} className="w-full p-2 border rounded" />

        <label className="text-sm block mt-2">Session ID (optional)</label>
        <input value={sessionId} onChange={(e)=>setSessionId(e.target.value)} className="w-full p-2 border rounded" />

        <label className="text-sm block mt-2">Subject</label>
        <input value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full p-2 border rounded" />

        <label className="text-sm block mt-2">Message</label>
        <textarea value={body} onChange={(e)=>setBody(e.target.value)} className="w-full p-2 border rounded h-28" />

        <label className="text-sm block mt-2">Structured report (JSON, optional)</label>
        <textarea value={reportJson} onChange={(e)=>setReportJson(e.target.value)} className="w-full p-2 border rounded h-28" />

        <div className="flex items-center gap-3">
          <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
          {msg && <div className="text-sm text-gray-700">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
