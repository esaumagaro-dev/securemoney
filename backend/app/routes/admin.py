from flask import Blueprint, jsonify, request, g, current_app
from ..models import User, Role, AuditLog, db
from ..utils import jwt_required, roles_required
from ..audit import audit_log

bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@bp.route("/users", methods=["GET"])
@jwt_required
@roles_required(["admin", "support"])
def list_users():
    # basic pagination
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", current_app.config['DEFAULT_PAGE_SIZE'])), current_app.config['MAX_PAGE_SIZE'])
    q = User.query.paginate(page=page, per_page=per_page, error_out=False)
    items = []
    for u in q.items:
        items.append({
            "id": u.id,
            "email": u.email,
            "role": u.role.name if u.role else None,
            "mfa_enabled": u.mfa_enabled,
            "created_at": u.created_at.isoformat()
        })
    return jsonify({"users": items, "total": q.total}), 200


@bp.route("/roles", methods=["POST"])
@jwt_required
@roles_required(["admin"])
def create_role():
    data = request.json or {}
    name = data.get("name")
    permissions = data.get("permissions", {})
    if not name:
        return jsonify({"msg": "missing role name"}), 400
    if Role.query.filter_by(name=name).first():
        return jsonify({"msg": "role exists"}), 400
    r = Role(name=name, permissions=permissions)
    db.session.add(r)
    db.session.commit()
    audit_log(g.user.id, "create_role", "role", r.id, {"name": name})
    return jsonify({"id": r.id, "name": r.name}), 201


@bp.route("/audit", methods=["GET"])
@jwt_required
@roles_required(["admin", "auditor"])
def get_audit():
    # Filter by date, user, action
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", current_app.config['DEFAULT_PAGE_SIZE'])), current_app.config['MAX_PAGE_SIZE'])
    q = AuditLog.query.order_by(AuditLog.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    items = []
    for a in q.items:
        # details_encrypted will be decrypted by EncryptedType on access
        items.append({
            "id": a.id,
            "user_id": a.user_id,
            "action": a.action,
            "resource_type": a.resource_type,
            "resource_id": a.resource_id,
            "details": a.details_encrypted,
            "ip": a.ip,
            "created_at": a.created_at.isoformat()
        })
    return jsonify({"logs": items, "total": q.total}), 200
