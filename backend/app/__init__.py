from dotenv import load_dotenv
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
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=app.config.get("CORS_ORIGINS", "*"), supports_credentials=True)
    if not app.config.get("MASTER_KEY"):
        # In development allow but warn
        app.logger.warning("MASTER_KEY is not set; using insecure default for development")
    db.init_app(app)
    init_limiter(app)
    if app.config.get("SENTRY_DSN"):
        sentry_sdk.init(app.config.get("SENTRY_DSN"), integrations=[FlaskIntegration()])
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(public_bp)
    return app
