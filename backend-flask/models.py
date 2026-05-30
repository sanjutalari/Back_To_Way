import random
import string
from datetime import datetime
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_pymongo import PyMongo

mongo = PyMongo()


def generate_tracking_id():
    chars = string.ascii_uppercase + string.digits
    return "TRK-" + "".join(random.choices(chars, k=4))


def user_to_dict(user):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
    }


def item_to_dict(item, include_user=True):
    result = {
        "id": str(item["_id"]),
        "userId": str(item["user_id"]),
        "type": item["type"],
        "title": item["title"],
        "description": item.get("description", ""),
        "category": item["category"],
        "incidentDate": item["incident_date"].isoformat() if isinstance(item.get("incident_date"), datetime) else item.get("incident_date"),
        "imagePath": item.get("image_path"),
        "trackingId": item["tracking_id"],
        "status": item["status"],
        "createdAt": item["created_at"].isoformat() if isinstance(item.get("created_at"), datetime) else item.get("created_at"),
        "updatedAt": item["updated_at"].isoformat() if isinstance(item.get("updated_at"), datetime) else item.get("updated_at"),
    }
    if include_user:
        user = mongo.db.users.find_one({"_id": ObjectId(item["user_id"])})
        if user:
            result["userId"] = user_to_dict(user)
    return result
