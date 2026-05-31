from functools import wraps
from flask import request, jsonify, current_app
import jwt

from models import User


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")

        if auth_header:
            parts = auth_header.strip().split(None, 1)
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1].strip()
            else:
                token = auth_header.strip()

        if not token:
            return jsonify({"success": False, "message": "Missing Authorization header. Use: Bearer <token>"}), 401

        try:
            data = jwt.decode(
                token,
                current_app.config["SECRET_KEY"],
                algorithms=["HS256"],
            )
            user_id = data.get("id") or data.get("sub")
            current_user = User.query.get(int(user_id)) if user_id else None
            if not current_user:
                return jsonify({"success": False, "message": "User not found"}), 401
        except (TypeError, ValueError):
            return jsonify({"success": False, "message": "Invalid token subject"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)

    return decorated
