import os
from flask import Flask, jsonify, redirect, send_from_directory, request
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
                "description": 'Include the full Authorization header value including the "Bearer " prefix. Example: "Bearer <token>" (include the word Bearer and a space before the token).',
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
        return redirect("/safe-apidocs/")

    @app.route("/swagger")
    def swagger():
        return redirect("/safe-apidocs/")

    @app.route("/docs")
    def docs():
                return redirect("/safe-apidocs/")

        # Serve a minimal, safe Swagger UI page that fetches the generated spec.
        @app.route('/safe-apidocs/')
        def safe_apidocs():
                html = '''<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Back To Way API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
        <script>
            window.onload = function() {
                const ui = SwaggerUIBundle({
                    url: '/apispec_1.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [SwaggerUIBundle.presets.apis],
                    layout: 'BaseLayout',
                    validatorUrl: null
                });
                window.ui = ui;
            };
        </script>
    </body>
</html>'''
                return html, 200, {'Content-Type': 'text/html'}

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

    @app.after_request
    def sanitize_apidocs_response(response):
        try:
            p = getattr(request, 'path', '')
            if p.startswith('/apidocs') or p == '/apispec_1.json':
                ctype = response.content_type or ''
                if 'application/json' in ctype or 'text/html' in ctype:
                    text = response.get_data(as_text=True)
                    if 'None' in text:
                        text = text.replace('None', '""')
                        response.set_data(text)
                        response.headers['Content-Length'] = str(len(text.encode('utf-8')))
        except Exception:
            pass
        return response

    return app


if __name__ == "__main__":
    app = create_app()
    print("[OK] Server running on port", os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)), debug=True)

# Expose a module-level `app` for WSGI servers (gunicorn/render)
app = create_app()
