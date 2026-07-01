from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = None

def init_limiter(app):
    global limiter
    storage_uri = "memory://"
    redis_url = app.config.get("REDIS_URL", "")
    if redis_url:
        try:
            import redis
            r = redis.from_url(redis_url)
            r.ping()
            storage_uri = redis_url
        except Exception:
            app.logger.warning(f"Redis at {redis_url} not reachable; using in-memory rate limiting")
    limiter = Limiter(key_func=get_remote_address, storage_uri=storage_uri)
    limiter.init_app(app)
    app.limiter = limiter
    return limiter
