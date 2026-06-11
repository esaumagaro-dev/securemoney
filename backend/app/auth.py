import base64
from datetime import datetime, timezone as dt_timezone
from flask import Blueprint, request, jsonify, current_app, g
from .models import db, User, Role, Wallet
from argon2 import PasswordHasher, exceptions as argon_exceptions
import pyotp
import jwt

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

ph = PasswordHasher()

_jwt_keys_cache = {"private": None, "public": None}

def load_jwt_keys():
    if _jwt_keys_cache["private"] is not None and _jwt_keys_cache["public"] is not None:
        return _jwt_keys_cache["private"], _jwt_keys_cache["public"]
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
    _jwt_keys_cache["private"] = private
    _jwt_keys_cache["public"] = public
    return private, public

def create_access_token(subject: str, user_id: str, roles: list):
    private, _ = load_jwt_keys()
    now = datetime.now(dt_timezone.utc)
    payload = {
        "sub": subject,
        "uid": user_id,
        "roles": roles,
        "type": "access",
        "iat": now,
        "exp": now + current_app.config['ACCESS_TOKEN_EXPIRES']
    }
    if private:
        token = jwt.encode(payload, private, algorithm=current_app.config['JWT_ALGORITHM'])
    else:
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    return token

def create_refresh_token(user_id: str):
    private, _ = load_jwt_keys()
    now = datetime.now(dt_timezone.utc)
    payload = {
        "uid": user_id,
        "type": "refresh",
        "iat": now,
        "exp": now + current_app.config['REFRESH_TOKEN_EXPIRES']
    }
    if private:
        return jwt.encode(payload, private, algorithm=current_app.config['JWT_ALGORITHM'])
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

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
    refresh = create_refresh_token(user.id)
    resp = jsonify({"access_token": access, "refresh_token": refresh, "user": {"id": user.id, "email": user.email, "role": roles[0] if roles else None}})
    return resp, 200

@bp.route("/refresh", methods=["POST"])
def refresh():
    data = request.json or {}
    token = data.get("refresh_token")
    if not token:
        return jsonify({"msg":"Missing refresh_token"}), 400
    _, public = load_jwt_keys()
    try:
        if public:
            payload = jwt.decode(token, public, algorithms=[current_app.config['JWT_ALGORITHM']])
        else:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
    except Exception:
        return jsonify({"msg":"Invalid refresh token"}), 401
    if payload.get("type") != "refresh":
        return jsonify({"msg":"Invalid token type"}), 401
    user = db.session.get(User, payload.get("uid"))
    if not user:
        return jsonify({"msg":"User not found"}), 401
    roles = [user.role.name] if user.role else []
    access = create_access_token(user.email, user.id, roles)
    refresh = create_refresh_token(user.id)
    return jsonify({"access_token": access, "refresh_token": refresh}), 200

@bp.route("/mfa/setup", methods=["POST"])
def mfa_setup():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"msg":"Unauthorized"}), 401
    token = auth_header.split(" ",1)[1]
    _, public = load_jwt_keys()
    try:
        if public:
            payload = jwt.decode(token, public, algorithms=[current_app.config['JWT_ALGORITHM']])
        else:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
    except Exception:
        return jsonify({"msg":"Invalid token"}), 401
    user = db.session.get(User, payload.get("uid"))
    if not user:
        return jsonify({"msg":"User not found"}), 401
    if user.mfa_enabled:
        return jsonify({"msg":"MFA already enabled"}), 400
    secret = pyotp.random_base32()
    user.mfa_secret_encrypted = secret
    db.session.commit()
    issuer = "SecureMoney"
    uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name=issuer)
    return jsonify({"secret": secret, "uri": uri}), 200

@bp.route("/mfa/verify", methods=["POST"])
def mfa_verify():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"msg":"Unauthorized"}), 401
    token = auth_header.split(" ",1)[1]
    _, public = load_jwt_keys()
    try:
        if public:
            payload = jwt.decode(token, public, algorithms=[current_app.config['JWT_ALGORITHM']])
        else:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
    except Exception:
        return jsonify({"msg":"Invalid token"}), 401
    user = db.session.get(User, payload.get("uid"))
    if not user:
        return jsonify({"msg":"User not found"}), 401
    data = request.json or {}
    mfa_token = data.get("mfa_token")
    if not mfa_token:
        return jsonify({"msg":"Missing mfa_token"}), 400
    secret = user.mfa_secret_encrypted
    totp = pyotp.TOTP(secret)
    if not totp.verify(mfa_token, valid_window=1):
        return jsonify({"msg":"Invalid token"}), 400
    user.mfa_enabled = True
    db.session.commit()
    return jsonify({"msg":"MFA enabled"}), 200

@bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"msg":"Logged out"}), 200
