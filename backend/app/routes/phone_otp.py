import hashlib
from flask import Blueprint, request, jsonify, current_app
from ..models import db, User, Role, Wallet
from ..sms_service import send_sms_otp, verify_phone_otp, normalize_phone
from ..auth import create_access_token, create_refresh_token
from ..utils import jwt_required
from argon2 import PasswordHasher, exceptions as argon_exceptions

bp = Blueprint("phone_otp", __name__, url_prefix="/api/auth/phone-otp")
ph = PasswordHasher()

@bp.route("/send", methods=["POST"])
def send_otp():
    """Send OTP to user's phone for login."""
    data = request.json
    if not data or not data.get("phone") or not data.get("password"):
        return jsonify({"msg": "Missing phone or password"}), 400

    phone = normalize_phone(data["phone"])
    phone_hash = hashlib.sha256(phone.encode()).hexdigest()
    user = User.query.filter_by(phone_hash=phone_hash).first()
    if not user:
        return jsonify({"msg": "Invalid credentials"}), 401

    try:
        ph.verify(user.password_hash, data["password"])
    except argon_exceptions.VerifyMismatchError:
        return jsonify({"msg": "Invalid credentials"}), 401

    sent = send_sms_otp(phone)
    if not sent:
        return jsonify({"msg": "Failed to send OTP. Try again."}), 500

    return jsonify({"msg": "OTP sent to your phone"}), 200


@bp.route("/verify-login", methods=["POST"])
def verify_login_otp():
    """Verify phone OTP and return JWT tokens."""
    data = request.json
    if not data or not data.get("phone") or not data.get("otp"):
        return jsonify({"msg": "Missing phone or OTP"}), 400

    phone = normalize_phone(data["phone"])
    if not verify_phone_otp(phone, data["otp"]):
        return jsonify({"msg": "Invalid or expired OTP"}), 401

    phone_hash = hashlib.sha256(phone.encode()).hexdigest()
    user = User.query.filter_by(phone_hash=phone_hash).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    roles = [user.role.name] if user.role else []
    access = create_access_token(user.email, user.id, roles)
    refresh = create_refresh_token(user.id)

    return jsonify({
        "access_token": access,
        "refresh_token": refresh,
        "user": {"id": user.id, "email": user.email, "role": roles[0] if roles else None}
    }), 200


@bp.route("/send-register", methods=["POST"])
def send_register_otp():
    """Send OTP to verify phone during registration."""
    data = request.json
    if not data or not data.get("phone"):
        return jsonify({"msg": "Missing phone number"}), 400

    phone = normalize_phone(data["phone"])
    phone_hash = hashlib.sha256(phone.encode()).hexdigest()
    existing = User.query.filter_by(phone_hash=phone_hash).first()
    if existing:
        return jsonify({"msg": "Phone already registered"}), 400

    sent = send_sms_otp(phone)
    if not sent:
        return jsonify({"msg": "Failed to send OTP. Try again."}), 500

    return jsonify({"msg": "OTP sent to your phone"}), 200


@bp.route("/verify-register", methods=["POST"])
def verify_register_otp():
    """Verify OTP and create the user account."""
    data = request.json
    if not data or not data.get("phone") or not data.get("otp"):
        return jsonify({"msg": "Missing fields"}), 400

    phone = normalize_phone(data["phone"])
    if not verify_phone_otp(phone, data["otp"]):
        return jsonify({"msg": "Invalid or expired OTP"}), 401

    phone_hash = hashlib.sha256(phone.encode()).hexdigest()
    existing = User.query.filter_by(phone_hash=phone_hash).first()
    if existing:
        return jsonify({"msg": "Phone already registered"}), 400

    if not data.get("password"):
        return jsonify({"msg": "Missing password"}), 400

    password = data["password"]
    if len(password) < 8:
        return jsonify({"msg": "Password must be at least 8 characters"}), 400

    try:
        pass_hash = ph.hash(password)
    except Exception as e:
        return jsonify({"msg": "Failed to hash password"}), 500

    user = User(
        email=data.get("email", f"user_{phone}@placeholder.com").lower(),
        password_hash=pass_hash,
        phone_encrypted=phone
    )
    if data.get("full_name"):
        user.full_name_encrypted = data["full_name"]
    if data.get("email"):
        user.email = data["email"].lower()

    role = Role.query.filter_by(name="user").first()
    user.role = role
    db.session.add(user)
    db.session.commit()

    wallet = Wallet(user_id=user.id, currency=data.get("currency", "TZS"), balance_encrypted="0")
    db.session.add(wallet)
    db.session.commit()

    return jsonify({"msg": "registered", "email": user.email}), 201


@bp.route("/verify-phone", methods=["POST"])
@jwt_required
def verify_phone():
    """Verify phone number for an existing authenticated user."""
    from flask import g
    data = request.json
    if not data or not data.get("otp"):
        return jsonify({"msg": "Missing OTP"}), 400

    phone = g.user.phone_encrypted
    if not phone:
        return jsonify({"msg": "No phone number on profile"}), 400

    if not verify_phone_otp(phone, data["otp"]):
        return jsonify({"msg": "Invalid or expired OTP"}), 401

    return jsonify({"msg": "Phone verified successfully"}), 200


@bp.route("/send-verification", methods=["POST"])
@jwt_required
def send_phone_verification():
    """Send OTP to verify phone for an existing authenticated user."""
    from flask import g
    phone = g.user.phone_encrypted
    if not phone:
        return jsonify({"msg": "No phone number on profile"}), 400

    sent = send_sms_otp(phone)
    if not sent:
        return jsonify({"msg": "Failed to send OTP"}), 500

    return jsonify({"msg": "OTP sent to your phone"}), 200
