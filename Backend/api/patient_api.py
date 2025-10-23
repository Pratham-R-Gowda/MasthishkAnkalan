# Backend/api/patient_api.py
from flask import Blueprint, request, jsonify
from ..utils.authorization import requires_roles
from ..models.eeg_model import (
    create_eeg_session, list_eeg_sessions_by_user, get_eeg_session,
    list_ai_results_by_user, list_reports_for_user,
    list_messages_for_user, list_tasks_for_user, update_task_completion
)
from ..models.user_model import find_user_by_id
from ..extensions import get_db
from bson import ObjectId


patient_bp = Blueprint("patient", __name__)

# All patient routes require role patient OR caretaker? but patient endpoints require patient role
@patient_bp.route("/profile", methods=["GET"])
@requires_roles("patient")
def get_profile():
    user_id = request.user_id
    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "not_found"}), 404
    # return sanitized profile
    return jsonify({
        "id": str(user["_id"]),
        "email": user.get("email"),
        "name": user.get("name"),
        "role": user.get("role"),
        "profile": user.get("profile", {}),
    })

@patient_bp.route("/profile", methods=["PUT"], endpoint="profile_update_put")
@requires_roles("patient")
def update_profile_put():
    user_id = request.user_id
    data = request.get_json() or {}
    # only allow certain fields to be updated
    allowed = {"name", "profile"}
    update = {k: data[k] for k in data if k in allowed}
    db = __import__('..extensions', fromlist=['get_db']).get_db()
    db['users'].update_one({"_id": __import__('bson').ObjectId(user_id)}, {"$set": update})
    return jsonify({"ok": True})

# tests
@patient_bp.route("/tests", methods=["GET"])
@requires_roles("patient")
def list_tests():
    user_id = request.user_id
    sessions = list_eeg_sessions_by_user(user_id)
    # convert ids to strings and minimal metadata
    out = []
    for s in sessions:
        out.append({
            "id": str(s["_id"]),
            "status": s.get("status"),
            "created_at": s.get("created_at"),
            "file_uri": s.get("file_uri"),
            "metadata": s.get("metadata", {}),
        })
    return jsonify(out)

@patient_bp.route("/tests", methods=["POST"])
@requires_roles("patient")
def create_test():
    user_id = request.user_id
    data = request.get_json() or {}
    # expected: metadata may include file_uri, notes
    session = create_eeg_session(user_id, data.get("metadata", {}))
    return jsonify({"ok": True, "session_id": str(session["_id"])}), 201

@patient_bp.route("/tests/<session_id>", methods=["GET"])
@requires_roles("patient")
def get_test(session_id):
    session = get_eeg_session(session_id)
    if not session:
        return jsonify({"error": "not_found"}), 404
    return jsonify({
        "id": str(session["_id"]),
        "status": session.get("status"),
        "file_uri": session.get("file_uri"),
        "metadata": session.get("metadata", {}),
        "created_at": session.get("created_at"),
    })

@patient_bp.route("/ai-results", methods=["GET"])
@requires_roles("patient")
def ai_results():
    user_id = request.user_id
    res = list_ai_results_by_user(user_id)
    out = []
    for r in res:
        out.append({
            "id": str(r["_id"]),
            "session_id": str(r.get("session_id")),
            "result": r.get("result"),
            "created_at": r.get("created_at"),
        })
    return jsonify(out)

@patient_bp.route("/reports", methods=["GET"])
@requires_roles("patient")
def reports():
    user_id = request.user_id
    res = list_reports_for_user(user_id)
    out = []
    for rep in res:
        out.append({
            "id": str(rep["_id"]),
            "session_id": str(rep.get("session_id")),
            "doctor_id": str(rep.get("doctor_id")),
            "report": rep.get("report"),
            "created_at": rep.get("created_at"),
        })
    return jsonify(out)

@patient_bp.route("/inbox", methods=["GET"])
@requires_roles("patient")
def inbox():
    user_id = request.user_id
    msgs = list_messages_for_user(user_id)
    out = []
    for m in msgs:
        out.append({
            "id": str(m["_id"]),
            "from_id": str(m.get("from_id")),
            "subject": m.get("subject"),
            "body": m.get("body"),
            "created_at": m.get("created_at"),
            "metadata": m.get("metadata", {}),
        })
    return jsonify(out)

@patient_bp.route("/tasks", methods=["GET"])
@requires_roles("patient")
def tasks():
    user_id = request.user_id
    tasks = list_tasks_for_user(user_id)
    out = []
    for t in tasks:
        out.append({
            "id": str(t["_id"]),
            "task": t.get("task"),
            "assigned_by": str(t.get("assigned_by")),
            "due_date": t.get("due_date"),
            "completed": t.get("completed"),
            "created_at": t.get("created_at"),
        })
    return jsonify(out)

@patient_bp.route("/tasks/<task_id>/complete", methods=["POST"])
@requires_roles("patient")
def complete_task(task_id):
    updated = update_task_completion(task_id, True)
    if not updated:
        return jsonify({"error": "not_found"}), 404
    return jsonify({"ok": True, "task": {
        "id": str(updated["_id"]),
        "completed": updated.get("completed")
    }})

@patient_bp.route("/profile", methods=["PUT"])
@requires_roles("patient")
def update_profile():
    user_id = request.user_id
    data = request.get_json() or {}
    # only allow certain fields to be updated
    allowed = {"name", "profile"}
    update = {k: data[k] for k in data if k in allowed}
    db = get_db()
    db['users'].update_one({"_id": ObjectId(user_id)}, {"$set": update})
    return jsonify({"ok": True})
