from run import app
from app.models import db, Role

def reproduce():
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "MASTER_KEY": "test_master_key_32_bytes_long_123456"
    })
    with app.app_context():
        db.create_all()
        if not Role.query.filter_by(name="user").first():
            db.session.add(Role(name="user", permissions={}))
        if not Role.query.filter_by(name="admin").first():
            db.session.add(Role(name="admin", permissions={}))
        db.session.commit()
    client = app.test_client()
    rv = client.post("/api/auth/register", json={"email":"bob@example.com", "password":"StrongPass!1"})
    print("Status:", rv.status_code)
    try:
        print("JSON:", rv.get_json())
    except Exception:
        print("Data:", rv.data)

if __name__ == '__main__':
    reproduce()
