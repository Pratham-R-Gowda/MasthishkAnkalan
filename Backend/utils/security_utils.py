# Backend/utils/security_utils.py
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

# import jwt
# import bcrypt
# import secrets
# from flask import current_app
# from datetime import datetime, timedelta

# def hash_password(password: str) -> str:
#     """Generate bcrypt hash for a given plain password."""
#     if isinstance(password, str):
#         password = password.encode("utf-8")
#     salt = bcrypt.gensalt()
#     hashed = bcrypt.hashpw(password, salt)
#     return hashed.decode("utf-8")


# def verify_password(password: str, hashed: str) -> bool:
#     """Verify plain password against hashed password."""
#     if isinstance(password, str):
#         password = password.encode("utf-8")
#     if isinstance(hashed, str):
#         hashed = hashed.encode("utf-8")
#     return bcrypt.checkpw(password, hashed)

# def make_access_token(sub, extra=None):
#     """
#     Create a signed JWT access token with subject (user_id)
#     and optional extra claims (like role).
#     """
#     payload = {
#         "sub": sub,
#         "exp": datetime.utcnow() + timedelta(seconds=current_app.config["ACCESS_TOKEN_EXPIRES"]),
#         "iat": datetime.utcnow()
#     }
#     if extra:
#         payload.update(extra)

#     token = jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm=current_app.config["JWT_ALGORITHM"])
#     # PyJWT v2+ returns str, v1 returns bytes — normalize
#     if isinstance(token, bytes):
#         token = token.decode("utf-8")
#     return token


# def decode_token(token):
#     """
#     Verify and decode JWT token, returning payload or None if invalid/expired.
#     """
#     try:
#         payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=[current_app.config["JWT_ALGORITHM"]])
#         return payload
#     except jwt.ExpiredSignatureError:
#         print("⚠️ Token expired")
#         return None
#     except jwt.InvalidTokenError:
#         print("⚠️ Invalid token")
#         return None

# def make_refresh_token():
#     """
#     Create a random refresh token and return (token, expiry_timestamp)
#     """
#     expires = datetime.utcnow() + timedelta(seconds=current_app.config["REFRESH_TOKEN_EXPIRES"])
#     token = secrets.token_urlsafe(48)
#     return token, int(expires.timestamp())
