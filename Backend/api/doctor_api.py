# Backend/api/doctor_api.py
from flask import Blueprint, request, jsonify
from ..utils.authorization import requires_roles
from ..models.eeg_model import (
    list_messages_for_user, send_message, create_report, list_reports_for_user,
    list_eeg_sessions_by_user
)
from ..extensions import get_db
from ..models.user_model import find_user_by_id

from bson import ObjectId
from ..models.eeg_model import clear_inbox_for_user

doctor_bp = Blueprint("doctor", __name__)

# @doctor_bp.route("/patients", methods=["GET"])
# @requires_roles("doctor")
# def patients_list():
#     # naive: list all patients and their last inbox timestamp for this doctor
#     db = get_db()
#     # find patients (role patient)
#     users = db['users'].find({"role": "patient"}, {"_id": 1, "name": 1, "email": 1})
#     out = []
#     for u in users:
#         # last message from this patient to this doctor
#         last_msg = db['messages'].find_one({"from_id": u["_id"], "to_id": __import__('bson').ObjectId(request.user_id)}, sort=[("created_at", -1)])
#         last_ts = last_msg["created_at"] if last_msg else None
#         out.append({
#             "id": str(u["_id"]),
#             "name": u.get("name"),
#             "email": u.get("email"),
#             "last_message_at": last_ts,
#         })
#     return jsonify(out)


@doctor_bp.route("/patients", methods=["POST"])
@requires_roles("doctor")
def add_patient():
    data = request.get_json() or {}
    email = data.get("email")
    name = data.get("name", "")
    if not email:
        return jsonify({"error": "email_required"}), 400

    db = get_db()
    existing = db["users"].find_one({"email": email.strip().lower()})
    if existing:
        return jsonify({"error": "patient_already_exists"}), 400

    patient = {
        "email": email.strip().lower(),
        "name": name,
        "role": "patient",
        "profile": {},
        "verified": True,
        "created_at": __import__('datetime').datetime.utcnow()
    }
    res = db["users"].insert_one(patient)
    return jsonify({"ok": True, "patient_id": str(res.inserted_id)})


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
    
    # list_reports_for_user 

    # list_eeg_sessions_by_user

@doctor_bp.route("/profile", methods=["GET", "PUT"])
@requires_roles("doctor")
def doctor_profile():
    db = get_db()
    if request.method == "GET":
        u = find_user_by_id(request.user_id)
        if not u:
            return jsonify({"error": "not_found"}), 404
        return jsonify({
            "id": str(u["_id"]),
            "name": u.get("name"),
            "license_no": u.get("license_no") or u.get("profile", {}).get("license_no"),
            "email": u.get("email"),
            "verified": u.get("verified", False)
        })
    else:
        data = request.get_json() or {}
        allowed = {"name", "license_no"}
        update = {k: data[k] for k in data if k in allowed}
        if "license_no" in update:
            # store at top-level (keeps compatibility with existing user_model)
            db["users"].update_one({"_id": ObjectId(request.user_id)}, {"$set": {
                "license_no": update["license_no"],
                "updated_at": __import__('datetime').datetime.utcnow()
            }})
            update.pop("license_no", None)
        if update:
            db["users"].update_one({"_id": ObjectId(request.user_id)}, {"$set": update})
        return jsonify({"ok": True})

@doctor_bp.route("/inbox/clear", methods=["POST"])
@requires_roles("doctor")
def doctor_clear_inbox():
    deleted = clear_inbox_for_user(request.user_id)
    return jsonify({"ok": True, "deleted": deleted})

@doctor_bp.route("/settings", methods=["GET", "PUT"])
@requires_roles("doctor")
def doctor_settings():
    db = get_db()
    if request.method == "GET":
        u = find_user_by_id(request.user_id)
        return jsonify({"theme": (u.get("settings", {}) or {}).get("theme", "light")})
    else:
        data = request.get_json() or {}
        theme = data.get("theme")
        if theme not in ("light", "dark"):
            return jsonify({"error": "invalid_theme"}), 400
        db["users"].update_one({"_id": ObjectId(request.user_id)}, {"$set": {"settings.theme": theme}})
        return jsonify({"ok": True, "theme": theme}) 