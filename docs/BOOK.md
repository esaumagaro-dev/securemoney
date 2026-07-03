# SecureMoney — Complete Project Documentation

> A secure digital wallet platform built with Flask + React, featuring field-level AES-256-GCM encryption, JWT authentication, rate limiting, and a full admin panel.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Database Design](#4-database-design)
5. [Security Architecture](#5-security-architecture)
6. [API Reference](#6-api-reference)
7. [Frontend Routes](#7-frontend-routes)
8. [Deployment Guide](#8-deployment-guide)
9. [Environment Variables](#9-environment-variables)
10. [Admin Panel](#10-admin-panel)
11. [Development Setup](#11-development-setup)
12. [Testing](#12-testing)

---

## 1. Project Overview

SecureMoney is a full-stack digital wallet application that allows users to:

- Create accounts with encrypted personal data
- Send and receive money between wallets
- Deposit and withdraw funds
- Purchase airtime and pay bills
- Make merchant payments
- View transaction history
- Enable MFA (TOTP) for enhanced security
- Receive real-time notifications

**Admin capabilities:**
- View all users, wallets, transactions
- Manage agents and merchants
- Generate reports and analytics
- Broadcast notifications
- Audit logging for all actions
- Content management system

---

## 2. Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Browser   │────▶│  Nginx (80)  │────▶│  Frontend  │
│  (React SPA)│     │  (optional)  │     │  (Vite SPA)│
└─────────────┘     └──────────────┘     └────────────┘
                           │
                           ▼
                    ┌──────────────┐     ┌────────────┐
                    │   Backend    │────▶│ PostgreSQL │
                    │  (Gunicorn   │     │  (Database)│
                    │   + Flask)   │     └────────────┘
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Redis     │
                    │ (Rate Limiter│
                    │   + Cache)   │
                    └──────────────┘
```

### Component Breakdown

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 19 + Vite + Tailwind CSS | User interface (SPA) |
| **Backend** | Python 3.11 + Flask 2.3 | REST API server |
| **Database** | PostgreSQL 15 | Persistent data storage |
| **Cache** | Redis 7 | Rate limiting (fallback: in-memory) |
| **Web Server** | Nginx | SPA routing + static file serving |
| **Reverse Proxy** | Nginx (optional) | Route / to frontend, /api/ to backend |

### Application Flow

1. User visits frontend URL → Nginx serves React SPA
2. SPA makes API calls to `/api/auth/login`, `/api/user/balance`, etc.
3. Backend validates JWT tokens, processes requests, queries PostgreSQL
4. Sensitive fields are encrypted/decrypted transparently using AES-256-GCM
5. Rate limiting applied via Redis (or in-memory fallback)
6. Admin actions are logged to audit trail

---

## 3. Tech Stack

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| Flask | >=2.3 | Web framework |
| Flask-SQLAlchemy | >=3.0 | ORM |
| SQLAlchemy | >=2.0 | Database abstraction |
| Flask-CORS | >=4.0 | Cross-origin requests |
| Flask-Limiter | >=2.9 | Rate limiting |
| gunicorn | >=23.0 | WSGI production server |
| psycopg2-binary | >=2.9 | PostgreSQL driver |
| PyJWT | >=2.8 | JWT authentication |
| pycryptodome | >=3.18 | AES-256-GCM encryption |
| argon2-cffi | >=21.3 | Password hashing |
| pyotp | >=2.8 | TOTP/MFA |
| python-dotenv | >=1.0 | Environment variables |
| redis | >=4.5 | Redis client |
| sentry-sdk | >=1.20 | Error monitoring |
| sendgrid | >=6.11 | Email service |
| twilio | >=8.0 | SMS service |
| pytest | >=7.2 | Testing |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| React | ^19.0.0 | UI framework |
| React Router | ^7.17.0 | Client routing |
| Axios | ^1.4.0 | HTTP client |
| Vite | ^5.0.0 | Build tool |
| Tailwind CSS | ^3.4.17 | CSS framework |
| Framer Motion | ^12.40.0 | Animations |
| i18next | ^23.0.0 | Internationalization |
| Chart.js + react-chartjs-2 | ^4.4.0 / ^5.2.0 | Charts |
| Recharts | ^3.8.1 | Charts |
| react-hot-toast | ^2.6.0 | Notifications |
| qrcode.react | ^4.0.0 | QR codes |
| lucide-react | ^0.525.0 | Icons |
| TypeScript | ^5.5.0 | Type safety |

---

## 4. Database Design

### Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│   Role   │◀──────│   User   │──────▶│    Wallet    │
├──────────┤ 1:N   ├──────────┤ 1:N   ├──────────────┤
│ id       │       │ id       │       │ id           │
│ name     │       │ email    │       │ user_id      │
│ perms    │       │ password │       │ currency     │
└──────────┘       │ full_name│       │ balance_enc  │
                   │ phone_enc│       │ created_at   │
                   │ role_id  │       └──────────────┘
                   │ mfa      │              │
                   │ created  │              │ 1:N
                   └──────────┘              │
                        │ 1:N               ▼
                        │           ┌──────────────┐
                        │           │ Transaction  │
                        │           ├──────────────┤
                        │           │ id           │
                        │ 1:N       │ from_wallet  │
                        ▼           │ to_wallet    │
                   ┌──────────┐     │ amount_enc   │
                   │Notification│    │ currency     │
                   ├──────────┤     │ type         │
                   │ id       │     │ status       │
                   │ user_id  │     │ created_at   │
                   │ type     │     └──────────────┘
                   │ message  │
                   │ read     │     ┌──────────────┐
                   └──────────┘     │  AuditLog    │
                                    ├──────────────┤
                                    │ id           │
                                    │ user_id      │
                                    │ action       │
                                    │ resource     │
                                    │ details_enc  │
                                    │ ip           │
                                    │ created_at   │
                                    └──────────────┘
```

### Role (roles)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR(50) | Unique. Seeded: user, admin, auditor, support, agent, merchant |
| permissions | JSON | Permissions map |

### User (users)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique, indexed |
| password_hash | VARCHAR(512) | Argon2 hash |
| full_name_encrypted | EncryptedType | AES-256-GCM |
| phone_encrypted | EncryptedType | AES-256-GCM |
| phone_hash | VARCHAR(64) | SHA-256 for lookup |
| role_id | UUID | FK → roles.id |
| mfa_enabled | Boolean | Default false |
| mfa_secret_encrypted | EncryptedType | TOTP secret |
| created_at | DateTime | UTC |
| updated_at | DateTime | Auto-updated |

### Wallet (wallets)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| currency | VARCHAR(10) | e.g., TZS, USD |
| balance_encrypted | EncryptedType | AES-256-GCM |
| balance_crypto_meta | JSON | Encryption metadata |
| created_at | DateTime | UTC |

### Transaction (transactions)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| from_wallet_id | UUID | FK → wallets.id (nullable for deposits) |
| to_wallet_id | UUID | FK → wallets.id (nullable for withdrawals) |
| amount_encrypted | EncryptedType | AES-256-GCM |
| currency | VARCHAR(10) | Currency code |
| type | VARCHAR(50) | transfer, deposit, withdraw, airtime, bill_payment, merchant_payment |
| status | VARCHAR(20) | pending, completed, failed |
| meta_encrypted | EncryptedType | JSON metadata |
| created_at | DateTime | UTC |

### AuditLog (audit_logs)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id (nullable) |
| action | VARCHAR(100) | Action name |
| resource_type | VARCHAR(100) | Resource type |
| resource_id | VARCHAR(100) | Resource ID |
| details_encrypted | EncryptedType | JSON details |
| ip | VARCHAR(100) | Client IP |
| user_agent | VARCHAR(250) | User agent |
| created_at | DateTime | UTC |

### Notification (notifications)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id |
| type | VARCHAR(50) | Notification type |
| message | VARCHAR(500) | Notification text |
| resource_id | VARCHAR(100) | Related entity ID |
| read | Boolean | Default false |
| created_at | DateTime | UTC |

---

## 5. Security Architecture

### 5.1 Field-Level Encryption

**Algorithm:** AES-256-GCM with PBKDF2 key derivation

```
Master Key (from env MASTER_KEY)
        │
        ▼
PBKDF2-HMAC-SHA512 (200,000 iterations)
        │
        ▼
Per-Record Data Key (32 bytes)
        │
        ▼
AES-256-GCM Encryption
        │
        ├── Encrypted ciphertext
        └── Metadata: salt, nonce, tag (stored alongside)
```

- Each record uses a unique random salt and nonce
- Encryption metadata is stored as JSON next to the ciphertext
- The master key is never stored in the database
- Without the master key, encrypted fields are unreadable

**Encrypted fields:**
- `User.full_name_encrypted`
- `User.phone_encrypted`
- `User.mfa_secret_encrypted`
- `Wallet.balance_encrypted`
- `Transaction.amount_encrypted`
- `Transaction.meta_encrypted`
- `AuditLog.details_encrypted`

### 5.2 Password Hashing

- **Algorithm:** Argon2id (memory-hard, resistant to GPU/ASIC attacks)
- **Time cost:** 3 iterations
- **Memory cost:** 64 MB
- **Parallelism:** 4 threads

### 5.3 Authentication

| Feature | Implementation |
|---------|---------------|
| **JWT Tokens** | RS256 (asymmetric, preferred) or HS256 (symmetric fallback) |
| **Access Token TTL** | 15 minutes |
| **Refresh Token TTL** | 30 days |
| **MFA** | TOTP (Time-based One-Time Password) via pyotp |
| **Email OTP** | 6-digit code, 5-minute expiry, max 5 attempts |
| **Rate Limiting** | Auth: 10/min, 100/hr; OTP: 5/min, 20/hr |

### 5.4 API Security

- All endpoints require JWT Bearer token (except auth routes)
- Rate limiting per blueprint
- CORS whitelist configuration
- Secure cookie flags (HTTPOnly, Secure, SameSite=Lax)
- Admin routes require specific roles (admin, support, auditor)
- Audit logging for all sensitive operations

---

## 6. API Reference

### 6.1 Authentication Routes

**Base path:** `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create user account |
| POST | `/api/auth/login` | No | Login (supports MFA) |
| POST | `/api/auth/refresh` | No | Refresh JWT token |
| POST | `/api/auth/mfa/setup` | JWT | Generate TOTP secret |
| POST | `/api/auth/mfa/verify` | JWT | Verify and enable MFA |
| POST | `/api/auth/logout` | No | Logout |

### 6.2 OTP Routes

**Base path:** `/api/auth/otp`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/otp/send` | No | Send email OTP (login 2FA) |
| POST | `/api/auth/otp/verify-login` | No | Verify OTP, get tokens |
| POST | `/api/auth/otp/send-register` | No | Send registration OTP |
| POST | `/api/auth/otp/verify-register` | No | Verify OTP, create account |

### 6.3 Phone OTP Routes

**Base path:** `/api/auth/phone-otp`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/phone-otp/send` | No | Send SMS OTP (login 2FA) |
| POST | `/api/auth/phone-otp/verify-login` | No | Verify phone OTP |
| POST | `/api/auth/phone-otp/send-register` | No | Send registration SMS |
| POST | `/api/auth/phone-otp/verify-register` | No | Verify OTP, create account |
| POST | `/api/auth/phone-otp/verify-phone` | JWT | Verify phone for existing user |
| POST | `/api/auth/phone-otp/send-verification` | JWT | Send phone verification |

### 6.4 User Routes

**Base path:** `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/balance` | JWT | List wallets + balances |
| POST | `/api/user/transfer` | JWT | Transfer between wallets |
| GET | `/api/user/transactions` | JWT | Transaction history (paginated) |
| GET | `/api/user/profile` | JWT | User profile |
| GET | `/api/user/notifications` | JWT | List notifications |
| POST | `/api/user/notifications/read` | JWT | Mark notifications read |

### 6.5 Payment Routes

**Base path:** `/api/payments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/deposit` | JWT | Deposit to wallet |
| POST | `/api/payments/withdraw` | JWT | Withdraw from wallet |
| POST | `/api/payments/airtime` | JWT | Purchase airtime |
| POST | `/api/payments/bill` | JWT | Pay a bill |
| POST | `/api/payments/merchant` | JWT | Pay a merchant |
| GET | `/api/payments/receipt/<tx_id>` | JWT | Get transaction receipt |

### 6.6 Admin Routes

**Base path:** `/api/admin`

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/admin/users` | admin, support | List all users |
| GET | `/api/admin/roles` | admin | List roles |
| POST | `/api/admin/roles` | admin | Create role |
| GET | `/api/admin/audit` | admin, auditor | Audit logs |
| GET | `/api/admin/analytics` | admin | Dashboard stats |
| GET | `/api/admin/transactions` | admin, support | All transactions |
| PUT | `/api/admin/transactions/<id>/status` | admin | Update status |
| GET | `/api/admin/wallets` | admin, support | All wallets |
| PUT | `/api/admin/users/<id>/wallet` | admin | Update wallet balance |
| GET/PUT | `/api/admin/settings` | admin | System settings |
| POST | `/api/admin/notifications/broadcast` | admin | Broadcast to all users |
| GET | `/api/admin/agents` | admin | List agents |
| POST | `/api/admin/agents` | admin | Create agent |
| GET | `/api/admin/merchants` | admin | List merchants |
| POST | `/api/admin/merchants` | admin | Create merchant |
| GET | `/api/admin/reports` | admin | Aggregated reports |
| GET/PUT | `/api/admin/content` | admin | CMS content |

### 6.7 Public Routes

**Base path:** `/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/version` | App version |

---

## 7. Frontend Routes

### 7.1 Public (No Auth Required)

| Path | Page | Description |
|------|------|-------------|
| `/` | Landing | Landing/home page |
| `/login` | Login | User login form |
| `/register` | Register | User registration |
| `/secure-admin-portal` | AdminLogin | Admin login portal |

### 7.2 User (Auth Required)

| Path | Page | Description |
|------|------|-------------|
| `/dashboard` | Dashboard | Main user dashboard |
| `/send` | SendMoney | Send money to another wallet |
| `/receive` | ReceiveMoney | Generate QR code for receiving |
| `/withdraw` | Withdraw | Withdraw funds |
| `/deposit` | Deposit | Deposit funds |
| `/history` | TransactionHistory | View transaction history |
| `/security` | Security | MFA setup and management |
| `/profile` | Profile | View/edit profile |
| `/settings` | Settings | User preferences |
| `/notifications` | Notifications | View notifications |
| `/airtime` | Airtime | Purchase airtime |
| `/bills` | BillPayments | Pay bills |
| `/merchant` | MerchantPayments | Pay merchants |

### 7.3 Admin (Admin/Support Role Required)

| Path | Page | Description |
|------|------|-------------|
| `/secure-admin/dashboard` | AdminDashboard | Admin overview |
| `/secure-admin/users` | AdminUsers | User management |
| `/secure-admin/transactions` | AdminTransactions | All transactions |
| `/secure-admin/deposits` | AdminDeposits | Deposit management |
| `/secure-admin/withdrawals` | AdminWithdrawals | Withdrawal management |
| `/secure-admin/wallets` | AdminWallets | Wallet management |
| `/secure-admin/agents` | AdminAgents | Agent management |
| `/secure-admin/merchants` | AdminMerchants | Merchant management |
| `/secure-admin/reports` | AdminReports | Reports and analytics |
| `/secure-admin/security` | AdminSecurity | Security audit logs |
| `/secure-admin/settings` | AdminSettings | System settings |
| `/secure-admin/notifications` | AdminNotifications | Broadcast notifications |
| `/secure-admin/content` | AdminContent | CMS content management |

### 7.4 Route Guards

| Guard | Logic |
|-------|-------|
| **GuestGuard** | Redirects authenticated users: admin → `/secure-admin/dashboard`, user → `/dashboard` |
| **AuthGuard** | Redirects unauthenticated users to `/login` |
| **AdminGuard** | Redirects unauthenticated to `/secure-admin-portal`, non-admin to `/dashboard` |

---

## 8. Deployment Guide

### 8.1 Railway Deployment

#### Prerequisites

- GitHub repository
- Railway account (railway.app)

#### Setup Steps

**1. Create Project on Railway**

- New Project → Deploy from GitHub repo → Select `securemoney`

**2. Create Backend Service**

- New → Service → GitHub Repo → Select `securemoney`
- Root Directory: `backend`

**3. Create Frontend Service**

- New → Service → GitHub Repo → Select `securemoney`
- Root Directory: `frontend`

**4. Add PostgreSQL**

- New → Plugin → Database → PostgreSQL

**5. Add Redis**

- New → Plugin → Redis

**6. Backend Environment Variables**

Set in backend service → Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:<password>@<host>:5432/<db>` |
| `REDIS_URL` | `redis://<host>:6379` |
| `FLASK_ENV` | `production` |
| `MASTER_KEY` | 32+ character random string |
| `SECRET_KEY` | 64+ character random string |
| `JWT_ALGORITHM` | `HS256` |
| `CORS_ORIGINS` | `https://<frontend-url>.up.railway.app` |
| `SENDGRID_API_KEY` | (optional) For email |
| `MAIL_FROM` | Verified sender email |

**7. Frontend Environment Variables**

Set in frontend service → Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://<backend-url>.up.railway.app/api` |

**8. Generate Domains**

- Backend: Settings → Networking → Generate Domain
- Frontend: Settings → Networking → Generate Domain

**9. Redeploy Both Services**

**10. Create Admin User**

Open backend Shell and run:
```bash
python seed_admin.py
```
Default credentials: `admin@securemoney.com` / `Admin@123456`

### 8.2 VPS Deployment (Docker Compose)

#### Prerequisites

- VPS with Docker and Docker Compose installed
- Domain pointing to server IP
- Ports 80 and 443 open

#### Setup

1. Clone repository:
```bash
git clone https://github.com/yourusername/securemoney.git
cd securemoney
```

2. Set environment variables in `backend/.env`:
```
DATABASE_URL=postgresql+psycopg://securemoney:securemoney_pass@postgres:5432/securemoney
MASTER_KEY=your-32-char-master-key
REDIS_URL=redis://redis:6379/0
FLASK_ENV=production
JWT_ALGORITHM=HS256
SECRET_KEY=your-64-char-secret-key
CORS_ORIGINS=https://your-domain.com
```

3. Set frontend `VITE_API_BASE_URL` in `frontend/.env`:
```
VITE_API_BASE_URL=https://your-domain.com/api
```

4. Start services:
```bash
docker-compose up -d --build
```

5. Seed admin user:
```bash
docker exec -it securemoney_backend_1 python seed_admin.py
```

6. Configure nginx SSL (optional):
```bash
docker exec -it securemoney_nginx_1 nginx -s reload
```

### 8.3 Hosting Comparison

| Provider | Min Price | Specs | Notes |
|----------|-----------|-------|-------|
| Railway | $0-5/mo | Managed | Easiest, built-in DB + Redis |
| Hetzner CX22 | ~€4/mo | 2 vCPU, 4GB RAM | Best value VPS |
| DigitalOcean Basic | $6/mo | 1 vCPU, 1GB RAM | Tight, need $12 plan |
| Linode | $5/mo | 1 vCPU, 1GB RAM | Similar to DO |

---

## 9. Environment Variables

### 9.1 Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `sqlite:////tmp/dev.db` | PostgreSQL connection string |
| `MASTER_KEY` | Yes | — | 32+ byte key for field encryption |
| `SECRET_KEY` | Yes | Dev default | Flask secret key |
| `REDIS_URL` | No | `redis://redis:6379/0` | Redis connection (optional) |
| `FLASK_ENV` | No | `production` | `development` or `production` |
| `JWT_ALGORITHM` | No | `RS256` | `RS256` (PEM files) or `HS256` (simpler) |
| `JWT_PRIVATE_KEY_PATH` | No | `/run/secrets/jwt_private.pem` | RS256 private key |
| `JWT_PUBLIC_KEY_PATH` | No | `/run/secrets/jwt_public.pem` | RS256 public key |
| `PBKDF2_ITERATIONS` | No | `200000` | Encryption KDF iterations |
| `ARGON2_TIME_COST` | No | `3` | Hashing time cost |
| `ARGON2_MEMORY_COST` | No | `65536` | Hashing memory in KiB |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated origins |
| `SENDGRID_API_KEY` | No | — | SendGrid API key |
| `MAIL_FROM` | No | `noreply@securemoney.co.tz` | Email from address |
| `TWILIO_ACCOUNT_SID` | No | — | Twilio SID |
| `TWILIO_AUTH_TOKEN` | No | — | Twilio auth token |
| `TWILIO_FROM_NUMBER` | No | — | Twilio phone number |
| `SENTRY_DSN` | No | — | Sentry error monitoring |

### 9.2 Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | `http://localhost:8000/api` | Backend API URL |

### 9.3 Railway-Specific

When deploying on Railway, use these reference variables:

| Variable | Reference Value |
|----------|----------------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (or raw URL) |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` (or raw URL) |
| `CORS_ORIGINS` | `https://<frontend-url>.up.railway.app` |
| `VITE_API_BASE_URL` | `https://<backend-url>.up.railway.app/api` |

---

## 10. Admin Panel

### 10.1 Access

- **URL:** `https://<frontend-url>/secure-admin-portal`
- **Default credentials:** `admin@securemoney.com` / `Admin@123456`
- Create admin: Run `python seed_admin.py` in backend shell

### 10.2 Admin Sections

| Section | Description |
|---------|-------------|
| **Dashboard** | Overview with user/transaction counts, recent users |
| **Users** | List all users, search, view roles, MFA status |
| **Transactions** | All system transactions, filterable by type/status |
| **Deposits** | Filtered deposit transactions |
| **Withdrawals** | Filtered withdrawal transactions |
| **Wallets** | All wallets with balances |
| **Agents** | Create and manage agent accounts |
| **Merchants** | Create and manage merchant accounts |
| **Reports** | Aggregated statistics and reports |
| **Security** | Audit log viewer |
| **Settings** | System configuration |
| **Notifications** | Broadcast notifications to all users |
| **Content** | CMS for landing page content |

### 10.3 Admin Roles

| Role | Permissions |
|------|-------------|
| admin | Full access (all sections) |
| support | View users, transactions, wallets |
| auditor | View audit logs only |

---

## 11. Development Setup

### Local Development

1. **Clone repository**
```bash
git clone https://github.com/yourusername/securemoney.git
cd securemoney
```

2. **Backend setup**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
python run.py
```
Server starts at `http://localhost:8000`

3. **Frontend setup** (separate terminal)
```bash
cd frontend
npm install
npm run dev
```
Server starts at `http://localhost:3000`

4. **Docker setup** (full stack)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API proxied through nginx: `http://localhost/api`

### Project Structure

```
securemoney/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory + blueprint registration
│   │   ├── auth.py              # Authentication logic (JWT, login, register)
│   │   ├── config.py            # Configuration (env vars)
│   │   ├── crypto.py            # AES-256-GCM encryption/decryption
│   │   ├── email_service.py     # OTP generation + email sending
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── rate_limit.py        # Rate limiter initialization
│   │   ├── sms_service.py       # SMS OTP via Twilio
│   │   ├── utils.py             # JWT decorators + helpers
│   │   ├── audit.py             # Audit logging
│   │   └── routes/
│   │       ├── admin.py         # Admin API endpoints
│   │       ├── email_otp.py     # Email OTP endpoints
│   │       ├── payments.py      # Payment endpoints
│   │       ├── phone_otp.py     # Phone OTP endpoints
│   │       ├── public.py        # Public endpoints (health)
│   │       └── user.py          # User API endpoints
│   ├── Dockerfile
│   ├── railway.json
│   ├── requirements.txt
│   ├── run.py                   # Entry point
│   ├── seed_admin.py            # Admin user seeder
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Router + guards
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx   # Auth state management
│   │   │   └── ThemeContext.tsx  # Dark/light theme
│   │   ├── services/
│   │   │   └── api.ts           # Axios instance + interceptors
│   │   ├── components/
│   │   │   ├── layout/          # Layout, Navbar, Sidebar, AdminLayout
│   │   │   └── ui/              # Button, Input, Card, Modal, etc.
│   │   └── pages/
│   │       ├── Admin/           # 13 admin pages
│   │       ├── Auth/            # Login, Register
│   │       ├── Dashboard/       # User dashboard
│   │       └── ...              # Transfers, Airtime, Bills, etc.
│   ├── Dockerfile
│   ├── nginx.conf               # SPA routing fallback
│   ├── railway.json
│   └── package.json
├── infra/nginx/                  # Reverse proxy nginx config
├── docker-compose.yml            # Full stack orchestration
└── docs/                         # Documentation
```

---

## 12. Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/
```

Tests cover:
- User registration and login
- JWT token generation and refresh
- Wallet transfers
- Transaction history

### Test Configuration

Defined in `pyproject.toml`:
- Test path: `tests/`
- Verbose output with short tracebacks
- Coverage: `app/` directory (excluding `__pycache__` and `tests`)

---

## License

SecureMoney — Private Project

---

*Document generated: July 2026*
