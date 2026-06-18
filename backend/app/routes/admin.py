from flask import Blueprint, jsonify, request, g, current_app
from ..models import User, Role, AuditLog, Transaction, Wallet, Notification, db
from ..utils import jwt_required, roles_required
from ..audit import audit_log
from argon2 import PasswordHasher
from decimal import Decimal

ph = PasswordHasher()
from datetime import datetime, timezone as dt_timezone, timedelta

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
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", current_app.config['DEFAULT_PAGE_SIZE'])), current_app.config['MAX_PAGE_SIZE'])
    action_filter = request.args.get("action")
    q = AuditLog.query.order_by(AuditLog.created_at.desc())
    if action_filter:
        q = q.filter(AuditLog.action == action_filter)
    q = q.paginate(page=page, per_page=per_page, error_out=False)
    items = []
    for a in q.items:
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
    return jsonify({"logs": items, "total": q.total, "page": page}), 200

@bp.route("/analytics", methods=["GET"])
@jwt_required
@roles_required(["admin"])
def analytics():
    total_users = User.query.count()
    total_transactions = Transaction.query.count()
    total_wallets = Wallet.query.count()
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
    users_data = [{"id": u.id, "email": u.email, "created_at": u.created_at.isoformat()} for u in recent_users]
    return jsonify({
        "total_users": total_users,
        "total_transactions": total_transactions,
        "total_wallets": total_wallets,
        "recent_users": users_data
    }), 200

@bp.route("/roles", methods=["GET"])
@jwt_required
@roles_required(["admin"])
def list_roles():
    roles = Role.query.all()
    items = [{"id": r.id, "name": r.name, "permissions": r.permissions} for r in roles]
    return jsonify({"roles": items}), 200

@bp.route("/users/<user_id>/wallet", methods=["PUT"])
@jwt_required
@roles_required(["admin"])
def admin_update_wallet(user_id):
    data = request.json or {}
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    currency = data.get("currency", "TZS")
    new_balance = data.get("balance")
    wallet = Wallet.query.filter_by(user_id=user.id, currency=currency).first()
    if not wallet:
        return jsonify({"msg": "Wallet not found"}), 404
    if new_balance is not None:
        wallet.balance_encrypted = str(new_balance)
    db.session.commit()
    audit_log(g.user.id, "update_wallet", "wallet", wallet.id, {"user_id": user_id, "new_balance": new_balance})
    return jsonify({"msg": "Wallet updated"}), 200

@bp.route("/transactions", methods=["GET"])
@jwt_required
@roles_required(["admin", "support"])
def admin_list_transactions():
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", 25)), 200)
    tx_type = request.args.get("type")
    status = request.args.get("status")
    q = Transaction.query.order_by(Transaction.created_at.desc())
    if tx_type:
        q = q.filter(Transaction.type == tx_type)
    if status:
        q = q.filter(Transaction.status == status)
    q = q.paginate(page=page, per_page=per_page, error_out=False)
    items = []
    for t in q.items:
        items.append({
            "id": t.id, "from_wallet_id": t.from_wallet_id, "to_wallet_id": t.to_wallet_id,
            "amount": t.amount_encrypted, "currency": t.currency, "type": t.type,
            "status": t.status, "meta": t.meta_encrypted,
            "created_at": t.created_at.isoformat()
        })
    return jsonify({"transactions": items, "total": q.total, "page": page}), 200

@bp.route("/transactions/<tx_id>/status", methods=["PUT"])
@jwt_required
@roles_required(["admin"])
def admin_update_transaction(tx_id):
    tx = db.session.get(Transaction, tx_id)
    if not tx:
        return jsonify({"msg": "Transaction not found"}), 404
    data = request.json or {}
    new_status = data.get("status")
    if new_status:
        tx.status = new_status
    db.session.commit()
    audit_log(g.user.id, "update_transaction", "transaction", tx_id, {"new_status": new_status})
    return jsonify({"msg": "Transaction updated"}), 200

@bp.route("/settings", methods=["GET", "PUT"])
@jwt_required
@roles_required(["admin"])
def admin_settings():
    if request.method == "GET":
        return jsonify({"msg": "Settings endpoint"}), 200
    data = request.json or {}
    return jsonify({"msg": "Settings updated", "data": data}), 200

@bp.route("/notifications/broadcast", methods=["POST"])
@jwt_required
@roles_required(["admin"])
def admin_broadcast():
    data = request.json or {}
    message = data.get("message")
    ntype = data.get("type", "info")
    if not message:
        return jsonify({"msg": "Message required"}), 400
    users = User.query.all()
    for u in users:
        n = Notification(user_id=u.id, type=ntype, message=message)
        db.session.add(n)
    db.session.commit()
    audit_log(g.user.id, "broadcast", "notification", None, {"message": message})
    return jsonify({"msg": f"Notification sent to {len(users)} users"}), 200

@bp.route("/wallets", methods=["GET"])
@jwt_required
@roles_required(["admin", "support"])
def admin_list_wallets():
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", 25)), 200)
    q = Wallet.query.order_by(Wallet.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    items = []
    for w in q.items:
        items.append({
            "id": w.id,
            "user_id": w.user_id,
            "balance": w.balance_encrypted or "0",
            "currency": w.currency,
            "active": True,
            "created_at": w.created_at.isoformat()
        })
    return jsonify({"wallets": items, "total": q.total}), 200

@bp.route("/agents", methods=["GET"])
@jwt_required
@roles_required(["admin"])
def list_agents():
    agent_role = Role.query.filter_by(name="agent").first()
    if not agent_role:
        return jsonify({"agents": [], "total": 0}), 200
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", 25)), 200)
    search = request.args.get("search", "")
    q = User.query.filter_by(role_id=agent_role.id)
    if search:
        q = q.filter(User.email.ilike(f"%{search}%"))
    q = q.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    items = [{"id": u.id, "email": u.email, "full_name": u.full_name_encrypted, "phone": u.phone_encrypted, "created_at": u.created_at.isoformat()} for u in q.items]
    return jsonify({"agents": items, "total": q.total}), 200

@bp.route("/agents", methods=["POST"])
@jwt_required
@roles_required(["admin"])
def create_agent():
    data = request.json or {}
    email = data.get("email")
    if not email:
        return jsonify({"msg": "Email required"}), 400
    password = data.get("password", "changeme123")
    agent_role = Role.query.filter_by(name="agent").first()
    if not agent_role:
        return jsonify({"msg": "Agent role not found"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already in use"}), 400
    u = User(
        email=email,
        password_hash=ph.hash(password),
        role_id=agent_role.id,
        full_name_encrypted=data.get("full_name"),
        phone_encrypted=data.get("phone")
    )
    db.session.add(u)
    db.session.commit()
    audit_log(g.user.id, "create_agent", "user", u.id, {"email": email})
    return jsonify({"id": u.id, "email": u.email, "msg": "Agent created"}), 201

@bp.route("/merchants", methods=["GET"])
@jwt_required
@roles_required(["admin"])
def list_merchants():
    merchant_role = Role.query.filter_by(name="merchant").first()
    if not merchant_role:
        return jsonify({"merchants": [], "total": 0}), 200
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", 25)), 200)
    search = request.args.get("search", "")
    q = User.query.filter_by(role_id=merchant_role.id)
    if search:
        q = q.filter(User.email.ilike(f"%{search}%"))
    q = q.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    items = [{"id": u.id, "email": u.email, "full_name": u.full_name_encrypted, "phone": u.phone_encrypted, "created_at": u.created_at.isoformat()} for u in q.items]
    return jsonify({"merchants": items, "total": q.total}), 200

@bp.route("/merchants", methods=["POST"])
@jwt_required
@roles_required(["admin"])
def create_merchant():
    data = request.json or {}
    email = data.get("email")
    if not email:
        return jsonify({"msg": "Email required"}), 400
    password = data.get("password", "changeme123")
    merchant_role = Role.query.filter_by(name="merchant").first()
    if not merchant_role:
        return jsonify({"msg": "Merchant role not found"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already in use"}), 400
    u = User(
        email=email,
        password_hash=ph.hash(password),
        role_id=merchant_role.id,
        full_name_encrypted=data.get("full_name"),
        phone_encrypted=data.get("phone")
    )
    db.session.add(u)
    db.session.commit()
    audit_log(g.user.id, "create_merchant", "user", u.id, {"email": email})
    return jsonify({"id": u.id, "email": u.email, "msg": "Merchant created"}), 201

@bp.route("/reports", methods=["GET"])
@jwt_required
@roles_required(["admin"])
def get_reports():
    total_users = User.query.count()
    total_transactions = Transaction.query.count()
    total_deposits = Transaction.query.filter_by(type="deposit").count()
    total_withdrawals = Transaction.query.filter_by(type="withdraw").count()
    total_transfers = Transaction.query.filter_by(type="transfer").count()
    completed_tx = Transaction.query.filter_by(status="completed").count()
    failed_tx = Transaction.query.filter_by(status="failed").count()

    thirty_days_ago = datetime.now(dt_timezone.utc) - timedelta(days=30)
    recent_users = User.query.filter(User.created_at >= thirty_days_ago).count()
    recent_tx = Transaction.query.filter(Transaction.created_at >= thirty_days_ago).count()

    return jsonify({
        "total_users": total_users,
        "total_transactions": total_transactions,
        "total_deposits": total_deposits,
        "total_withdrawals": total_withdrawals,
        "total_transfers": total_transfers,
        "completed_transactions": completed_tx,
        "failed_transactions": failed_tx,
        "users_30d": recent_users,
        "transactions_30d": recent_tx
    }), 200

@bp.route("/content", methods=["GET", "PUT"])
@jwt_required
@roles_required(["admin"])
def admin_content():
    if request.method == "GET":
        return jsonify({
            "pages": [
                {"id": "landing_hero", "title": "Landing Page Hero", "content": "Secure digital wallet for everyone"},
                {"id": "about", "title": "About Section", "content": "SecureMoney provides safe and reliable mobile money services"},
                {"id": "faq", "title": "FAQ Content", "content": "Frequently asked questions about our services"},
                {"id": "terms", "title": "Terms of Service", "content": "Terms and conditions for using SecureMoney"},
                {"id": "privacy", "title": "Privacy Policy", "content": "How we handle your data and privacy"}
            ]
        }), 200
    data = request.json or {}
    return jsonify({"msg": "Content updated", "data": data}), 200
