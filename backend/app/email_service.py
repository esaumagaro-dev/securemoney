import os
import random
import hashlib
import hmac
import time
import threading
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

def _store_key(email: str) -> str:
    return email.lower().strip()

def generate_otp(email: str) -> str:
    code = str(random.randint(10**(OTP_LENGTH-1), 10**OTP_LENGTH - 1))
    key = _store_key(email)
    hashed = hashlib.sha256(code.encode()).hexdigest()
    with _cleanup_lock:
        _cleanup_expired()
        _otp_store[key] = {
            "code": hashed,
            "expiry": int(time.time()) + OTP_EXPIRY_SECONDS,
            "attempts": 0
        }
    return code

def verify_otp(email: str, code: str) -> bool:
    key = _store_key(email)
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

def send_otp_email(email: str) -> bool:
    code = generate_otp(email)
    api_key = current_app.config.get("SENDGRID_API_KEY", "")
    mail_from = current_app.config.get("MAIL_FROM", "noreply@securemoney.co.tz")

    if not api_key or api_key == "placeholder":
        current_app.logger.warning(
            f"SENDGRID_API_KEY not configured. "
            f"OTP for {email}: {code} (would be sent via email)"
        )
        print(f"\n===== EMAIL OTP ({email}) =====\n{code}\n==============================\n")
        return True

    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email, To, Content

        sg = sendgrid.SendGridAPIClient(api_key=api_key)
        message = Mail(
            from_email=mail_from,
            to_emails=email,
            subject="Your SecureMoney Verification Code",
            html_content=(
                f"<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:16px;'>"
                f"<div style='text-align:center;padding:16px 0;'>"
                f"<div style='width:48px;height:48px;background:#2563eb;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;'>"
                f"<span style='color:white;font-size:24px;font-weight:bold;'>S</span></div>"
                f"<h2 style='margin:0;color:#1e293b;'>SecureMoney</h2></div>"
                f"<div style='background:white;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);'>"
                f"<h3 style='margin:0 0 8px 0;color:#1e293b;'>Your verification code</h3>"
                f"<p style='color:#64748b;margin:0 0 16px 0;font-size:14px;'>Use this code to complete your action. It expires in 5 minutes.</p>"
                f"<div style='background:#f1f5f9;border-radius:8px;padding:16px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#2563eb;font-family:monospace;'>{code}</div>"
                f"<p style='color:#94a3b8;font-size:12px;margin:16px 0 0 0;text-align:center;'>If you did not request this code, ignore this email.</p></div>"
                f"<div style='text-align:center;padding:16px 0;color:#94a3b8;font-size:12px;'>&copy; 2026 SecureMoney. All rights reserved.</div></div>"
            )
        )
        sg.send(message)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send OTP email to {email}: {e}")
        print(f"\n===== EMAIL OTP (SendGrid failed, fallback - {email}) =====\n{code}\n===================================================\n")
        return True
