from flask import Blueprint, request, jsonify, current_app
from ..models import db, User
from ..email_service import send_otp_email, verify_otp
from ..auth import create_access_token, create_refresh_token
from argon2 import PasswordHasher, exceptions as argon_exceptions

bp = Blueprint("email_otp", __name__, url_prefix="/api/auth/otp")
ph = PasswordHasher()

@bp.route("/send", methods=["POST"])
def send_otp():
    """Send OTP to user's email. Used during login as a second factor."""
    data = request.json
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"msg": "Missing credentials"}), 400

    user = User.query.filter_by(email=data["email"].lower()).first()
    if not user:
        return jsonify({"msg": "Invalid credentials"}), 401

    try:
        ph.verify(user.password_hash, data["password"])
    except argon_exceptions.VerifyMismatchError:
        return jsonify({"msg": "Invalid credentials"}), 401

    sent = send_otp_email(user.email)
    if not sent:
        return jsonify({"msg": "Failed to send OTP. Try again."}), 500

    return jsonify({"msg": "OTP sent to your email"}), 200


@bp.route("/verify-login", methods=["POST"])
def verify_login_otp():
    """Verify OTP and return JWT tokens."""
    data = request.json
    if not data or not data.get("email") or not data.get("otp"):
        return jsonify({"msg": "Missing email or OTP"}), 400

    if not verify_otp(data["email"], data["otp"]):
        return jsonify({"msg": "Invalid or expired OTP"}), 401

    user = User.query.filter_by(email=data["email"].lower()).first()
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
    """Send OTP to verify email during registration."""
    data = request.json
    if not data or not data.get("email"):
        return jsonify({"msg": "Missing email"}), 400

    existing = User.query.filter_by(email=data["email"].lower()).first()
    if existing:
        return jsonify({"msg": "Email already registered"}), 400

    sent = send_otp_email(data["email"])
    if not sent:
        return jsonify({"msg": "Failed to send OTP. Try again."}), 500

    return jsonify({"msg": "OTP sent to your email"}), 200


@bp.route("/verify-register", methods=["POST"])
def verify_register_otp():
    """Verify OTP and create the user account."""
    data = request.json
    if not data or not data.get("email") or not data.get("otp"):
        return jsonify({"msg": "Missing fields"}), 400

    if not verify_otp(data["email"], data["otp"]):
        return jsonify({"msg": "Invalid or expired OTP"}), 401

    # Check if user was already created (race condition guard)
    existing = User.query.filter_by(email=data["email"].lower()).first()
    if existing:
        return jsonify({"msg": "Email already registered"}), 400

    # Create user
    if not data.get("password"):
        return jsonify({"msg": "Missing password"}), 400

    try:
        pass_hash = ph.hash(data["password"])
    except Exception as e:
        return jsonify({"msg": "Failed to hash password"}), 500

    user = User(email=data["email"].lower(), password_hash=pass_hash)
    if data.get("full_name"):
        user.full_name_encrypted = data["full_name"]
    if data.get("phone"):
        user.phone_encrypted = data["phone"]

    from ..models import Role
    role = Role.query.filter_by(name="user").first()
    user.role = role
    db.session.add(user)
    db.session.commit()

    from ..models import Wallet
    wallet = Wallet(user_id=user.id, currency=data.get("currency", "TZS"), balance_encrypted="0")
    db.session.add(wallet)
    db.session.commit()

    return jsonify({"msg": "registered", "email": user.email}), 201
