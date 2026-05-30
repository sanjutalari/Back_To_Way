import os
from flask import Flask, jsonify, redirect, send_from_directory
from flask_cors import CORS
from flasgger import Swagger
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from werkzeug.middleware.proxy_fix import ProxyFix

from config import Config
from models import db
from routes.auth_routes import auth_bp
from routes.item_routes import items_bp
from flask_migrate import Migrate, upgrade


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec_1",
                "route": "/apispec_1.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs/",
    }
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "Back To Way API",
            "description": "Interactive documentation for the Back To Way backend.",
            "version": "1.0.0",
        },
        "securityDefinitions": {
            "BearerAuth": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": 'Paste the full JWT header value: "Bearer <token>".',
            }
        },
        "schemes": ["https", "http"],
    }
    if app.config.get("SWAGGER_SERVER_URL"):
        swagger_template["host"] = app.config["SWAGGER_SERVER_URL"].replace("https://", "").replace("http://", "").rstrip("/")
        swagger_template["schemes"] = ["https"] if app.config["SWAGGER_SERVER_URL"].startswith("https://") else ["http"]
    def _sanitize_for_js(obj):
        if isinstance(obj, dict):
            return {k: _sanitize_for_js(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [_sanitize_for_js(v) for v in obj]
        if obj is None:
            return ""
        return obj

    sanitized_template = _sanitize_for_js(swagger_template)
    Swagger(app, config=swagger_config, template=sanitized_template)

    CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    # Initialize SQLAlchemy and migrations
    db.init_app(app)
    Migrate(app, db)

    with app.app_context():
        try:
            upgrade()
        except Exception as exc:
            app.logger.warning("Database migration check skipped or failed: %s", exc)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(items_bp, url_prefix="/api/items")

    @app.route("/api/health")
    def health():
        return jsonify({"success": True, "message": "Server is running"}), 200

    @app.route("/api/health/db")
    def database_health():
        db.session.execute(text("SELECT 1"))
        return jsonify({"success": True, "message": "Database connection is healthy"}), 200

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # Redirect root to Swagger UI so the site opens to the API documentation
    @app.route("/")
    def index():
        return redirect("/apidocs/")

    @app.route("/swagger")
    def swagger():
        return redirect("/apidocs/")

    @app.route("/docs")
    def docs():
        return redirect("/apidocs/")

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Route not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    @app.errorhandler(OperationalError)
    def database_timeout(e):
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Database connection failed. Verify DATABASE_URL and run migrations.",
        }), 503

    @app.errorhandler(SQLAlchemyError)
    def database_error(e):
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Database error. Verify DATABASE_URL and migration status.",
        }), 503

    return app


if __name__ == "__main__":
    app = create_app()
    print("[OK] Server running on port", os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)), debug=True)

# Expose a module-level `app` for WSGI servers (gunicorn/render)
app = create_app()
