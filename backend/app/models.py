from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from datetime import datetime
from .crypto import EncryptedType

db = SQLAlchemy()

def gen_uuid():
    return str(uuid.uuid4())

class Role(db.Model):
    __tablename__ = "roles"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    name = db.Column(db.String(50), unique=True, nullable=False)
    permissions = db.Column(JSONB, default={})

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(512), nullable=False)
    full_name_encrypted = db.Column(EncryptedType, nullable=True)
    phone_encrypted = db.Column(EncryptedType, nullable=True)
    role_id = db.Column(UUID(as_uuid=True), db.ForeignKey("roles.id"))
    role = db.relationship("Role")
    mfa_enabled = db.Column(db.Boolean, default=False)
    mfa_secret_encrypted = db.Column(EncryptedType, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Wallet(db.Model):
    __tablename__ = "wallets"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", backref="wallets")
    currency = db.Column(db.String(10), nullable=False)
    balance_encrypted = db.Column(EncryptedType, nullable=False)
    balance_crypto_meta = db.Column(JSONB, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Transaction(db.Model):
    __tablename__ = "transactions"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    from_wallet_id = db.Column(UUID(as_uuid=True), db.ForeignKey("wallets.id"), nullable=True)
    to_wallet_id = db.Column(UUID(as_uuid=True), db.ForeignKey("wallets.id"), nullable=True)
    amount_encrypted = db.Column(EncryptedType, nullable=False)
    currency = db.Column(db.String(10), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # e.g. 'transfer','topup','withdraw'
    status = db.Column(db.String(20), default='pending')
    meta_encrypted = db.Column(EncryptedType, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AuditLog(db.Model):
    __tablename__ = "audit_logs"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=True)
    action = db.Column(db.String(100))
    resource_type = db.Column(db.String(100))
    resource_id = db.Column(db.String(100))
    details_encrypted = db.Column(EncryptedType, nullable=True)
    ip = db.Column(db.String(100))
    user_agent = db.Column(db.String(250))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
