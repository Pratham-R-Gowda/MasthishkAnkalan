# Backend/models/message_model.py
from datetime import datetime
from bson import ObjectId
from ..utils.db_utils import get_db

MESSAGES_COLL = "messages"

def create_message(sender_id, sender_role, recipients, subject, body, tasks=None, attachments=None):
    db = get_db()
    msg = {
        "sender_id": ObjectId(sender_id),
        "sender_role": sender_role,
        "recipients": recipients,        # list of {id, role}
        "subject": subject,
        "body": body,
        "tasks": tasks or [],
        "attachments": attachments or [],
        "timestamp": datetime.utcnow(),
        "read": False
    }
    db[MESSAGES_COLL].insert_one(msg)
    return msg

def get_inbox(user_id):
    db = get_db()
    return list(db[MESSAGES_COLL].find({"recipients.id": str(user_id)}).sort("timestamp", -1))

def get_outbox(user_id):
    db = get_db()
    return list(db[MESSAGES_COLL].find({"sender_id": ObjectId(user_id)}).sort("timestamp", -1))
