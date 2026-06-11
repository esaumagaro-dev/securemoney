import pytest
from run import app as flask_app
from app.models import db, Role

@pytest.fixture
def app():
    flask_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "MASTER_KEY": "test_master_key_32_bytes_long_123456"
    })
    with flask_app.app_context():
        db.create_all()
        role_user = Role.query.filter_by(name="user").first()
        if not role_user:
            db.session.add(Role(name="user", permissions={}))
        role_admin = Role.query.filter_by(name="admin").first()
        if not role_admin:
            db.session.add(Role(name="admin", permissions={}))
        db.session.commit()
    yield flask_app

def test_register_and_login(client):
    rv = client.post("/api/auth/register", json={"email":"bob@example.com", "password":"StrongPass!1"})
    assert rv.status_code == 201
    rv2 = client.post("/api/auth/login", json={"email":"bob@example.com", "password":"StrongPass!1"})
    assert rv2.status_code == 200
    assert "access_token" in rv2.get_json()
