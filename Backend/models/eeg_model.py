# Backend/models/eeg_model.py
from datetime import datetime
from bson import ObjectId
from ..extensions import get_db

EEG_COLL = "eeg_sessions"
AI_COLL = "ai_results"
REPORTS_COLL = "reports"
TASKS_COLL = "tasks"
MESSAGES_COLL = "messages"

def _now():
    return datetime.utcnow()

# --- EEG sessions ---
def create_eeg_session(user_id, metadata: dict = None):
    db = get_db()
    rec = {
        "user_id": ObjectId(user_id),
        "metadata": metadata or {},
        "file_uri": (metadata or {}).get("file_uri"),
        "status": (metadata or {}).get("status", "uploaded"),
        "created_at": _now(),
        "updated_at": _now(),
    }
    res = db[EEG_COLL].insert_one(rec)
    rec["_id"] = res.inserted_id
    return rec

def list_eeg_sessions_by_user(user_id, limit=50):
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        return []
    cursor = db[EEG_COLL].find({"user_id": oid}).sort("created_at", -1).limit(limit)
    return list(cursor)

def get_eeg_session(session_id):
    db = get_db()
    try:
        oid = ObjectId(session_id)
    except Exception:
        return None
    return db[EEG_COLL].find_one({"_id": oid})

# --- AI results ---
def create_ai_result(session_id, result: dict):
    db = get_db()
    rec = {
        "session_id": ObjectId(session_id),
        "result": result,
        "created_at": _now(),
    }
    res = db[AI_COLL].insert_one(rec)
    rec["_id"] = res.inserted_id
    return rec

def list_ai_results_by_user(user_id, limit=50):
    db = get_db()
    try:
        user_oid = ObjectId(user_id)
    except Exception:
        return []
    # get session ids owned by user
    sessions = db[EEG_COLL].find({"user_id": user_oid}, {"_id": 1})
    sids = [s["_id"] for s in sessions]
    if not sids:
        return []
    return list(db[AI_COLL].find({"session_id": {"$in": sids}}).sort("created_at", -1).limit(limit))

# --- Reports (doctor reviews / prescriptions) ---
def create_report(session_id, doctor_id, report_body: dict):
    db = get_db()
    rec = {
        "session_id": ObjectId(session_id),
        "doctor_id": ObjectId(doctor_id),
        "report": report_body,
        "created_at": _now(),
    }
    res = db[REPORTS_COLL].insert_one(rec)
    rec["_id"] = res.inserted_id
    return rec

def list_reports_for_user(user_id, limit=50):
    db = get_db()
    try:
        user_oid = ObjectId(user_id)
    except Exception:
        return []
    sessions = db[EEG_COLL].find({"user_id": user_oid}, {"_id": 1})
    sids = [s["_id"] for s in sessions]
    if not sids:
        return []
    return list(db[REPORTS_COLL].find({"session_id": {"$in": sids}}).sort("created_at", -1).limit(limit))

# --- Tasks ---
def create_task(user_id, assigned_by_id, task_body: dict, due_date=None):
    db = get_db()
    rec = {
        "user_id": ObjectId(user_id),
        "assigned_by": ObjectId(assigned_by_id),
        "task": task_body,
        "due_date": due_date,
        "completed": False,
        "created_at": _now(),
    }
    res = db[TASKS_COLL].insert_one(rec)
    rec["_id"] = res.inserted_id
    return rec

def list_tasks_for_user(user_id, limit=100):
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        return []
    return list(db[TASKS_COLL].find({"user_id": oid}).sort("created_at", -1).limit(limit))

def update_task_completion(task_id, completed: bool):
    db = get_db()
    try:
        tid = ObjectId(task_id)
    except Exception:
        return None
    db[TASKS_COLL].update_one({"_id": tid}, {"$set": {"completed": bool(completed), "updated_at": _now()}})
    return db[TASKS_COLL].find_one({"_id": tid})

# --- Messages (inbox/outbox) ---
def send_message(from_id, to_id, subject, body, metadata=None):
    db = get_db()
    rec = {
        "from_id": ObjectId(from_id),
        "to_id": ObjectId(to_id),
        "subject": subject,
        "body": body,
        "metadata": metadata or {},
        "read": False,
        "created_at": _now(),
    }
    res = db[MESSAGES_COLL].insert_one(rec)
    rec["_id"] = res.inserted_id
    return rec

def list_messages_for_user(user_id, limit=200):
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        return []
    return list(db[MESSAGES_COLL].find({"to_id": oid}).sort("created_at", -1).limit(limit))

def list_messages_from_user(user_id, limit=200):
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        return []
    return list(db[MESSAGES_COLL].find({"from_id": oid}).sort("created_at", -1).limit(limit))
