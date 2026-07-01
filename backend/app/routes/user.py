from flask import Blueprint, request, jsonify, current_app, g
from ..models import db, User, Wallet, Transaction, AuditLog, Notification
from ..auth import load_jwt_keys, create_access_token, create_refresh_token
import jwt
from decimal import Decimal
from ..audit import audit_log

bp = Blueprint("user", __name__, url_prefix="/api/user")

def verify_jwt_from_header():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.split(" ",1)[1]
    _, public = load_jwt_keys()
    try:
        if public:
            payload = jwt.decode(token, public, algorithms=[current_app.config['JWT_ALGORITHM']])
        else:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except Exception:
        return None

@bp.before_request
def load_user():
    payload = verify_jwt_from_header()
    if not payload:
        g.user = None
        return
    g.user = db.session.get(User, payload.get("uid"))

@bp.route("/balance", methods=["GET"])
def balance():
    if not g.user:
        return jsonify({"msg":"Unauthorized"}), 401
    wallets = Wallet.query.filter_by(user_id=g.user.id).all()
    out = []
    for w in wallets:
        out.append({"wallet_id": w.id, "currency": w.currency, "balance": w.balance_encrypted})
    return jsonify({"wallets": out}), 200

@bp.route("/transfer", methods=["POST"])
def transfer():
    if not g.user:
        return jsonify({"msg":"Unauthorized"}), 401
    data = request.json
    from_wallet = Wallet.query.filter_by(id=data.get("from_wallet"), user_id=g.user.id).first()
    to_wallet = Wallet.query.filter_by(id=data.get("to_wallet")).first()
    if not from_wallet or not to_wallet:
        return jsonify({"msg":"Invalid wallets"}), 400
    amount = data.get("amount")
    try:
        from_balance = Decimal(from_wallet.balance_encrypted)
        to_balance = Decimal(to_wallet.balance_encrypted)
        amount_dec = Decimal(str(amount))
        if amount_dec <= 0 or from_balance < amount_dec:
            return jsonify({"msg":"Insufficient funds"}), 400
        from_balance -= amount_dec
        to_balance += amount_dec
        from_wallet.balance_encrypted = str(from_balance)
        to_wallet.balance_encrypted = str(to_balance)
        tx = Transaction(from_wallet_id=from_wallet.id, to_wallet_id=to_wallet.id, amount_encrypted=str(amount_dec), currency=from_wallet.currency, type="transfer", status="completed")
        db.session.add(tx)
        db.session.commit()
        audit_log(g.user.id, "transfer", "transaction", tx.id, {"amount": str(amount_dec), "from": from_wallet.id, "to": to_wallet.id})
        _create_notification(g.user.id, "transfer", f"Transfer of {amount_dec} {from_wallet.currency} completed", tx.id)
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg":"Transfer failed"}), 500
    return jsonify({"msg":"Transfer completed", "tx_id": tx.id}), 200

@bp.route("/transactions", methods=["GET"])
def transactions():
    if not g.user:
        return jsonify({"msg":"Unauthorized"}), 401
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", 25)), 200)
    wallet_ids = [w.id for w in Wallet.query.filter_by(user_id=g.user.id).all()]
    q = Transaction.query.filter(
        (Transaction.from_wallet_id.in_(wallet_ids)) | (Transaction.to_wallet_id.in_(wallet_ids))
    ).order_by(Transaction.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    items = []
    for t in q.items:
        items.append({
            "id": t.id,
            "from_wallet_id": t.from_wallet_id,
            "to_wallet_id": t.to_wallet_id,
            "amount": t.amount_encrypted,
            "currency": t.currency,
            "type": t.type,
            "status": t.status,
            "created_at": t.created_at.isoformat()
        })
    return jsonify({"transactions": items, "total": q.total, "page": page}), 200

@bp.route("/profile", methods=["GET"])
def profile():
    if not g.user:
        return jsonify({"msg":"Unauthorized"}), 401
    u = g.user
    return jsonify({
        "id": u.id,
        "email": u.email,
        "full_name": u.full_name_encrypted,
        "phone": u.phone_encrypted,
        "role": u.role.name if u.role else None,
        "mfa_enabled": u.mfa_enabled,
        "created_at": u.created_at.isoformat()
    }), 200

@bp.route("/notifications", methods=["GET"])
def notifications():
    if not g.user:
        return jsonify({"msg":"Unauthorized"}), 401
    page = int(request.args.get("page", 1))
    per_page = min(int(request.args.get("per_page", 50)), 200)
    q = Notification.query.filter_by(user_id=g.user.id).order_by(Notification.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    items = []
    for n in q.items:
        items.append({
            "id": n.id,
            "type": n.type,
            "message": n.message,
            "resource_id": n.resource_id,
            "read": n.read,
            "created_at": n.created_at.isoformat()
        })
    return jsonify({"notifications": items, "total": q.total}), 200

@bp.route("/notifications/read", methods=["POST"])
def mark_notifications_read():
    if not g.user:
        return jsonify({"msg":"Unauthorized"}), 401
    Notification.query.filter_by(user_id=g.user.id, read=False).update({"read": True})
    db.session.commit()
    return jsonify({"msg":"ok"}), 200

def _create_notification(user_id, ntype, message, resource_id=None):
    n = Notification(user_id=user_id, type=ntype, message=message, resource_id=resource_id)
    db.session.add(n)
    db.session.commit()
