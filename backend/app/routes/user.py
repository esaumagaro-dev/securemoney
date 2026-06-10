from flask import Blueprint, request, jsonify, current_app, g
from ..models import db, User, Wallet, Transaction, AuditLog
from ..crypto import encrypt_bytes, decrypt_bytes, pack_encrypted, unpack_encrypted
from ..auth import load_jwt_keys
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
    g.user = User.query.get(payload.get("uid"))

@bp.route("/balance", methods=["GET"])
def balance():
    if not g.user:
        return jsonify({"msg":"Unauthorized"}), 401
    wallets = Wallet.query.filter_by(user_id=g.user.id).all()
    out = []
    for w in wallets:
        balance = w.balance_encrypted
        out.append({"wallet_id": w.id, "currency": w.currency, "balance": balance})
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
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg":"Transfer failed"}), 500
    return jsonify({"msg":"Transfer completed", "tx_id": tx.id}), 200
