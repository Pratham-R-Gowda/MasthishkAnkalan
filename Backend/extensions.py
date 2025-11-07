# Backend/extensions.py
from pymongo import MongoClient
from flask import current_app, g

def get_db():
    """
    Return the pymongo database instance from the app config.
    Use `with app.app_context(): db = get_db()` or call from request context.
    """
    if 'mongo_client' not in g:
        mongo_uri = current_app.config['MONGO_URI']
        g.mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Optionally select a DB name from the URI or explicitly:
        g.db = g.mongo_client.get_database('MasthishkAnkalan')  
    return g.db

def close_db(e=None):
    client = g.pop('mongo_client', None)
    if client is not None:
        client.close()
