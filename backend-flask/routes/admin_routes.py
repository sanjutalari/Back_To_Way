from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from sqlalchemy import case, func

from middleware.auth import token_required
from models import Item, User, VerificationSearch, db

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.email != "admin@backtoway.com":
            return jsonify({"success": False, "message": "Admin access required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated


@admin_bp.route("/stats", methods=["GET"])
@token_required
@_admin_required
def get_stats(current_user):
    total_reports = Item.query.count()
    active_lost = Item.query.filter_by(type="Lost", status="Active").count()
    active_found = Item.query.filter_by(type="Found", status="Active").count()
    resolved = Item.query.filter_by(status="Resolved").count()
    total_users = User.query.count()
    total_verifications = VerificationSearch.query.count()
    safe_verifications = VerificationSearch.query.filter_by(result_status="SAFE").count()
    reported_verifications = VerificationSearch.query.filter_by(result_status="REPORTED LOST/STOLEN").count()

    today = datetime.utcnow().date()
    reports_today = Item.query.filter(func.date(Item.created_at) == today).count()
    verifications_today = VerificationSearch.query.filter(func.date(VerificationSearch.created_at) == today).count()

    return jsonify({
        "success": True,
        "stats": {
            "totalReports": total_reports,
            "activeLost": active_lost,
            "activeFound": active_found,
            "resolved": resolved,
            "totalUsers": total_users,
            "totalVerifications": total_verifications,
            "safeVerifications": safe_verifications,
            "reportedVerifications": reported_verifications,
            "reportsToday": reports_today,
            "verificationsToday": verifications_today,
        }
    }), 200


@admin_bp.route("/reports/lost", methods=["GET"])
@token_required
@_admin_required
def get_lost_reports(current_user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status_filter = request.args.get("status", "")

    query = Item.query.filter_by(type="Lost")
    if status_filter:
        query = query.filter_by(status=status_filter)

    query = query.order_by(Item.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "count": len(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "reports": [{
            "id": item.id,
            "title": item.title,
            "category": item.category,
            "brand": item.brand,
            "modelNumber": item.model_number,
            "status": item.status,
            "trackingId": item.tracking_id,
            "createdAt": item.created_at.isoformat() if item.created_at else None,
            "userName": item.user.name if item.user else "Unknown",
            "userEmail": item.user.email if item.user else "Unknown",
        } for item in pagination.items],
    }), 200


@admin_bp.route("/reports/found", methods=["GET"])
@token_required
@_admin_required
def get_found_reports(current_user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status_filter = request.args.get("status", "")

    query = Item.query.filter_by(type="Found")
    if status_filter:
        query = query.filter_by(status=status_filter)

    query = query.order_by(Item.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "count": len(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "reports": [{
            "id": item.id,
            "title": item.title,
            "category": item.category,
            "brand": item.brand,
            "modelNumber": item.model_number,
            "status": item.status,
            "trackingId": item.tracking_id,
            "createdAt": item.created_at.isoformat() if item.created_at else None,
            "userName": item.user.name if item.user else "Unknown",
            "userEmail": item.user.email if item.user else "Unknown",
        } for item in pagination.items],
    }), 200


@admin_bp.route("/verifications", methods=["GET"])
@token_required
@_admin_required
def get_verifications(current_user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    query = VerificationSearch.query.order_by(VerificationSearch.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "count": len(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "verifications": [{
            "id": v.id,
            "imei": v.imei or "",
            "serialNumber": v.serial_number or "",
            "modelNumber": v.model_number or "",
            "productId": v.product_id or "",
            "resultStatus": v.result_status,
            "createdAt": v.created_at.isoformat() if v.created_at else None,
        } for v in pagination.items],
    }), 200


@admin_bp.route("/recovery-stats", methods=["GET"])
@token_required
@_admin_required
def get_recovery_stats(current_user):
    total_recovered = Item.query.filter_by(type="Lost", status="Resolved").count()
    total_active = Item.query.filter_by(type="Lost", status="Active").count()

    recovery_rate = round((total_recovered / (total_recovered + total_active) * 100), 1) if (total_recovered + total_active) > 0 else 0

    last_30_days = datetime.utcnow() - timedelta(days=30)
    recent_recoveries = Item.query.filter(
        Item.type == "Lost",
        Item.status == "Resolved",
        Item.updated_at >= last_30_days
    ).count()

    top_categories = db.session.query(
        Item.category,
        func.count(Item.id).label("count")
    ).filter(
        Item.type == "Lost",
        Item.status == "Resolved"
    ).group_by(Item.category).order_by(func.count(Item.id).desc()).limit(5).all()

    return jsonify({
        "success": True,
        "stats": {
            "totalRecovered": total_recovered,
            "totalActiveLost": total_active,
            "recoveryRate": recovery_rate,
            "recentRecoveries": recent_recoveries,
            "topCategories": [{"category": c, "count": cnt} for c, cnt in top_categories],
        }
    }), 200


@admin_bp.route("/device-registry", methods=["GET"])
@token_required
@_admin_required
def get_device_registry(current_user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", "").strip()

    query = Item.query.filter(
        (Item.brand.isnot(None)) | (Item.model_number.isnot(None)) |
        (Item.serial_number.isnot(None)) | (Item.imei.isnot(None))
    )

    if search:
        like = f"%{search}%"
        query = query.filter(
            (Item.brand.ilike(like)) |
            (Item.model_number.ilike(like)) |
            (Item.serial_number.ilike(like)) |
            (Item.imei.ilike(like)) |
            (Item.product_id.ilike(like))
        )

    query = query.order_by(Item.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "count": len(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "devices": [{
            "id": item.id,
            "title": item.title,
            "category": item.category,
            "brand": item.brand or "",
            "modelNumber": item.model_number or "",
            "serialNumber": item.serial_number or "",
            "imei": item.imei or "",
            "productId": item.product_id or "",
            "status": item.status,
            "type": item.type,
            "trackingId": item.tracking_id,
            "createdAt": item.created_at.isoformat() if item.created_at else None,
            "userName": item.user.name if item.user else "Unknown",
        } for item in pagination.items],
    }), 200


@admin_bp.route("/reports/timeline", methods=["GET"])
@token_required
@_admin_required
def get_reports_timeline(current_user):
    days = request.args.get("days", 30, type=int)
    since = datetime.utcnow() - timedelta(days=days)

    report_counts = db.session.query(
        func.date(Item.created_at).label("date"),
        func.count(Item.id).label("count")
    ).filter(Item.created_at >= since).group_by(func.date(Item.created_at)).order_by(func.date(Item.created_at)).all()

    verification_counts = db.session.query(
        func.date(VerificationSearch.created_at).label("date"),
        func.count(VerificationSearch.id).label("count")
    ).filter(VerificationSearch.created_at >= since).group_by(func.date(VerificationSearch.created_at)).order_by(func.date(VerificationSearch.created_at)).all()

    return jsonify({
        "success": True,
        "timeline": {
            "reports": [{"date": str(r.date), "count": r.count} for r in report_counts],
            "verifications": [{"date": str(v.date), "count": v.count} for v in verification_counts],
        }
    }), 200


@admin_bp.route("/users", methods=["GET"])
@token_required
@_admin_required
def get_users(current_user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    query = User.query.order_by(User.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "count": len(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "users": [{
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone or "",
            "createdAt": u.created_at.isoformat() if u.created_at else None,
            "reportCount": Item.query.filter_by(user_id=u.id).count(),
        } for u in pagination.items],
    }), 200
