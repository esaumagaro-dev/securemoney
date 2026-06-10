# Security Checklist

- Secrets management: Use Vault/KMS, do not store MASTER_KEY in env for prod.
- Transport: enforce TLS 1.2+, HSTS, secure cookie flags.
- Tokens: use RS256 JWTs with short expiry, rotate private keys.
- Passwords: Argon2id with strong params, enforce strong password policy.
- MFA: TOTP with encrypted secrets, backup codes hashed.
- Data encryption: AES-256-GCM with per-record nonce & salt. Store tag + nonce + salt.
- Auditing: immutable logs, sign important logs with HMAC. Alert on anomalous events.
- Rate limiting: lock down auth endpoints per IP & per account.
- Input validation: enforce strict schema validation for all endpoints.
- Pen testing, SAST/DAST: run semgrep/bandit/OWASP ZAP prior to prod.
