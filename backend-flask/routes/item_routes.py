import os
import re
import uuid
from datetime import datetime

from bson.objectid import ObjectId
from flask import Blueprint, current_app, jsonify, request

from middleware.auth import token_required
from models import generate_tracking_id, item_to_dict, mongo

items_bp = Blueprint("items", __name__)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_upload(file):
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit(".", 1)[1].lower()
        filename = f"image-{uuid.uuid4().hex}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.{ext}"
        filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        return f"/uploads/{filename}"
    return None


@items_bp.route("", methods=["GET"])
def get_items():
    """
    Get all active items.
    ---
    tags:
      - Items
    responses:
      200:
        description: List of items
    """
    items = list(mongo.db.items.find().sort("created_at", -1))
    return (
        jsonify(
            {
                "success": True,
                "count": len(items),
                "items": [item_to_dict(item) for item in items],
            }
        ),
        200,
    )


@items_bp.route("/search", methods=["GET"])
def search_items():
    """
    Search items by keyword, category, or type.
    ---
    tags:
      - Items
    parameters:
      - in: query
        name: keyword
        type: string
      - in: query
        name: category
        type: string
      - in: query
        name: type
        type: string
    responses:
      200:
        description: Matching items
    """
    keyword = request.args.get("keyword", "").strip()
    category = request.args.get("category", "").strip()
    item_type = request.args.get("type", "").strip()

    query = {"status": "Active"}

    if keyword:
        pattern = re.compile(re.escape(keyword), re.IGNORECASE)
        query["$or"] = [
            {"title": {"$regex": pattern}},
            {"description": {"$regex": pattern}},
        ]

    if category:
        query["category"] = category

    if item_type:
        query["type"] = item_type

    items = list(mongo.db.items.find(query).sort("created_at", -1))

    return (
        jsonify(
            {
                "success": True,
                "count": len(items),
                "items": [item_to_dict(item) for item in items],
            }
        ),
        200,
    )


@items_bp.route("/my-items", methods=["GET"])
@token_required
def get_user_items(current_user):
    """
    Get items created by the logged-in user.
    ---
    tags:
      - Items
    responses:
      200:
        description: User items
      401:
        description: Unauthorized
    """
    items = list(mongo.db.items.find({"user_id": str(current_user["_id"])}).sort("created_at", -1))
    return (
        jsonify(
            {
                "success": True,
                "count": len(items),
                "items": [item_to_dict(item, include_user=False) for item in items],
            }
        ),
        200,
    )


@items_bp.route("", methods=["POST"])
@token_required
def create_item(current_user):
    """
    Create a new item.
    ---
    tags:
      - Items
    consumes:
      - application/json
      - multipart/form-data
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - title
            - category
            - type
            - incidentDate
          properties:
            title:
              type: string
            category:
              type: string
            type:
              type: string
            incidentDate:
              type: string
            description:
              type: string
    responses:
      201:
        description: Item created
      400:
        description: Invalid input
      401:
        description: Unauthorized
    """
    if "image" in request.files:
        data = request.form
    else:
        data = request.get_json() or {}

    title = data.get("title", "").strip()
    category = data.get("category", "").strip()
    item_type = data.get("type", "").strip()
    incident_date = data.get("incidentDate", "").strip()
    description = data.get("description", "").strip()

    if not all([title, category, item_type, incident_date]):
        return jsonify({"success": False, "message": "Please provide title, category, type, and date"}), 400

    try:
        parsed_date = datetime.strptime(incident_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"success": False, "message": "Invalid date format. Use YYYY-MM-DD"}), 400

    now = datetime.utcnow()

    item = {
        "user_id": str(current_user["_id"]),
        "title": title,
        "description": description,
        "category": category,
        "type": item_type,
        "incident_date": parsed_date,
        "image_path": None,
        "tracking_id": generate_tracking_id(),
        "status": "Active",
        "created_at": now,
        "updated_at": now,
    }

    if "image" in request.files:
        file = request.files["image"]
        image_path = save_upload(file)
        if image_path:
            item["image_path"] = image_path

    result = mongo.db.items.insert_one(item)
    item["_id"] = result.inserted_id

    return (
        jsonify(
            {
                "success": True,
                "message": "Item created successfully",
                "item": item_to_dict(item),
            }
        ),
        201,
    )


@items_bp.route("/<item_id>", methods=["GET"])
def get_item_by_id(item_id):
    """
    Get an item by ID.
    ---
    tags:
      - Items
    parameters:
      - in: path
        name: item_id
        required: true
        type: string
    responses:
      200:
        description: Item details
      400:
        description: Invalid item ID
      404:
        description: Item not found
    """
    try:
        item = mongo.db.items.find_one({"_id": ObjectId(item_id)})
    except Exception:
        return jsonify({"success": False, "message": "Invalid item ID"}), 400

    if not item:
        return jsonify({"success": False, "message": "Item not found"}), 404

    return (
        jsonify(
            {
                "success": True,
                "item": item_to_dict(item),
            }
        ),
        200,
    )


@items_bp.route("/<item_id>/resolve", methods=["PATCH"])
@token_required
def resolve_item(current_user, item_id):
    """
    Toggle an item between Active and Resolved.
    ---
    tags:
      - Items
    parameters:
      - in: path
        name: item_id
        required: true
        type: string
    responses:
      200:
        description: Item status updated
      400:
        description: Invalid item ID
      403:
        description: Not authorized
      404:
        description: Item not found
    """
    try:
        item = mongo.db.items.find_one({"_id": ObjectId(item_id)})
    except Exception:
        return jsonify({"success": False, "message": "Invalid item ID"}), 400

    if not item:
        return jsonify({"success": False, "message": "Item not found"}), 404

    if item["user_id"] != str(current_user["_id"]):
        return jsonify({"success": False, "message": "Not authorized to resolve this item"}), 403

    new_status = "Resolved" if item["status"] == "Active" else "Active"
    mongo.db.items.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}},
    )
    item["status"] = new_status
    item["updated_at"] = datetime.utcnow()

    return (
        jsonify(
            {
                "success": True,
                "message": f"Item status updated to {new_status}",
                "item": item_to_dict(item),
            }
        ),
        200,
    )


@items_bp.route("/<item_id>", methods=["PUT"])
@token_required
def update_item(current_user, item_id):
    """
    Update an item.
    ---
    tags:
      - Items
    parameters:
      - in: path
        name: item_id
        required: true
        type: string
    responses:
      200:
        description: Item updated
      400:
        description: Invalid item ID
      403:
        description: Not authorized
      404:
        description: Item not found
    """
    try:
        item = mongo.db.items.find_one({"_id": ObjectId(item_id)})
    except Exception:
        return jsonify({"success": False, "message": "Invalid item ID"}), 400

    if not item:
        return jsonify({"success": False, "message": "Item not found"}), 404

    if item["user_id"] != str(current_user["_id"]):
        return jsonify({"success": False, "message": "Not authorized to update this item"}), 403

    if "image" in request.files:
        data = request.form
    else:
        data = request.get_json() or {}

    update = {}
    if data.get("title"):
        update["title"] = data["title"].strip()
    if data.get("description") is not None:
        update["description"] = data["description"].strip()
    if data.get("category"):
        update["category"] = data["category"].strip()
    if data.get("type"):
        update["type"] = data["type"].strip()
    if data.get("incidentDate"):
        try:
            update["incident_date"] = datetime.strptime(data["incidentDate"].strip(), "%Y-%m-%d")
        except ValueError:
            pass

    if "image" in request.files:
        file = request.files["image"]
        image_path = save_upload(file)
        if image_path:
            update["image_path"] = image_path

    if update:
        update["updated_at"] = datetime.utcnow()
        mongo.db.items.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": update},
        )
        item.update(update)

    return (
        jsonify(
            {
                "success": True,
                "message": "Item updated successfully",
                "item": item_to_dict(item),
            }
        ),
        200,
    )


@items_bp.route("/<item_id>", methods=["DELETE"])
@token_required
def delete_item(current_user, item_id):
    """
    Delete an item.
    ---
    tags:
      - Items
    parameters:
      - in: path
        name: item_id
        required: true
        type: string
    responses:
      200:
        description: Item deleted
      400:
        description: Invalid item ID
      403:
        description: Not authorized
      404:
        description: Item not found
    """
    try:
        item = mongo.db.items.find_one({"_id": ObjectId(item_id)})
    except Exception:
        return jsonify({"success": False, "message": "Invalid item ID"}), 400

    if not item:
        return jsonify({"success": False, "message": "Item not found"}), 404

    if item["user_id"] != str(current_user["_id"]):
        return jsonify({"success": False, "message": "Not authorized to delete this item"}), 403

    mongo.db.items.delete_one({"_id": ObjectId(item_id)})

    return jsonify({"success": True, "message": "Item deleted successfully"}), 200
