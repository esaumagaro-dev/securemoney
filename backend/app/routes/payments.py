from flask import Blueprint, request, jsonify, current_app, g
from ..models import db, User, Wallet, Transaction, Notification
from ..utils import jwt_required
from ..audit import audit_log
from decimal import Decimal
import uuid, random, string
from datetime import datetime, timezone as dt_timezone

bp = Blueprint("payments", __name__, url_prefix="/api/payments")

def generate_ref():
    return "TXN" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))

def _get_or_create_wallet(user, currency="TZS"):
    wallet = Wallet.query.filter_by(user_id=user.id, currency=currency).first()
    if not wallet:
        wallet = Wallet(user_id=user.id, currency=currency, balance_encrypted="0")
        db.session.add(wallet)
        db.session.commit()
    return wallet

def _create_notification(user_id, ntype, message, resource_id=None):
    n = Notification(user_id=user_id, type=ntype, message=message, resource_id=resource_id)
    db.session.add(n)
    db.session.commit()

@bp.route("/deposit", methods=["POST"])
@jwt_required
def deposit():
    data = request.json or {}
    amount = data.get("amount")
    currency = data.get("currency", "TZS")
    method = data.get("method", "bank_transfer")
    if not amount or Decimal(str(amount)) <= 0:
        return jsonify({"msg": "Invalid amount"}), 400
    amount_dec = Decimal(str(amount))
    wallet = _get_or_create_wallet(g.user, currency)
    ref = generate_ref()
    current_balance = Decimal(wallet.balance_encrypted or "0")
    new_balance = current_balance + amount_dec
    wallet.balance_encrypted = str(new_balance)
    tx = Transaction(
        to_wallet_id=wallet.id,
        amount_encrypted=str(amount_dec),
        currency=currency,
        type="deposit",
        status="completed",
        meta_encrypted=f'{{"ref":"{ref}","method":"{method}"}}'
    )
    db.session.add(tx)
    db.session.commit()
    audit_log(g.user.id, "deposit", "transaction", tx.id, {"amount": str(amount_dec), "ref": ref, "method": method})
    _create_notification(g.user.id, "deposit", f"Deposit of {amount_dec} {currency} completed. Ref: {ref}", tx.id)
    return jsonify({
        "msg": "Deposit completed",
        "ref": ref,
        "amount": str(amount_dec),
        "currency": currency,
        "new_balance": str(new_balance),
        "tx_id": tx.id,
        "created_at": tx.created_at.isoformat()
    }), 200

@bp.route("/withdraw", methods=["POST"])
@jwt_required
def withdraw():
    data = request.json or {}
    amount = data.get("amount")
    currency = data.get("currency", "TZS")
    method = data.get("method", "bank_transfer")
    if not amount or Decimal(str(amount)) <= 0:
        return jsonify({"msg": "Invalid amount"}), 400
    amount_dec = Decimal(str(amount))
    wallet = _get_or_create_wallet(g.user, currency)
    current_balance = Decimal(wallet.balance_encrypted or "0")
    if current_balance < amount_dec:
        return jsonify({"msg": "Insufficient funds"}), 400
    new_balance = current_balance - amount_dec
    wallet.balance_encrypted = str(new_balance)
    ref = generate_ref()
    tx = Transaction(
        from_wallet_id=wallet.id,
        amount_encrypted=str(amount_dec),
        currency=currency,
        type="withdraw",
        status="completed",
        meta_encrypted=f'{{"ref":"{ref}","method":"{method}"}}'
    )
    db.session.add(tx)
    db.session.commit()
    audit_log(g.user.id, "withdraw", "transaction", tx.id, {"amount": str(amount_dec), "ref": ref})
    _create_notification(g.user.id, "withdraw", f"Withdrawal of {amount_dec} {currency} completed. Ref: {ref}", tx.id)
    return jsonify({
        "msg": "Withdrawal completed",
        "ref": ref,
        "amount": str(amount_dec),
        "currency": currency,
        "new_balance": str(new_balance),
        "tx_id": tx.id
    }), 200

@bp.route("/airtime", methods=["POST"])
@jwt_required
def airtime():
    data = request.json or {}
    amount = data.get("amount")
    phone = data.get("phone")
    currency = data.get("currency", "TZS")
    if not amount or Decimal(str(amount)) <= 0:
        return jsonify({"msg": "Invalid amount"}), 400
    if not phone:
        return jsonify({"msg": "Phone number required"}), 400
    amount_dec = Decimal(str(amount))
    wallet = _get_or_create_wallet(g.user, currency)
    current_balance = Decimal(wallet.balance_encrypted or "0")
    if current_balance < amount_dec:
        return jsonify({"msg": "Insufficient funds"}), 400
    new_balance = current_balance - amount_dec
    wallet.balance_encrypted = str(new_balance)
    ref = generate_ref()
    provider = data.get("provider", "Vodacom")
    tx = Transaction(
        from_wallet_id=wallet.id,
        amount_encrypted=str(amount_dec),
        currency=currency,
        type="airtime",
        status="completed",
        meta_encrypted=f'{{"ref":"{ref}","phone":"{phone}","provider":"{provider}"}}'
    )
    db.session.add(tx)
    db.session.commit()
    audit_log(g.user.id, "airtime", "transaction", tx.id, {"amount": str(amount_dec), "phone": phone})
    _create_notification(g.user.id, "airtime", f"Airtime of {amount_dec} {currency} sent to {phone}. Ref: {ref}", tx.id)
    return jsonify({
        "msg": "Airtime purchase completed",
        "ref": ref,
        "amount": str(amount_dec),
        "phone": phone,
        "provider": provider,
        "new_balance": str(new_balance),
        "tx_id": tx.id
    }), 200

@bp.route("/bill", methods=["POST"])
@jwt_required
def bill_payment():
    data = request.json or {}
    amount = data.get("amount")
    bill_ref = data.get("reference")
    currency = data.get("currency", "TZS")
    bill_type = data.get("bill_type", "utility")
    if not amount or Decimal(str(amount)) <= 0:
        return jsonify({"msg": "Invalid amount"}), 400
    if not bill_ref:
        return jsonify({"msg": "Bill reference required"}), 400
    amount_dec = Decimal(str(amount))
    wallet = _get_or_create_wallet(g.user, currency)
    current_balance = Decimal(wallet.balance_encrypted or "0")
    if current_balance < amount_dec:
        return jsonify({"msg": "Insufficient funds"}), 400
    new_balance = current_balance - amount_dec
    wallet.balance_encrypted = str(new_balance)
    ref = generate_ref()
    tx = Transaction(
        from_wallet_id=wallet.id,
        amount_encrypted=str(amount_dec),
        currency=currency,
        type="bill_payment",
        status="completed",
        meta_encrypted=f'{{"ref":"{ref}","bill_ref":"{bill_ref}","bill_type":"{bill_type}"}}'
    )
    db.session.add(tx)
    db.session.commit()
    audit_log(g.user.id, "bill_payment", "transaction", tx.id, {"amount": str(amount_dec), "bill_ref": bill_ref})
    _create_notification(g.user.id, "bill_payment", f"Bill payment of {amount_dec} {currency} completed. Ref: {ref}", tx.id)
    return jsonify({
        "msg": "Bill payment completed",
        "ref": ref,
        "amount": str(amount_dec),
        "bill_ref": bill_ref,
        "new_balance": str(new_balance),
        "tx_id": tx.id
    }), 200

@bp.route("/merchant", methods=["POST"])
@jwt_required
def merchant_payment():
    data = request.json or {}
    amount = data.get("amount")
    merchant_id = data.get("merchant_id")
    currency = data.get("currency", "TZS")
    if not amount or Decimal(str(amount)) <= 0:
        return jsonify({"msg": "Invalid amount"}), 400
    if not merchant_id:
        return jsonify({"msg": "Merchant ID required"}), 400
    amount_dec = Decimal(str(amount))
    wallet = _get_or_create_wallet(g.user, currency)
    current_balance = Decimal(wallet.balance_encrypted or "0")
    if current_balance < amount_dec:
        return jsonify({"msg": "Insufficient funds"}), 400
    new_balance = current_balance - amount_dec
    wallet.balance_encrypted = str(new_balance)
    ref = generate_ref()
    tx = Transaction(
        from_wallet_id=wallet.id,
        amount_encrypted=str(amount_dec),
        currency=currency,
        type="merchant_payment",
        status="completed",
        meta_encrypted=f'{{"ref":"{ref}","merchant_id":"{merchant_id}"}}'
    )
    db.session.add(tx)
    db.session.commit()
    audit_log(g.user.id, "merchant_payment", "transaction", tx.id, {"amount": str(amount_dec), "merchant_id": merchant_id})
    _create_notification(g.user.id, "merchant_payment", f"Merchant payment of {amount_dec} {currency} to {merchant_id}. Ref: {ref}", tx.id)
    return jsonify({
        "msg": "Merchant payment completed",
        "ref": ref,
        "amount": str(amount_dec),
        "merchant_id": merchant_id,
        "new_balance": str(new_balance),
        "tx_id": tx.id
    }), 200

@bp.route("/receipt/<tx_id>", methods=["GET"])
@jwt_required
def receipt(tx_id):
    tx = db.session.get(Transaction, tx_id)
    if not tx:
        return jsonify({"msg": "Transaction not found"}), 404
    wallet = Wallet.query.filter_by(id=tx.from_wallet_id or tx.to_wallet_id).first()
    if not wallet or wallet.user_id != g.user.id:
        return jsonify({"msg": "Not found"}), 404
    return jsonify({
        "id": tx.id,
        "type": tx.type,
        "amount": tx.amount_encrypted,
        "currency": tx.currency,
        "status": tx.status,
        "meta": tx.meta_encrypted,
        "created_at": tx.created_at.isoformat()
    }), 200
