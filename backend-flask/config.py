import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _normalize_database_uri(uri):
    if uri and uri.startswith("postgres://"):
        return uri.replace("postgres://", "postgresql://", 1)
    return uri


def _csv_env(name, default):
    raw = os.environ.get(name, default)
    return [value.strip() for value in raw.split(",") if value.strip()]


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "your_jwt_secret_key_here_change_in_production")
    # Database (Postgres) configuration. Set `DATABASE_URL` or `SQLALCHEMY_DATABASE_URI` in production.
    SQLALCHEMY_DATABASE_URI = _normalize_database_uri(
        os.environ.get("SQLALCHEMY_DATABASE_URI")
        or os.environ.get("DATABASE_URL")
        or os.environ.get("POSTGRES_URL")
        or "sqlite:///dev.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": int(os.environ.get("SQLALCHEMY_POOL_RECYCLE", "280")),
    }
    JWT_EXPIRATION_DAYS = int(os.environ.get("JWT_EXPIRATION_DAYS", "7"))
    CORS_ORIGINS = _csv_env(
        "CORS_ORIGINS",
        "http://localhost:5173,https://back-to-way.onrender.com",
    )
    SWAGGER_SERVER_URL = os.environ.get("SWAGGER_SERVER_URL")
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
