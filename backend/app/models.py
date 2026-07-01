import hashlib
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON, String
from sqlalchemy.orm import validates
import uuid
from datetime import datetime, timezone as dt_timezone
from .crypto import EncryptedType

db = SQLAlchemy()

def gen_uuid():
    return str(uuid.uuid4())

class Role(db.Model):
    __tablename__ = "roles"
    id = db.Column(String(36), primary_key=True, default=gen_uuid)
    name = db.Column(db.String(50), unique=True, nullable=False)
    permissions = db.Column(JSON, default={})

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(String(36), primary_key=True, default=gen_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(512), nullable=False)
    full_name_encrypted = db.Column(EncryptedType, nullable=True)
    phone_encrypted = db.Column(EncryptedType, nullable=True)
    phone_hash = db.Column(db.String(64), nullable=True, index=True)
    role_id = db.Column(String(36), db.ForeignKey("roles.id"))
    role = db.relationship("Role")
    mfa_enabled = db.Column(db.Boolean, default=False)

    @validates('phone_encrypted')
    def _set_phone_hash(self, key, value):
        if value is not None:
            self.phone_hash = hashlib.sha256(value.encode()).hexdigest()
        return value
    mfa_secret_encrypted = db.Column(EncryptedType, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(dt_timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(dt_timezone.utc), onupdate=lambda: datetime.now(dt_timezone.utc))

class Wallet(db.Model):
    __tablename__ = "wallets"
    id = db.Column(String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(String(36), db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", backref="wallets")
    currency = db.Column(db.String(10), nullable=False)
    balance_encrypted = db.Column(EncryptedType, nullable=False)
    balance_crypto_meta = db.Column(JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(dt_timezone.utc))

class Transaction(db.Model):
    __tablename__ = "transactions"
    id = db.Column(String(36), primary_key=True, default=gen_uuid)
    from_wallet_id = db.Column(String(36), db.ForeignKey("wallets.id"), nullable=True)
    to_wallet_id = db.Column(String(36), db.ForeignKey("wallets.id"), nullable=True)
    amount_encrypted = db.Column(EncryptedType, nullable=False)
    currency = db.Column(db.String(10), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # e.g. 'transfer','topup','withdraw'
    status = db.Column(db.String(20), default='pending')
    meta_encrypted = db.Column(EncryptedType, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(dt_timezone.utc))

class AuditLog(db.Model):
    __tablename__ = "audit_logs"
    id = db.Column(String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(String(36), db.ForeignKey("users.id"), nullable=True)
    action = db.Column(db.String(100))
    resource_type = db.Column(db.String(100))
    resource_id = db.Column(db.String(100))
    details_encrypted = db.Column(EncryptedType, nullable=True)
    ip = db.Column(db.String(100))
    user_agent = db.Column(db.String(250))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(dt_timezone.utc))

class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(String(36), db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", backref="notifications")
    type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    resource_id = db.Column(db.String(100), nullable=True)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(dt_timezone.utc))
