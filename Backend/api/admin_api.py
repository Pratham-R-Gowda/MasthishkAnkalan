from flask import Blueprint, request, jsonify
from ..models.user_model import find_user_by_id, get_db
from ..utils.authorization import requires_roles
from bson import ObjectId

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/verify-doctor/<user_id>", methods=["POST"])
@requires_roles("admin")
def verify_doctor(user_id):
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        return jsonify({"error": "invalid_user_id"}), 400

    res = db["users"].update_one({"_id": oid, "role": "doctor"}, {"$set": {"verified": True}})
    if res.matched_count == 0:
        return jsonify({"error": "doctor_not_found"}), 404
    return jsonify({"ok": True, "message": "doctor_verified"})
