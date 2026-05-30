import os
from flask import Flask, jsonify, redirect, url_for
from flask_cors import CORS

from config import Config
from models import mongo
from routes.auth_routes import auth_bp
from routes.item_routes import items_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    mongo.init_app(app)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(items_bp, url_prefix="/api/items")

    @app.route("/api/health")
    def health():
        return jsonify({"success": True, "message": "Server is running"}), 200

    # Redirect root to health endpoint so visiting the site root shows service status
    @app.route("/")
    def index():
        return redirect(url_for('health'))

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Route not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    print("[OK] Server running on port", os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)), debug=True)

# Expose a module-level `app` for WSGI servers (gunicorn/render)
app = create_app()
