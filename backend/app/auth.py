import os
import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app, make_response
from .models import db, User, Role, Wallet
from argon2 import PasswordHasher, exceptions as argon_exceptions
import pyotp
import jwt
from .crypto import encrypt_bytes, pack_encrypted, unpack_encrypted, decrypt_bytes

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# PasswordHasher will be initialized in create_app context if needed; using default safe params here
ph = PasswordHasher()

def load_jwt_keys():
    private = None
    public = None
    try:
        with open(current_app.config['JWT_PRIVATE_KEY_PATH'], 'rb') as f:
            private = f.read()
    except Exception:
        private = None
    try:
        with open(current_app.config['JWT_PUBLIC_KEY_PATH'], 'rb') as f:
            public = f.read()
    except Exception:
        public = None
    return private, public


def create_access_token(subject: str, user_id: str, roles: list):
    private, _ = load_jwt_keys()
    now = datetime.utcnow()
    payload = {
        "sub": subject,
        "uid": user_id,
        "roles": roles,
        "iat": now,
        "exp": now + current_app.config['ACCESS_TOKEN_EXPIRES']
    }
    if private:
        token = jwt.encode(payload, private, algorithm=current_app.config['JWT_ALGORITHM'])
    else:
        # fallback for dev: sign with SECRET_KEY and HS256
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    return token

@bp.route("/register", methods=["POST"])
def register():
    data = request.json
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"msg": "Missing fields"}), 400
    existing = User.query.filter_by(email=data["email"].lower()).first()
    if existing:
        return jsonify({"msg":"User exists"}), 400
    # Hash password with Argon2
    try:
        pass_hash = ph.hash(data["password"])
    except Exception as e:
        return jsonify({"msg":"Failed to hash password"}), 500
    user = User(email=data["email"].lower(), password_hash=pass_hash)
    # Optional: encrypt full name and phone if provided
    if data.get("full_name"):
        user.full_name_encrypted = data["full_name"]
    if data.get("phone"):
        user.phone_encrypted = data["phone"]
    # default role
    role = Role.query.filter_by(name="user").first()
    user.role = role
    db.session.add(user)
    db.session.commit()
    # create default wallet with zero balance
    initial_balance = "0"
    wallet = Wallet(user_id=user.id, currency=data.get("currency", "TZS"), balance_encrypted=initial_balance)
    db.session.add(wallet)
    db.session.commit()
    return jsonify({"msg":"registered"}), 201

@bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"msg":"Missing credentials"}), 400
    user = User.query.filter_by(email=data["email"].lower()).first()
    if not user:
        return jsonify({"msg":"Invalid credentials"}), 401
    try:
        ph.verify(user.password_hash, data["password"])
    except argon_exceptions.VerifyMismatchError:
        return jsonify({"msg":"Invalid credentials"}), 401
    # If TOTP required, check presence of totp token in request
    if user.mfa_enabled:
        token = data.get("mfa_token")
        if not token:
            return jsonify({"mfa_required": True, "msg":"MFA required"}), 403
        secret = user.mfa_secret_encrypted
        totp = pyotp.TOTP(secret)
        if not totp.verify(token, valid_window=1):
            return jsonify({"msg":"Invalid MFA token"}), 403
    roles = [user.role.name] if user.role else []
    access = create_access_token(user.email, user.id, roles)
    resp = jsonify({"access_token": access})
    return resp, 200
