from app import create_app
from app.models import db, User, Role

app = create_app()
with app.app_context():
    email = "admin@securemoney.com"
    password = "Admin@123456"

    existing = User.query.filter_by(email=email).first()
    if existing:
        print(f"Admin user already exists: {email}")
    else:
        admin_role = Role.query.filter_by(name="admin").first()
        if not admin_role:
            print("Admin role not found - run the app first so roles are seeded")
            exit(1)

        from argon2 import PasswordHasher
        ph = PasswordHasher()
        user = User(
            email=email,
            password_hash=ph.hash(password),
            role_id=admin_role.id,
            full_name_encrypted="Admin User"
        )
        db.session.add(user)
        db.session.commit()
        print(f"Admin user created: {email} / {password}")

    # Also show all admin users
    admin_role = Role.query.filter_by(name="admin").first()
    if admin_role:
        admins = User.query.filter_by(role_id=admin_role.id).all()
        print(f"\nAdmin accounts ({len(admins)}):")
        for a in admins:
            print(f"  {a.email}")
