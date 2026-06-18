# SecureMoney

SecureMoney is a secure mobile money web application scaffold (backend: Flask / FastAPI; frontend: React + Vite + TypeScript). This repository implements AES-256-GCM encrypted fields, Argon2 password hashing, JWT auth, RBAC, MFA hooks, audit logs, rate limiting, and a full frontend prototype.

## Documentation

- API reference: `docs/API.md`
- Deployment guide: `docs/DEPLOY.md`
- Security checklist: `docs/SECURITY.md`

## Project structure

```
backend/
  app/
    routes/          # API blueprints
    models.py        # SQLAlchemy models with encrypted columns
    crypto.py        # AES-256-GCM + PBKDF2 helpers
    auth.py          # Argon2, JWT, MFA/OTP setup
    email_service.py # OTP via SendGrid or console fallback
    audit.py         # Audit logging
    rate_limit.py    # Flask-Limiter + Redis
    utils.py         # jwt_required, roles_required
  tests/             # pytest suite
  requirements.txt
  pyproject.toml
frontend/
  src/               # React + TypeScript + Tailwind
  package.json
  vite.config.js
  tsconfig.json
  Dockerfile
infra/nginx/
  default.conf      # Reverse proxy for API + static assets
docker-compose.yml
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optional but recommended)
- PostgreSQL (optional for local; SQLite is used for default/tests)

## Local development

### Backend

Install dependencies:

```bash
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
```

Generate a dev master key (required for encrypted fields):

```bash
python -c "import os; print(os.urandom(32).hex())"
```

Paste the value into `MASTER_KEY` in `backend/.env`.

Run migrations / create tables:

```bash
python backend/manage.py seed_roles
```

Start the backend:

```bash
python backend/run.py
```

Backend is available at `http://localhost:8000`.

### Frontend

Install dependencies:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend is available at `http://localhost:3000`.

## Testing

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm run test
```

## Production deployment

Minimum production configuration requires:

- Postgres and Redis managed services
- KMS/Vault for `MASTER_KEY` / JWT keys
- TLS termination at the load balancer
- Strict `CORS_ORIGINS`
- `SESSION_COOKIE_SECURE=True`
- `FEATURE_EMAIL_OTP` gated appropriately
- Monitoring (Sentry, Prometheus/Grafana)

Build and run with Docker Compose:

```bash
docker compose up --build
```

## Security

- Do **not** commit secrets to the repository.
- Use RS256 for JWT in production; mount `/run/secrets/jwt_private.pem` and `/run/secrets/jwt_public.pem`.
- Rotate secrets regularly.
- See `docs/SECURITY.md` for the full checklist.
