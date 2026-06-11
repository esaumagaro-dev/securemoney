from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

def init_limiter(app):
    redis_url = app.config.get("REDIS_URL")
    limiter = Limiter(key_func=get_remote_address, storage_uri=redis_url)
    limiter.init_app(app)
    return limiter
