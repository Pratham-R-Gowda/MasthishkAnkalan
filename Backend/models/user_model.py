from datetime import datetime, timedelta
from bson import ObjectId
from flask import current_app
from ..utils.security_utils import hash_password, verify_password, make_refresh_token
from ..extensions import get_db

USERS_COLL = "users"
REFRESH_COLL = "refresh_tokens"

def _now():
    return datetime.utcnow()

def create_user(email: str, password: str, name: str, role: str, extra_profile: dict = None):
    """
    Creates a user document. role: 'patient'|'doctor'|'caretaker'|'admin'
    Doctors are created with verified=False by default (manual approval required).
    extra_profile may contain role specific fields: license_no, linked_patient_id, etc.
    """
    db = get_db()
    users = db[USERS_COLL]
    email_norm = email.strip().lower()
    if users.find_one({"email": email_norm}):
        raise ValueError("email_already_exists")
    
    profile = extra_profile.copy() if extra_profile else {}
    # top-level convenience fields
    license_no = profile.get("license_no")
    linked_patient_ids = profile.get("linked_patient_ids", [])

    # set verified flag
    verified = False if role == "doctor" else True


    user_doc = {
        "email": email_norm,
        "password_hash": hash_password(password),
        "name": name,
        "role": role,
        "profile": profile,
        "license_no": license_no,
        "linked_patient_ids": linked_patient_ids,
        "verified": verified,
        "email_verified": False,
        "created_at": _now(),
        "updated_at": _now(),
    }
    res = users.insert_one(user_doc)
    user_doc["_id"] = res.inserted_id
    # remove password_hash from returned doc for safety
    user_doc.pop("password_hash", None)
    return user_doc
   

def find_user_by_email(email: str):
    db = get_db()
    return db[USERS_COLL].find_one({"email": email.strip().lower()})

def find_user_by_id(user_id):
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    return db[USERS_COLL].find_one({"_id": oid})

def check_password_and_get_user(email: str, password: str):
    user = find_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.get("password_hash", "")):
        return None
    # remove password_hash before returning
    user.pop("password_hash", None)
    return user

def save_refresh_token(user_id, token: str, expires_unix: int):
    db = get_db()
    rec = {
        "user_id": ObjectId(user_id),
        "token": token,
        "expires_at": datetime.utcfromtimestamp(expires_unix),
        "created_at": _now(),
    }
    db[REFRESH_COLL].insert_one(rec)
    return True

def revoke_refresh_token(token: str):
    db = get_db()
    res = db[REFRESH_COLL].delete_many({"token": token})
    return res.deleted_count

def revoke_all_user_refresh_tokens(user_id):
    db = get_db()
    res = db[REFRESH_COLL].delete_many({"user_id": ObjectId(user_id)})
    return res.deleted_count

def validate_refresh_token(token: str):
    db = get_db()
    now = datetime.utcnow()
    rec = db[REFRESH_COLL].find_one({"token": token})
    if not rec:
        return None
    if rec.get("expires_at") < now:
        # expired -> remove
        db[REFRESH_COLL].delete_one({"_id": rec["_id"]})
        return None
    user = db[USERS_COLL].find_one({"_id": rec["user_id"]})
    if user:
        user.pop("password_hash", None)
    return user

    # return the associated user document

    # return db[USERS_COLL].find_one({"_id": rec["user_id"]})
