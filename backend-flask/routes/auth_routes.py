from datetime import datetime, timedelta, timezone

import jwt
from flask import Blueprint, current_app, jsonify, request

from models import db, User, user_to_dict
from middleware.auth import token_required

auth_bp = Blueprint("auth", __name__)


def generate_token(user_id):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "id": user_id,
        "exp": now + timedelta(days=current_app.config["JWT_EXPIRATION_DAYS"]),
        "iat": now,
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user.
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - email
            - password
            - phone
          properties:
            name:
              type: string
            email:
              type: string
            password:
              type: string
            phone:
              type: string
    responses:
      201:
        description: User registered successfully, returns JWT token
      400:
        description: Invalid input or user already exists
    """
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    phone = data.get("phone", "").strip()

    if not all([name, email, password, phone]):
        return jsonify({"success": False, "message": "Please provide all required fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "User already exists"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    user = User(name=name, email=email, phone=phone)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id)

    return jsonify({"success": True, "token": token, "user": user_to_dict(user)}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login with email and password.
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
            password:
              type: string
    responses:
      200:
        description: Login successful, returns JWT token
      400:
        description: Invalid input
      401:
        description: Invalid credentials
    """
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Please provide email and password"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    token = generate_token(user.id)

    return jsonify({"success": True, "token": token, "user": user_to_dict(user)}), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me(current_user):
    """
    Get current user info.
    ---
    tags:
      - Auth
    security:
      - BearerAuth: []
    responses:
      200:
        description: Current user info
      401:
        description: Unauthorized
    """
    return jsonify({"success": True, "user": user_to_dict(current_user)}), 200
