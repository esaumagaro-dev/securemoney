# SecureMoney

Secure digital wallet platform with end-to-end encryption (AES-256-GCM), Argon2 password hashing, JWT auth, RBAC, MFA, audit logging, and rate limiting.

- **Backend:** Flask + SQLAlchemy + PostgreSQL/SQLite
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Infra:** Docker Compose (PostgreSQL, Redis, nginx)

---

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm
- (Windows) Use `py` if `python` is not on PATH

---

## Quick Start (Local Dev)

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies (use --only-binary if building C extensions fails)
pip install --only-binary :all: -r requirements.txt

# Copy and edit environment config
cp .env.example .env
# Edit .env — make sure FEATURE_EMAIL_OTP=False for admin login without OTP

# Seed roles and create tables (remove old dev.db first if schema changed)
rm -f dev.db
python manage.py seed_roles

# (Optional) Create admin account
python seed_admin.py

# Start the backend server
python run.py
```

Backend runs at **http://localhost:8000**.

> **Note:** On Windows if `python` isn't found, use `py` instead.  
> The project defaults to SQLite — no PostgreSQL needed for local dev.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (--legacy-peer-deps required for React 19 + qrcode.react)
npm install --legacy-peer-deps

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:3000**.

---

## Flow: Normal User to Admin

### Step 1: Create a normal user account

Open the app at http://localhost:3000 and click **Sign Up**, or use the API:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"MyPassword123","full_name":"John Doe"}'
```

### Step 2: Log in as normal user

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"MyPassword123"}'
```

### Step 3: Seed an admin account

```bash
cd backend && python seed_admin.py
```

This creates `admin@securemoney.com` with password `Admin@123456`.

### Step 4: Log in to the Admin Portal

1. Go to **http://localhost:3000/secure-admin-portal**
2. Email: `admin@securemoney.com`
3. Password: `Admin@123456`

> **Important:** `FEATURE_EMAIL_OTP` in `backend/.env` must be `False` for the admin portal login to work without OTP verification.

Or via API:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@securemoney.com","password":"Admin@123456"}'
```

### Step 5: Use admin features

Once logged in as admin, you can:

| Route | Description |
|---|---|
| `/secure-admin/dashboard` | Analytics overview |
| `/secure-admin/users` | Manage users |
| `/secure-admin/transactions` | View all transactions |
| `/secure-admin/deposits` | Deposit management |
| `/secure-admin/withdrawals` | Withdrawal management |
| `/secure-admin/wallets` | Manage wallets |
| `/secure-admin/agents` | Manage agents |
| `/secure-admin/merchants` | Manage merchants |
| `/secure-admin/reports` | Reports and stats |
| `/secure-admin/notifications` | Broadcast notifications |
| `/secure-admin/security` | Security settings |
| `/secure-admin/settings` | App settings |
| `/secure-admin/content` | Content management |

---

## API Endpoints

### Public
| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/version` | App version |

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/mfa/setup` | Setup TOTP MFA |
| POST | `/api/auth/mfa/verify` | Verify and enable MFA |
| POST | `/api/auth/otp/send` | Send email OTP for login |
| POST | `/api/auth/otp/verify-login` | Verify email OTP and get JWT |
| POST | `/api/auth/otp/send-register` | Send email OTP for registration |
| POST | `/api/auth/otp/verify-register` | Verify email OTP and create account |
| POST | `/api/auth/phone-otp/send` | Send SMS OTP for login |
| POST | `/api/auth/phone-otp/verify-login` | Verify SMS OTP and get JWT |
| POST | `/api/auth/phone-otp/send-register` | Send SMS OTP for registration |
| POST | `/api/auth/phone-otp/verify-register` | Verify SMS OTP and create account |
| POST | `/api/auth/phone-otp/send-verification` | Send SMS OTP to authenticated user |
| POST | `/api/auth/phone-otp/verify-phone` | Verify SMS OTP for authenticated user |

### User
| Method | Path | Description |
|---|---|---|
| GET | `/api/user/balance` | Get wallet balances |
| POST | `/api/user/transfer` | Transfer between wallets |
| GET | `/api/user/transactions` | Transaction history |
| GET | `/api/user/profile` | User profile |
| GET | `/api/user/notifications` | List notifications |
| POST | `/api/user/notifications/read` | Mark notifications read |

### Payments
| Method | Path | Description |
|---|---|---|
| POST | `/api/payments/deposit` | Deposit funds |
| POST | `/api/payments/withdraw` | Withdraw funds |
| POST | `/api/payments/airtime` | Buy airtime |
| POST | `/api/payments/bill` | Pay bills |
| POST | `/api/payments/merchant` | Merchant payment |
| GET | `/api/payments/receipt/<id>` | Get receipt |

### Admin
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/roles` | List roles |
| POST | `/api/admin/roles` | Create role |
| GET | `/api/admin/analytics` | Analytics data |
| GET | `/api/admin/transactions` | All transactions |
| PUT | `/api/admin/transactions/<id>/status` | Update tx status |
| GET | `/api/admin/wallets` | All wallets |
| PUT | `/api/admin/users/<id>/wallet` | Update wallet balance |
| GET | `/api/admin/agents` | List agents |
| POST | `/api/admin/agents` | Create agent |
| GET | `/api/admin/merchants` | List merchants |
| POST | `/api/admin/merchants` | Create merchant |
| GET | `/api/admin/audit` | Audit logs |
| GET | `/api/admin/reports` | Reports |
| POST | `/api/admin/notifications/broadcast` | Broadcast notification |
| GET/PUT | `/api/admin/settings` | App settings |
| GET/PUT | `/api/admin/content` | Content management |

---

## Testing

```bash
# Backend tests
cd backend && pytest -v

# Frontend tests
cd frontend && npm run test
```

## Lint & Type Check

```bash
# Backend
cd backend && black --check app/ tests/

# Frontend (TypeScript type check)
cd frontend && npm run lint
# or: npx tsc --noEmit
```

## Troubleshooting

| Problem | Solution |
|---|---|
| `pip install` fails building C extensions | Use `pip install --only-binary :all: -r requirements.txt` |
| `npm install` peer dependency conflict | Use `npm install --legacy-peer-deps` |
| `sqlite3.OperationalError: no such column` | Delete `backend/dev.db` and re-run `seed_roles` |
| Backend warns "Redis not reachable" | Normal for local dev — uses in-memory rate limiting |
| Admin login returns "OTP required" | Set `FEATURE_EMAIL_OTP=False` in `backend/.env` |

---

## Docker Deployment

```bash
docker compose up --build
```

This starts: PostgreSQL, Redis, backend (uvicorn), frontend (nginx-served), and nginx reverse proxy.

> For Docker, the `backend/.env` expects `DATABASE_URL` and `REDIS_URL` to point to the Docker service names (already configured).

---

## Security Notes

- Change `MASTER_KEY` in production (use Vault/KMS, not `.env`)
- Use RS256 JWT with mounted private/public key files in `/run/secrets/`
- Set `SENDGRID_API_KEY` and `TWILIO_*` for production email/SMS
- Enable `SESSION_COOKIE_SECURE=True` behind TLS
- Restrict `CORS_ORIGINS` to your domain
- `FEATURE_EMAIL_OTP` should be `True` in production for extra login security
- See `docs/SECURITY.md` for full checklist

## Documentation

- API reference: `docs/API.md`
- Deployment guide: `docs/DEPLOY.md`
- Security checklist: `docs/SECURITY.md`
