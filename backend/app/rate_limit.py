from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = None

def init_limiter(app):
    global limiter
    testing = app.config.get("TESTING", False)
    storage_uri = "memory://"
    if not testing:
        redis_url = app.config.get("REDIS_URL", "")
        if redis_url:
            storage_uri = redis_url
    limiter = Limiter(key_func=get_remote_address, storage_uri=storage_uri)
    limiter.init_app(app)
    app.limiter = limiter
    return limiter
