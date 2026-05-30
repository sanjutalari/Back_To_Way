import random
import string
from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


def generate_tracking_id():
    chars = string.ascii_uppercase + string.digits
    return "TRK-" + "".join(random.choices(chars, k=6))


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('Item', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Item(db.Model):
    __tablename__ = 'item'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50))
    title = db.Column(db.String(255))
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    incident_date = db.Column(db.DateTime)
    image_path = db.Column(db.String(255))
    tracking_id = db.Column(db.String(64), unique=True, index=True)
    status = db.Column(db.String(20), default='Active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def user_to_dict(user):
    if not user:
        return None
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'phone': user.phone,
    }


def item_to_dict(item, include_user=True):
    if not item:
        return None
    result = {
        'id': item.id,
        'userId': item.user_id,
        'type': item.type,
        'title': item.title,
        'description': item.description or '',
        'category': item.category,
        'incidentDate': item.incident_date.isoformat() if item.incident_date else None,
        'imagePath': item.image_path,
        'trackingId': item.tracking_id,
        'status': item.status,
        'createdAt': item.created_at.isoformat() if item.created_at else None,
        'updatedAt': item.updated_at.isoformat() if item.updated_at else None,
    }
    if include_user and item.user:
        result['user'] = user_to_dict(item.user)
    return result

