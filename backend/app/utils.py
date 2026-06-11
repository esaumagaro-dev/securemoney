from functools import wraps
from flask import request, jsonify, current_app, g
import jwt
from .auth import load_jwt_keys
from .models import User

def _decode_token(token):
    _, public = load_jwt_keys()
    try:
        if public:
            payload = jwt.decode(token, public, algorithms=[current_app.config['JWT_ALGORITHM']])
        else:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except Exception:
        return None

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"msg": "Missing token"}), 401
        token = auth.split(" ", 1)[1]
        payload = _decode_token(token)
        if not payload:
            return jsonify({"msg": "Invalid or expired token"}), 401
        user = db.session.get(User, payload.get("uid"))
        if not user:
            return jsonify({"msg": "User not found"}), 401
        g.user = user
        g.jwt_payload = payload
        return f(*args, **kwargs)
    return decorated

def roles_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not getattr(g, "user", None):
                return jsonify({"msg": "Unauthorized"}), 401
            role_name = g.user.role.name if g.user.role else None
            if role_name not in allowed_roles:
                return jsonify({"msg": "Forbidden"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
