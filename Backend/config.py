import os
from dotenv import load_dotenv
from datetime import timedelta

class Config:
    # MongoDB connection URI (set in your environment or .env)
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/brainhealthdb")

    # JWT secrets & settings
    JWT_SECRET = os.getenv("JWT_SECRET", "change-this-secret")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRES = int(os.getenv("ACCESS_TOKEN_EXPIRES_SECONDS", 60 * 15))  # 15 minutes
    REFRESH_TOKEN_EXPIRES = int(os.getenv("REFRESH_TOKEN_EXPIRES_SECONDS", 60 * 60 * 24 * 7))  # 7 days

    # Cookie settings for refresh token
    REFRESH_COOKIE_NAME = os.getenv("REFRESH_COOKIE_NAME", "bh_refresh")
    REFRESH_COOKIE_SECURE = os.getenv("REFRESH_COOKIE_SECURE", "False").lower() in ("1", "true", "yes")
    REFRESH_COOKIE_SAMESITE = os.getenv("REFRESH_COOKIE_SAMESITE", "Lax")
    REFRESH_COOKIE_HTTPONLY = True

    # Misc
    PASSWORD_HASH_SCHEME = "bcrypt"
