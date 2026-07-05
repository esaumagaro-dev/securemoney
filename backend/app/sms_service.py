import os
import random
import hashlib
import hmac
import time
import threading
import re
from flask import current_app

OTP_LENGTH = 6
OTP_EXPIRY_SECONDS = 300

_otp_store: dict[str, dict] = {}
_cleanup_lock = threading.RLock()

def _cleanup_expired():
    now = int(time.time())
    with _cleanup_lock:
        expired = [k for k, v in _otp_store.items() if v["expiry"] < now]
        for k in expired:
            del _otp_store[k]

def _store_key(phone: str) -> str:
    cleaned = re.sub(r"[^0-9+]", "", phone.strip())
    return cleaned

def generate_phone_otp(phone: str) -> str:
    code = str(random.randint(10**(OTP_LENGTH-1), 10**OTP_LENGTH - 1))
    key = _store_key(phone)
    hashed = hashlib.sha256(code.encode()).hexdigest()
    with _cleanup_lock:
        _cleanup_expired()
        _otp_store[key] = {
            "code": hashed,
            "expiry": int(time.time()) + OTP_EXPIRY_SECONDS,
            "attempts": 0
        }
    return code

def verify_phone_otp(phone: str, code: str) -> bool:
    key = _store_key(phone)
    with _cleanup_lock:
        _cleanup_expired()
        entry = _otp_store.get(key)
        if not entry:
            return False
        if int(time.time()) > entry["expiry"]:
            del _otp_store[key]
            return False
        entry["attempts"] += 1
        if entry["attempts"] > 5:
            del _otp_store[key]
            return False
        expected = entry["code"]
        if hmac.compare_digest(hashlib.sha256(code.encode()).hexdigest(), expected):
            del _otp_store[key]
            return True
        return False

def send_sms_otp(phone: str) -> bool:
    code = generate_phone_otp(phone)
    account_sid = current_app.config.get("TWILIO_ACCOUNT_SID", "")
    auth_token = current_app.config.get("TWILIO_AUTH_TOKEN", "")
    from_number = current_app.config.get("TWILIO_FROM_NUMBER", "")

    if not account_sid or not auth_token or not from_number:
        current_app.logger.info(f"SMS OTP for {phone}: {code} (dev mode)")
        print(f"\n===== SMS OTP ({phone}) =====\n{code}\n===========================\n")
        return True

    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=f"Your SecureMoney verification code is: {code}. It expires in 5 minutes.",
            from_=from_number,
            to=phone
        )
        current_app.logger.info(f"SMS sent to {phone} via Twilio (sid={message.sid})")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send SMS to {phone}: {e}")
        print(f"\n===== SMS OTP (Twilio failed, fallback - {phone}) =====\n{code}\n================================================\n")
        return False

def normalize_phone(phone: str) -> str:
    cleaned = re.sub(r"[^0-9+]", "", phone.strip())
    if not cleaned.startswith("+"):
        cleaned = "+" + cleaned
    return cleaned
