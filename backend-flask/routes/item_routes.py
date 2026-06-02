import os
import re
import uuid
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import or_

from middleware.auth import token_required
from models import db, Item, VerificationSearch, generate_tracking_id, item_to_dict

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


def _normalize_identifier(value):
  return (value or "").strip()


def _item_payload(data):
  return {
    "title": data.get("title", "").strip(),
    "category": data.get("category", "").strip(),
    "type": data.get("type", "").strip(),
    "incident_date": data.get("incidentDate", "").strip(),
    "description": data.get("description", "").strip(),
    "brand": _normalize_identifier(data.get("brand")),
    "model_number": _normalize_identifier(data.get("modelNumber") or data.get("model_number")),
    "serial_number": _normalize_identifier(data.get("serialNumber") or data.get("serial_number")),
    "imei": _normalize_identifier(data.get("imei")),
    "product_id": _normalize_identifier(data.get("productId") or data.get("product_id")),
    "last_seen_location": _normalize_identifier(data.get("lastSeenLocation") or data.get("last_seen_location")),
  }


def _apply_device_fields(item, payload):
  item.brand = payload["brand"]
  item.model_number = payload["model_number"]
  item.serial_number = payload["serial_number"]
  item.imei = payload["imei"]
  item.product_id = payload["product_id"]
  item.last_seen_location = payload["last_seen_location"]


def _verification_query(params):
  query = Item.query.filter(Item.status == "Active", Item.type.in_(["Lost", "Stolen"]))
  clauses = []
  if params["imei"]:
    clauses.append(Item.imei == params["imei"])
  if params["serial_number"]:
    clauses.append(Item.serial_number == params["serial_number"])
  if params["model_number"]:
    clauses.append(Item.model_number == params["model_number"])
  if params["product_id"]:
    clauses.append(Item.product_id == params["product_id"])
  return query.filter(or_(*clauses)) if clauses else None


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
    items = Item.query.filter_by(status="Active").order_by(Item.created_at.desc()).all()
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

    query = Item.query.filter_by(status="Active")

    if keyword:
      like = f"%{keyword}%"
      query = query.filter((Item.title.ilike(like)) | (Item.description.ilike(like)))

    if category:
      query = query.filter_by(category=category)

    if item_type:
      query = query.filter(Item.type.ilike(item_type))

    items = query.order_by(Item.created_at.desc()).all()

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
    security:
      - BearerAuth: []
    responses:
      200:
        description: User items
      401:
        description: Unauthorized
    """
    items = Item.query.filter_by(user_id=current_user.id).order_by(Item.created_at.desc()).all()
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
    security:
      - BearerAuth: []
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
    if request.form:
        data = request.form
    else:
        data = request.get_json() or {}

    payload = _item_payload(data)
    title = payload["title"]
    category = payload["category"]
    item_type = payload["type"]
    incident_date = payload["incident_date"]
    description = payload["description"]

    if not all([title, category, item_type, incident_date]):
      return jsonify({"success": False, "message": "Please provide title, category, type, and date"}), 400

    try:
      parsed_date = datetime.strptime(incident_date, "%Y-%m-%d")
    except ValueError:
      return jsonify({"success": False, "message": "Invalid date format. Use YYYY-MM-DD"}), 400

    item = Item(
      user_id=current_user.id,
      title=title,
      description=description,
      category=category,
      type=item_type,
      incident_date=parsed_date,
      image_path=None,
      tracking_id=generate_tracking_id(),
      status="Active",
    )
    _apply_device_fields(item, payload)

    if "image" in request.files:
      file = request.files["image"]
      image_path = save_upload(file)
      if image_path:
        item.image_path = image_path

    db.session.add(item)
    db.session.commit()

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


@items_bp.route("/verify", methods=["GET"])
def verify_device():
    """
    Verify whether a device has active lost/stolen reports.
    ---
    tags:
      - Verification
    parameters:
      - in: query
        name: imei
        type: string
      - in: query
        name: serialNumber
        type: string
      - in: query
        name: modelNumber
        type: string
      - in: query
        name: productId
        type: string
    responses:
      200:
        description: Verification result
      400:
        description: Missing search input
    """
    params = {
      "imei": _normalize_identifier(request.args.get("imei")),
      "serial_number": _normalize_identifier(request.args.get("serialNumber") or request.args.get("serial_number")),
      "model_number": _normalize_identifier(request.args.get("modelNumber") or request.args.get("model_number")),
      "product_id": _normalize_identifier(request.args.get("productId") or request.args.get("product_id")),
    }

    if not any(params.values()):
      return jsonify({"success": False, "message": "Provide IMEI, serial number, model number, or product ID"}), 400

    query = _verification_query(params)
    matches = query.order_by(Item.created_at.desc()).all() if query else []
    status = "REPORTED LOST/STOLEN" if matches else "SAFE"

    search = VerificationSearch(
      imei=params["imei"],
      serial_number=params["serial_number"],
      model_number=params["model_number"],
      product_id=params["product_id"],
      result_status=status,
      matched_item_id=matches[0].id if matches else None,
    )
    db.session.add(search)
    db.session.commit()

    safe_reports = [
      {
        "reportDate": item.created_at.isoformat() if item.created_at else None,
        "productType": item.category,
        "brand": item.brand or "",
        "model": item.model_number or "",
        "reportStatus": item.status,
        "type": item.type,
        "trackingId": item.tracking_id,
      }
      for item in matches
    ]

    return jsonify({
      "success": True,
      "status": status,
      "message": "This device has been reported as lost or stolen." if matches else "No reports found for this device.",
      "reports": safe_reports,
    }), 200


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
      item = Item.query.get(int(item_id))
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
    security:
      - BearerAuth: []
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
      item = Item.query.get(int(item_id))
    except Exception:
      return jsonify({"success": False, "message": "Invalid item ID"}), 400

    if not item:
      return jsonify({"success": False, "message": "Item not found"}), 404

    if item.user_id != current_user.id:
      return jsonify({"success": False, "message": "Not authorized to resolve this item"}), 403

    item.status = "Resolved" if item.status == "Active" else "Active"
    item.updated_at = datetime.utcnow()
    db.session.commit()

    return (
      jsonify(
        {
          "success": True,
          "message": f"Item status updated to {item.status}",
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
    security:
      - BearerAuth: []
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
      item = Item.query.get(int(item_id))
    except Exception:
      return jsonify({"success": False, "message": "Invalid item ID"}), 400

    if not item:
      return jsonify({"success": False, "message": "Item not found"}), 404

    if item.user_id != current_user.id:
      return jsonify({"success": False, "message": "Not authorized to update this item"}), 403

    if request.form:
      data = request.form
    else:
      data = request.get_json() or {}

    if data.get("title"):
      item.title = data["title"].strip()
    if data.get("description") is not None:
      item.description = data["description"].strip()
    if data.get("category"):
      item.category = data["category"].strip()
    if data.get("type"):
      item.type = data["type"].strip()
    if data.get("incidentDate"):
      try:
        item.incident_date = datetime.strptime(data["incidentDate"].strip(), "%Y-%m-%d")
      except ValueError:
        pass

    payload = _item_payload(data)
    _apply_device_fields(item, payload)

    if "image" in request.files:
      file = request.files["image"]
      image_path = save_upload(file)
      if image_path:
        item.image_path = image_path

    item.updated_at = datetime.utcnow()
    db.session.commit()

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
    security:
      - BearerAuth: []
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
      item = Item.query.get(int(item_id))
    except Exception:
      return jsonify({"success": False, "message": "Invalid item ID"}), 400

    if not item:
      return jsonify({"success": False, "message": "Item not found"}), 404

    if item.user_id != current_user.id:
      return jsonify({"success": False, "message": "Not authorized to delete this item"}), 403

    db.session.delete(item)
    db.session.commit()

    return jsonify({"success": True, "message": "Item deleted successfully"}), 200
