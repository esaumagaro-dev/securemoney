import pytest
from app import create_app
from app.models import db, Role


@pytest.fixture
def app():
    test_app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "MASTER_KEY": "test_master_key_32_bytes_long_123456",
        "JWT_ALGORITHM": "HS256",
        "SECRET_KEY": "test-secret-key-for-hs256",
        "WTF_CSRF_ENABLED": False,
        "RATELIMIT_ENABLED": False,
        "FEATURE_EMAIL_OTP": False,
        "REDIS_URL": "redis://localhost:6379/0",
    })
    with test_app.app_context():
        db.create_all()
        for name in ["user", "admin", "auditor", "support", "agent", "merchant"]:
            if not Role.query.filter_by(name=name).first():
                db.session.add(Role(name=name, permissions={}))
        db.session.commit()
    yield test_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    rv = client.post("/api/auth/register", json={
        "email": "testuser@example.com",
        "password": "TestPass!234"
    })
    assert rv.status_code == 201
    rv2 = client.post("/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "TestPass!234"
    })
    assert rv2.status_code == 200
    token = rv2.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
