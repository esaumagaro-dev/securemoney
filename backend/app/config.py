import os
from datetime import timedelta

class Config:
    # Flask / App
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me-to-a-long-random-string-32bytes")
    ENV = os.getenv("FLASK_ENV", "production")
    DEBUG = ENV != "production"

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'dev.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Key management
    # MASTER_KEY should be provided securely (KMS/Secrets) in production.
    # It is expected to be a base64 or raw 32-byte value depending on your crypto code.
    MASTER_KEY = os.getenv("MASTER_KEY")

    # PBKDF2 settings (used for deriving per-record data keys)
    PBKDF2_ITERATIONS = int(os.getenv("PBKDF2_ITERATIONS", "200000"))

    # Argon2 parameters (password hashing)
    ARGON2_TIME_COST = int(os.getenv("ARGON2_TIME_COST", "3"))
    ARGON2_MEMORY_COST = int(os.getenv("ARGON2_MEMORY_COST", "65536"))  # KiB
    ARGON2_PARALLELISM = int(os.getenv("ARGON2_PARALLELISM", "4"))

    # JWT settings
    # Prefer RS256 with keys stored in a secrets manager in production.
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "RS256")
    JWT_PRIVATE_KEY_PATH = os.getenv("JWT_PRIVATE_KEY_PATH", "/run/secrets/jwt_private.pem")
    JWT_PUBLIC_KEY_PATH = os.getenv("JWT_PUBLIC_KEY_PATH", "/run/secrets/jwt_public.pem")
    ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRES_MINS", "15")))
    REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv("REFRESH_TOKEN_EXPIRES_DAYS", "30")))

    # Rate limiting / Redis
    RATELIMIT_HEADERS_ENABLED = True
    REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
    # Default rate limits (used if you wire them into your limiter setup)
    DEFAULT_RATE_LIMIT = os.getenv("DEFAULT_RATE_LIMIT", "200 per day;50 per hour")
    AUTH_RATE_LIMIT = os.getenv("AUTH_RATE_LIMIT", "10 per minute;100 per hour")

    # Security & cookies
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "True").lower() in ("1", "true", "yes")
    SESSION_COOKIE_HTTPONLY = os.getenv("SESSION_COOKIE_HTTPONLY", "True").lower() in ("1", "true", "yes")
    SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
    REMEMBER_COOKIE_DURATION = timedelta(days=int(os.getenv("REMEMBER_COOKIE_DAYS", "30")))

    # CORS - keep strict allowlist in production
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

    # Monitoring / Sentry
    SENTRY_DSN = os.getenv("SENTRY_DSN", "")

    # App behavior toggles
    REQUIRE_EMAIL_VERIFICATION = os.getenv("REQUIRE_EMAIL_VERIFICATION", "True").lower() in ("1", "true", "yes")
    FORCE_HTTPS = os.getenv("FORCE_HTTPS", "True").lower() in ("1", "true", "yes")

    # Misc
    # Path to directory where ephemeral secrets can be mounted (for Docker secrets / KMS bridges)
    SECRETS_MOUNT_PATH = os.getenv("SECRETS_MOUNT_PATH", "/run/secrets")

    # Pagination/defaults
    DEFAULT_PAGE_SIZE = int(os.getenv("DEFAULT_PAGE_SIZE", "25"))
    MAX_PAGE_SIZE = int(os.getenv("MAX_PAGE_SIZE", "200"))

    # Email / notifications (placeholders - configure in production)
    MAIL_FROM = os.getenv("MAIL_FROM", "noreply@securemoney.example")
    MAILER_URL = os.getenv("MAILER_URL", "")

    # Feature flags (for gradual rollout / testing)
    FEATURE_MFA = os.getenv("FEATURE_MFA", "True").lower() in ("1", "true", "yes")
    FEATURE_ADMIN_AUDIT_SEARCH = os.getenv("FEATURE_ADMIN_AUDIT_SEARCH", "True").lower() in ("1", "true", "yes")
