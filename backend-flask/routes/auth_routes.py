from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

from models import mongo, user_to_dict
from middleware.auth import token_required

auth_bp = Blueprint("auth", __name__)


def generate_token(user_id):
    payload = {
        "id": user_id,
        "exp": datetime.utcnow() + timedelta(days=current_app.config["JWT_EXPIRATION_DAYS"]),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    phone = data.get("phone", "").strip()

    if not all([name, email, password, phone]):
        return jsonify({"success": False, "message": "Please provide all required fields"}), 400

    if mongo.db.users.find_one({"email": email}):
        return jsonify({"success": False, "message": "User already exists"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    user = {
        "name": name,
        "email": email,
        "password_hash": generate_password_hash(password),
        "phone": phone,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = mongo.db.users.insert_one(user)
    user["_id"] = result.inserted_id

    token = generate_token(str(user["_id"]))

    return jsonify({
        "success": True,
        "token": token,
        "user": user_to_dict(user),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Please provide email and password"}), 400

    user = mongo.db.users.find_one({"email": email})

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    token = generate_token(str(user["_id"]))

    return jsonify({
        "success": True,
        "token": token,
        "user": user_to_dict(user),
    }), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me(current_user):
    return jsonify({
        "success": True,
        "user": user_to_dict(current_user),
    }), 200
