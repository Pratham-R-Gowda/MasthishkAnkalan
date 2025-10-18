# Backend/api/auth_api.py
from flask import Blueprint, request, jsonify, current_app, make_response
from ..models.user_model import (
    create_user, check_password_and_get_user, save_refresh_token,
    make_refresh_token as model_make_refresh_token, revoke_refresh_token,
    validate_refresh_token, find_user_by_id, revoke_all_user_refresh_tokens
)
from ..utils.security_utils import make_access_token, decode_token

auth_bp = Blueprint("auth", __name__)

# Register
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name", "")
    role = data.get("role", "patient")
    extra_profile = data.get("profile", {})

    if not email or not password:
        return jsonify({"error": "email_and_password_required"}), 400

    # role-specific validation
    if role == "doctor":
        # require license_no
        if not extra_profile.get("license_no"):
            return jsonify({"error": "doctor_license_required"}), 400

    try:
        user = create_user(email=email, password=password, name=name, role=role, extra_profile=extra_profile)
    except ValueError as e:
        if str(e) == "email_already_exists":
            return jsonify({"error": "email_already_exists"}), 400
        return jsonify({"error": "cannot_create_user"}), 500

    message = "account_created"
    if role == "doctor":
        message = "doctor_account_created_pending_verification"
    return jsonify({"ok": True, "user_id": str(user["_id"]), "message": message}), 201

# Login
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "email_and_password_required"}), 400

    user = check_password_and_get_user(email, password)
    if not user:
        return jsonify({"error": "invalid_credentials"}), 401

    access_token = make_access_token(sub=str(user["_id"]), extra={"role": user.get("role")})
    refresh_token, expires_unix = model_make_refresh_token()
    save_refresh_token(str(user["_id"]), refresh_token, expires_unix)

    cfg = current_app.config
    resp = jsonify({
        "access_token": access_token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name"),
            "role": user.get("role"),
            "verified": user.get("verified", False),
        }
    })
    resp.set_cookie(cfg["REFRESH_COOKIE_NAME"], refresh_token,
                    max_age=cfg["REFRESH_TOKEN_EXPIRES"],
                    secure=cfg["REFRESH_COOKIE_SECURE"],
                    httponly=cfg["REFRESH_COOKIE_HTTPONLY"],
                    samesite=cfg["REFRESH_COOKIE_SAMESITE"])
    return resp

# Refresh (unchanged behaviour except user includes verified)
@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    cfg = current_app.config
    cookie_name = cfg["REFRESH_COOKIE_NAME"]
    token = request.cookies.get(cookie_name) or (request.get_json(silent=True) and request.get_json().get("refresh_token"))
    if not token:
        return jsonify({"error": "no_refresh_token"}), 401

    user = validate_refresh_token(token)
    if not user:
        return jsonify({"error": "invalid_or_expired_refresh_token"}), 401

    revoke_refresh_token(token)
    new_refresh, expires_unix = model_make_refresh_token()
    save_refresh_token(str(user["_id"]), new_refresh, expires_unix)

    access_token = make_access_token(sub=str(user["_id"]), extra={"role": user.get("role")})

    resp = jsonify({"access_token": access_token, "user": {"id": str(user["_id"]), "email": user["email"], "role": user.get("role"), "verified": user.get("verified", False)}})
    resp.set_cookie(cfg["REFRESH_COOKIE_NAME"], new_refresh,
                    max_age=cfg["REFRESH_TOKEN_EXPIRES"],
                    secure=cfg["REFRESH_COOKIE_SECURE"],
                    httponly=cfg["REFRESH_COOKIE_HTTPONLY"],
                    samesite=cfg["REFRESH_COOKIE_SAMESITE"])
    return resp

# Logout (same)
@auth_bp.route("/logout", methods=["POST"])
def logout():
    cfg = current_app.config
    cookie_name = cfg["REFRESH_COOKIE_NAME"]
    token = request.cookies.get(cookie_name)
    if token:
        revoke_refresh_token(token)
    resp = make_response(jsonify({"ok": True}))
    resp.set_cookie(cookie_name, "", expires=0)
    return resp

# Me (unchanged except returns verified)
@auth_bp.route("/me", methods=["GET"])
def me():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "missing_token"}), 401
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    if not payload:
        return jsonify({"error": "invalid_token"}), 401
    user = find_user_by_id(payload.get("sub"))
    if not user:
        return jsonify({"error": "not_found"}), 404
    return jsonify({
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name"),
        "role": user.get("role"),
        "verified": user.get("verified", False),
    })

