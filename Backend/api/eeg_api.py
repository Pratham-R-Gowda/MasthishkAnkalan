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

# EEG session: store minimal metadata (owner user_id, uploaded_at, file_uri optional, status)
def create_eeg_session(user_id, metadata: dict):
    db = get_db()
    rec = {
        "user_id": ObjectId(user_id),
        "metadata": metadata or {},
        "file_uri": metadata.get("file_uri"),
        "status": metadata.get("status", "uploaded"),  # uploaded, processing, done
        "created_at": _now(),
    }
    res = db[EEG_COLL].insert_one(rec)
    rec["_id"] = res.inserted_id
    return rec

def list_eeg_sessions_by_user(user_id, limit=50):
    db = get_db()
    return list(db[EEG_COLL].find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(limit))

def get_eeg_session(session_id):
    db = get_db()
    try:
        oid = ObjectId(session_id)
    except Exception:
        return None
    return db[EEG_COLL].find_one({"_id": oid})

# AI results referencing session
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
    # join-like: find sessions for user then results
    sessions = db[EEG_COLL].find({"user_id": ObjectId(user_id)}, {"_id": 1})
    sids = [s["_id"] for s in sessions]
    if not sids:
        return []
    return list(db[AI_COLL].find({"session_id": {"$in": sids}}).sort("created_at", -1).limit(limit))

# reports: doctor reviews, prescriptions
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
    # find sessions for user
    sessions = db[EEG_COLL].find({"user_id": ObjectId(user_id)}, {"_id": 1})
    sids = [s["_id"] for s in sessions]
    if not sids:
        return []
    return list(db[REPORTS_COLL].find({"session_id": {"$in": sids}}).sort("created_at", -1).limit(limit))

# Tasks: assigned to user (by doctor or caretaker)
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

def list_tasks_for_user(user_id):
    db = get_db()
    return list(db[TASKS_COLL].find({"user_id": ObjectId(user_id)}).sort("created_at", -1))

def update_task_completion(task_id, completed: bool):
    db = get_db()
    try:
        oid = ObjectId(task_id)
    except Exception:
        return None
    db[TASKS_COLL].update_one({"_id": oid}, {"$set": {"completed": bool(completed)}})
    return db[TASKS_COLL].find_one({"_id": oid})

# Messages (inbox/outbox) - support both directions
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

def list_messages_for_user(user_id, limit=100):
    db = get_db()
    return list(db[MESSAGES_COLL].find({"to_id": ObjectId(user_id)}).sort("created_at", -1).limit(limit))

def list_messages_from_user(user_id, limit=100):
    db = get_db()
    return list(db[MESSAGES_COLL].find({"from_id": ObjectId(user_id)}).sort("created_at", -1).limit(limit))
