import os
import base64
import json
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA512
from typing import Tuple

from flask import current_app

# Derive a per-record data key using PBKDF2-HMAC-SHA512
def derive_data_key(master_key: bytes, salt: bytes, iterations: int) -> bytes:
    return PBKDF2(master_key, salt, dkLen=32, count=iterations, hmac_hash_module=SHA512)

def encrypt_bytes(plaintext: bytes, master_key: bytes, iterations: int) -> Tuple[bytes, dict]:
    # Generate per-record salt and nonce
    salt = get_random_bytes(16)
    key = derive_data_key(master_key, salt, iterations)
    nonce = get_random_bytes(12)  # recommended size for GCM
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    meta = {"salt": base64.b64encode(salt).decode(), "nonce": base64.b64encode(nonce).decode(), "tag": base64.b64encode(tag).decode(), "alg": "AES-256-GCM", "kdf": "PBKDF2"}
    return ciphertext, meta

def decrypt_bytes(ciphertext: bytes, meta: dict, master_key: bytes, iterations: int) -> bytes:
    salt = base64.b64decode(meta["salt"])
    nonce = base64.b64decode(meta["nonce"])
    tag = base64.b64decode(meta["tag"])
    key = derive_data_key(master_key, salt, iterations)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext

# Helper to store as base64-encoded json blob
def pack_encrypted(cipher: bytes, meta: dict) -> str:
    payload = {"ct": base64.b64encode(cipher).decode(), "meta": meta}
    return json.dumps(payload)

def unpack_encrypted(payload_str: str):
    data = json.loads(payload_str)
    return base64.b64decode(data["ct"]), data["meta"]


# SQLAlchemy TypeDecorator example
from sqlalchemy.types import TypeDecorator, TEXT

class EncryptedType(TypeDecorator):
    impl = TEXT

    def _get_master_key(self):
        mk = current_app.config.get('MASTER_KEY')
        if not mk:
            raise RuntimeError("MASTER_KEY is not configured. Set MASTER_KEY in environment or config.")
        if isinstance(mk, str):
            mk = mk.encode()
        return mk

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, str):
            value_bytes = value.encode()
        else:
            value_bytes = value
        master_key = self._get_master_key()
        ciphertext, meta = encrypt_bytes(value_bytes, master_key, current_app.config.get('PBKDF2_ITERATIONS', 200000))
        return pack_encrypted(ciphertext, meta)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        master_key = self._get_master_key()
        cipher, meta = unpack_encrypted(value)
        plaintext = decrypt_bytes(cipher, meta, master_key, current_app.config.get('PBKDF2_ITERATIONS', 200000))
        try:
            return plaintext.decode()
        except:
            return plaintext
