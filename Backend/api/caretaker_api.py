# Backend/api/caretaker_api.py
from flask import Blueprint, request, jsonify
from ..utils.authorization import requires_roles
from ..models.user_model import find_user_by_id
from ..models.eeg_model import list_messages_for_user, list_tasks_for_user, create_task
from bson import ObjectId
from ..extensions import get_db
from ..models.eeg_model import clear_inbox_for_user

caretaker_bp = Blueprint("caretaker", __name__)

@caretaker_bp.route("/profile", methods=["GET"])
@requires_roles("caretaker")
def profile():
    user = find_user_by_id(request.user_id)
    if not user:
        return jsonify({"error": "not_found"}), 404
    # show linked patients in profile.profile.linked_patient_ids
    return jsonify({
        "id": str(user["_id"]),
        "email": user.get("email"),
        "name": user.get("name"),
        "linked_patient_ids": user.get("linked_patient_ids", []),
        "profile": user.get("profile", {}),
    })

@caretaker_bp.route("/inbox", methods=["GET"])
@requires_roles("caretaker")
def inbox():
    msgs = list_messages_for_user(request.user_id)
    out = []
    for m in msgs:
        out.append({
            "id": str(m["_id"]),
            "from_id": str(m.get("from_id")),
            "subject": m.get("subject"),
            "body": m.get("body"),
            "created_at": m.get("created_at"),
        })
    return jsonify(out)

# @caretaker_bp.route("/tasks", methods=["GET"])
# @requires_roles("caretaker")
# def tasks():
#     # Option: return tasks for linked patients + own tasks
#     user = find_user_by_id(request.user_id)
#     linked = user.get("linked_patient_ids", [])
#     tasks = []
#     for pid in linked:
#         tasks.extend(list_tasks_for_user(str(pid)))
#     # also include own tasks if any:
#     tasks.extend(list_tasks_for_user(request.user_id))
#     # normalize
#     out = []
#     for t in tasks:
#         out.append({
#             "id": str(t["_id"]),
#             "user_id": str(t.get("user_id")),
#             "task": t.get("task"),
#             "completed": t.get("completed"),
#             "created_at": t.get("created_at")
#         })
#     return jsonify(out)

# @caretaker_bp.route("/tasks", methods=["POST"])
# @requires_roles("caretaker")
# def create_task_for_patient():
#     data = request.get_json() or {}
#     patient_id = data.get("patient_id")
#     task_body = data.get("task")
#     due_date = data.get("due_date")
#     if not patient_id or not task_body:
#         return jsonify({"error": "patient_id_and_task_required"}), 400
#     rec = create_task(patient_id, request.user_id, task_body, due_date)
#     return jsonify({"ok": True, "task_id": str(rec["_id"])})

@caretaker_bp.route("/tasks", methods=["GET"])
@requires_roles("caretaker")
def get_tasks():
    user = find_user_by_id(request.user_id)
    linked = user.get("linked_patient_ids", []) or []
    tasks = []

    for pid in linked:
        tasks.extend(list_tasks_for_user(str(pid)))

    tasks.extend(list_tasks_for_user(request.user_id))

    out = []
    for t in tasks:
        out.append({
            "id": str(t["_id"]),
            "user_id": str(t.get("user_id")),
            "task": t.get("task"),
            "completed": t.get("completed", False),
            "due_date": t.get("due_date"),
            "created_at": t.get("created_at")
        })
    return jsonify(out)


@caretaker_bp.route("/tasks", methods=["POST"])
@requires_roles("caretaker")
def create_task_for_patient():
    data = request.get_json() or {}
    patient_id = data.get("patient_id")
    task_body = data.get("task")
    due_date = data.get("due_date")

    if not patient_id or not task_body:
        return jsonify({"error": "patient_id_and_task_required"}), 400

    rec = create_task(patient_id, request.user_id, task_body, due_date)
    return jsonify({"ok": True, "task_id": str(rec["_id"])})


@caretaker_bp.route("/profile", methods=["PUT"])
@requires_roles("caretaker")
def caretaker_profile_update():
    db = get_db()
    data = request.get_json() or {}
    allowed = {"name", "linked_patient_ids"}
    update = {k: data[k] for k in data if k in allowed}
    if "linked_patient_ids" in update and not isinstance(update["linked_patient_ids"], list):
        return jsonify({"error": "linked_patient_ids_must_be_list"}), 400
    db["users"].update_one({"_id": ObjectId(request.user_id)}, {"$set": update})
    return jsonify({"ok": True})

@caretaker_bp.route("/inbox/clear", methods=["POST"])
@requires_roles("caretaker")
def caretaker_clear_inbox():
    deleted = clear_inbox_for_user(request.user_id)
    return jsonify({"ok": True, "deleted": deleted})

@caretaker_bp.route("/settings", methods=["GET", "PUT"])
@requires_roles("caretaker")
def caretaker_settings():
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