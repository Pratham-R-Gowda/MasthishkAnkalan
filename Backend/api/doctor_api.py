# Backend/api/doctor_api.py
from flask import Blueprint, request, jsonify
from ..utils.authorization import requires_roles
from ..models.eeg_model import (
    list_messages_for_user, send_message, create_report, list_reports_for_user,
    list_eeg_sessions_by_user
)
from ..extensions import get_db
from ..models.user_model import find_user_by_id

doctor_bp = Blueprint("doctor", __name__)

@doctor_bp.route("/patients", methods=["GET"])
@requires_roles("doctor")
def patients_list():
    # naive: list all patients and their last inbox timestamp for this doctor
    db = get_db()
    # find patients (role patient)
    users = db['users'].find({"role": "patient"}, {"_id": 1, "name": 1, "email": 1})
    out = []
    for u in users:
        # last message from this patient to this doctor
        last_msg = db['messages'].find_one({"from_id": u["_id"], "to_id": __import__('bson').ObjectId(request.user_id)}, sort=[("created_at", -1)])
        last_ts = last_msg["created_at"] if last_msg else None
        out.append({
            "id": str(u["_id"]),
            "name": u.get("name"),
            "email": u.get("email"),
            "last_message_at": last_ts,
        })
    return jsonify(out)

@doctor_bp.route("/inbox", methods=["GET"])
@requires_roles("doctor")
def inbox():
    # messages to this doctor
    msgs = list_messages_for_user(request.user_id)
    out = []
    for m in msgs:
        out.append({
            "id": str(m["_id"]),
            "from_id": str(m.get("from_id")),
            "subject": m.get("subject"),
            "body": m.get("body"),
            "metadata": m.get("metadata", {}),
            "created_at": m.get("created_at"),
        })
    return jsonify(out)

@doctor_bp.route("/outbox", methods=["POST"])
@requires_roles("doctor")
def outbox_send():
    data = request.get_json() or {}
    patient_id = data.get("patient_id")
    session_id = data.get("session_id")  # optional - tie to EEG session
    report_body = data.get("report") or {}
    subject = data.get("subject", "Report from doctor")
    body = data.get("body", "")

    if not patient_id:
        return jsonify({"error": "patient_id_required"}), 400

    # create a report record if session provided
    if session_id:
        create_report(session_id, request.user_id, report_body)

    # send message (physically deliver)
    msg = send_message(request.user_id, patient_id, subject, body, metadata={"session_id": session_id})
    return jsonify({"ok": True, "message_id": str(msg["_id"])})
