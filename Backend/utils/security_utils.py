import os
import secrets
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError

from flask import current_app

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def make_access_token(sub: str, extra: dict = None) -> str:
    cfg = current_app.config
    now = datetime.utcnow()
    payload = {
        "sub": str(sub),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=cfg["ACCESS_TOKEN_EXPIRES"])).timestamp())
    }
    if extra:
        payload.update(extra)
    token = jwt.encode(payload, cfg["JWT_SECRET"], algorithm=cfg["JWT_ALGORITHM"])
    return token

def make_refresh_token() -> tuple[str, int]:
    """
    Return a secure random token and expiry timestamp (unix seconds)
    We'll store the token (or hash of token) server-side tied to user.
    """
    cfg = current_app.config
    token = secrets.token_urlsafe(64)
    expiry = int((datetime.utcnow() + timedelta(seconds=cfg["REFRESH_TOKEN_EXPIRES"])).timestamp())
    return token, expiry

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=[current_app.config["JWT_ALGORITHM"]])
        return payload
    except JWTError:
        return None
