# Backend/utils/authorization.py
from functools import wraps
from flask import request, jsonify
from ..utils.security_utils import decode_token

def requires_roles(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            auth = request.headers.get("Authorization", "")
            if not auth.startswith("Bearer "):
                return jsonify({"error": "missing_token"}), 401
            token = auth.split(" ", 1)[1].strip()
            payload = decode_token(token)
            if not payload:
                return jsonify({"error": "invalid_token"}), 401
            role = payload.get("role") or payload.get("role")
            # Allow if payload role is in allowed_roles
            if allowed_roles and role not in allowed_roles:
                return jsonify({"error": "forbidden"}), 403
            # attach user id to request context if needed
            request.user_id = payload.get("sub")
            request.user_role = role
            return f(*args, **kwargs)
        return wrapped
    return decorator
