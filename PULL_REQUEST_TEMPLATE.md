# Pull Request: Initial scaffold for SecureMoney

This PR adds the initial project scaffold for the SecureMoney application.

Summary of changes:
- Backend: Flask API with AES-256-GCM encrypted fields, Argon2 password hashing, JWT auth (RS256/HS256 fallback), RBAC, MFA hooks, audit logs, rate limiting, Google OAuth verify endpoint, and basic endpoints for register/login/balance/transfer.
- Frontend: React + Vite + Tailwind prototype with Login and Dashboard, Google Sign-In button component.
- Infra: Dockerfiles for backend and frontend, docker-compose.yml, nginx config.
- Tests: Pytest examples for auth and transfers.
- Docs: API.md, DEPLOY.md, SECURITY.md, GOOGLE_OAUTH.md, README with run instructions.

Checklist before merging:
- [ ] Confirm secrets will be provided via a secrets manager (do not commit MASTER_KEY or private keys).
- [ ] Review and update environment-specific configuration for production (DATABASE_URL, REDIS_URL, JWT keys, MASTER_KEY).
- [ ] Configure Google OAuth credentials and set VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID.
- [ ] Run and pass CI tests.

Notes:
- This is a scaffold and must be reviewed and hardened for production (KMS/secret manager integration, key rotation, CSP, secure cookie policy, production monitoring, etc.).
