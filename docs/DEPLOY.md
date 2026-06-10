# Deployment Guide (short)

1. Provision managed Postgres (ensure backups), Redis, and KMS (Vault/AWS KMS).
2. Store secrets (MASTER_KEY, JWT keys) in KMS or secret store and mount to containers as files.
3. Build images with multi-stage production Dockerfiles.
4. Configure env vars to point to production resources, including SENTRY_DSN and CORS whitelist.
5. Run migrations:
   - flask db init
   - flask db migrate
   - flask db upgrade
6. Deploy behind a TLS-terminating load balancer with rate limiting and WAF.
7. Configure monitoring (Prometheus, Grafana) and alerting for auth anomalies and transfers.
8. Use CI (GH Actions) to run tests, lints, and build images; promote built images to prod registry.
