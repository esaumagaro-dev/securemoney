from flask import request
from .models import db, AuditLog
import json

def audit_log(user_id, action, resource_type, resource_id, details=None):
    log = AuditLog(user_id=user_id, action=action, resource_type=resource_type, resource_id=resource_id, details_encrypted=json.dumps(details) if details else None, ip=request.remote_addr, user_agent=request.headers.get("User-Agent"))
    db.session.add(log)
    db.session.commit()
