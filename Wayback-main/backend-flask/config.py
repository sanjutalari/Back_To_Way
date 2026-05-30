import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "your_jwt_secret_key_here_change_in_production")
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/uni_lost_found")
    JWT_EXPIRATION_DAYS = 7
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
