import os
from flask import Flask, jsonify, redirect, url_for
from flask_cors import CORS
from flasgger import Swagger
from sqlalchemy.exc import SQLAlchemyError, OperationalError

from config import Config
from models import db
from routes.auth_routes import auth_bp
from routes.item_routes import items_bp
from flask_migrate import Migrate


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.config["SWAGGER"] = {
        "title": "Back To Way API",
        "uiversion": 3,
    }
    Swagger(app)

    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    # Initialize SQLAlchemy and migrations
    db.init_app(app)
    Migrate(app, db)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(items_bp, url_prefix="/api/items")

    @app.route("/api/health")
    def health():
        return jsonify({"success": True, "message": "Server is running"}), 200

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
        return jsonify({
            "success": False,
            "message": "Database connection failed. Set DATABASE_URL on Render.",
        }), 503

    @app.errorhandler(SQLAlchemyError)
    def database_error(e):
        return jsonify({
            "success": False,
            "message": "Database error. Check DATABASE_URL on Render.",
        }), 503

    return app


if __name__ == "__main__":
    app = create_app()
    print("[OK] Server running on port", os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)), debug=True)

# Expose a module-level `app` for WSGI servers (gunicorn/render)
app = create_app()
