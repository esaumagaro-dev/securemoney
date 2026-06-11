import sys
import pathlib
import argparse

# ensure project root (backend/) is on sys.path so `import app` works
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from app import create_app
from app.models import db, Role

app = create_app()

def seed_roles():
    with app.app_context():
        db.create_all()
        for r in ["user", "admin", "auditor", "support"]:
            if not Role.query.filter_by(name=r).first():
                db.session.add(Role(name=r, permissions={}))
        db.session.commit()
        print("Seeded roles")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manage script")
    parser.add_argument("command", choices=["seed_roles"], help="Command to run")
    args = parser.parse_args()
    if args.command == "seed_roles":
        seed_roles()
