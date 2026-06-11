import sys
import pathlib

# ensure project root (backend/) is on sys.path so `import app` works
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from app import create_app
from app.models import db, Role

app = create_app()

with app.app_context():
    db.create_all()
    for r in ["user", "admin", "auditor", "support"]:
        if not Role.query.filter_by(name=r).first():
            db.session.add(Role(name=r, permissions={}))
    db.session.commit()

print("Seeded roles")