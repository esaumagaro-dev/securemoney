import pytest
from app import create_app
from app.models import db, Role, User, Wallet

@pytest.fixture
def app():
    test_app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "MASTER_KEY": "test_master_key_32_bytes_long_123456"
    })
    with test_app.app_context():
        db.create_all()
        role = Role.query.filter_by(name="user").first()
        if not role:
            role = Role(name="user", permissions={})
            db.session.add(role)
            db.session.commit()
    yield test_app

def test_transfer_insufficient(client, app):
    client.post("/api/auth/register", json={"email":"a@example.com","password":"P@ssw0rd"})
    client.post("/api/auth/register", json={"email":"b@example.com","password":"P@ssw0rd"})
    r = client.post("/api/auth/login", json={"email":"a@example.com","password":"P@ssw0rd"})
    token = r.get_json().get("access_token")
    rv = client.post("/api/user/transfer", json={"from_wallet": "nonexistent", "to_wallet": "nonexistent", "amount": "10"}, headers={"Authorization": f"Bearer {token}"})
    assert rv.status_code == 400
