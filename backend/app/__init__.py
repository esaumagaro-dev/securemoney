from dotenv import load_dotenv
import os

# Load .env BEFORE any Config/model import so env vars are available
load_dotenv()

from flask import Flask
from flask_cors import CORS
from .config import Config
from .models import db
from .rate_limit import init_limiter
from .auth import bp as auth_bp
from .routes.user import bp as user_bp
from .routes.admin import bp as admin_bp
from .routes.public import bp as public_bp
from .routes.payments import bp as payments_bp
from .routes.email_otp import bp as email_otp_bp
from .routes.phone_otp import bp as phone_otp_bp
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

def create_app(config_overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    # Allow callers (tests, scripts) to override configuration before initialization
    if config_overrides:
        app.config.update(config_overrides)
    CORS(app, origins=app.config.get("CORS_ORIGINS", "*"), supports_credentials=True)
    if not app.config.get("MASTER_KEY"):
        app.logger.warning("MASTER_KEY is not set — encryption will derive key from SECRET_KEY. Set MASTER_KEY env var for production.")
    db.init_app(app)
    init_limiter(app)
    if app.config.get("SENTRY_DSN"):
        sentry_sdk.init(app.config.get("SENTRY_DSN"), integrations=[FlaskIntegration()])
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(email_otp_bp)
    app.register_blueprint(phone_otp_bp)

    # Apply rate limits after all blueprints registered
    limiter = app.limiter
    if limiter:
        limiter.limit("10 per minute;100 per hour")(auth_bp)
        limiter.limit("5 per minute;20 per hour")(email_otp_bp)
        limiter.limit("5 per minute;20 per hour")(phone_otp_bp)

    with app.app_context():
        from .models import Role, User
        from sqlalchemy.exc import OperationalError
        from argon2 import PasswordHasher
        try:
            db.create_all()
        except OperationalError:
            db.session.rollback()
            app.logger.info("Tables already exist, skipping create_all")
        role_names = ["user", "admin", "auditor", "support", "agent", "merchant"]
        for name in role_names:
            if not Role.query.filter_by(name=name).first():
                db.session.add(Role(name=name, permissions={}))
        db.session.commit()
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@securemoney.com")
        admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123456")
        existing = User.query.filter_by(email=admin_email).first()
        if existing:
            app.logger.info(f"Admin user already exists: {admin_email}")
        else:
            admin_role = Role.query.filter_by(name="admin").first()
            if admin_role:
                ph = PasswordHasher()
                user = User(
                    email=admin_email,
                    password_hash=ph.hash(admin_password),
                    role_id=admin_role.id,
                    full_name_encrypted="Admin User"
                )
                db.session.add(user)
                db.session.commit()
                app.logger.info(f"Default admin user created: {admin_email} / {admin_password}")
            else:
                app.logger.error("Admin role not found - cannot create admin user")

    return app
