# Backend/api/message_api.py
from flask import Blueprint, request, jsonify
from ..utils.authorization import requires_roles
from ..models.message_model import create_message, get_inbox, get_outbox
from ..utils.db_utils import get_db

message_bp = Blueprint("message_bp", __name__, url_prefix="/api")

# Doctor composing message
@message_bp.route("/doctor/outbox/send", methods=["POST"])
@requires_roles("doctor")
def send_message():
    data = request.get_json() or {}
    subject = data.get("subject", "")
    body = data.get("body", "")
    recipients = data.get("recipients", [])
    tasks = data.get("tasks", [])
    attachments = data.get("attachments", [])
    msg = create_message(request.user_id, request.user_role, recipients, subject, body, tasks, attachments)
    return jsonify({"ok": True, "message": msg})

# Inbox common for all roles
@message_bp.route("/<role>/inbox", methods=["GET"])
@requires_roles("doctor", "patient", "caretaker")
def inbox(role):
    msgs = get_inbox(request.user_id)
    for m in msgs:
        m["_id"] = str(m["_id"])
        m["sender_id"] = str(m["sender_id"])
    return jsonify(msgs)

# Outbox for doctor
@message_bp.route("/doctor/outbox", methods=["GET"])
@requires_roles("doctor")
def outbox():
    msgs = get_outbox(request.user_id)
    for m in msgs:
        m["_id"] = str(m["_id"])
    return jsonify(msgs)
