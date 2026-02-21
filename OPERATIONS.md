# 🔧 Operations Runbook

Monitoring, alerting, and incident response procedures for PinCart AI.

---

## Monitoring Dashboards

### Datadog

- **Dashboard**: Import `monitoring/datadog/dashboard.json`
- **Key Metrics**:
  - Request rate (rpm) — baseline ~50–200 rpm
  - P95 latency — target < 500 ms for API, < 3 s for `/discover`
  - Error rate (5xx) — target < 1 %
  - Redis cache hit rate — target > 80 %
  - Rate-limited requests (429s)

### Sentry

- **Config**: `monitoring/sentry/config.yml`
- **Alerts configured**:
  - High error rate: > 50 events/hour → email team
  - New issue: first occurrence → email member
  - Unhandled exception spike: > 10 in 5 min → email team

---

## Health Checks

```bash
# Backend health
curl https://api.pincart.me/health
# Expected: {"status": "ok", "redis": true}

# Frontend (Azure SWA)
curl -I https://pincart.me
# Expected: HTTP 200 with security headers
```

---

## Common Alerts & Response

### 1. High Error Rate (5xx > 1 %)

1. Check Sentry for new/spiking issues
2. Check Datadog for latency spikes (possible upstream timeout)
3. Review recent deployments: `doctl apps list-deployments <app-id>`
4. If Pinterest scraping fails: this is expected during Pinterest anti-bot changes — the fallback cache should serve stale data

### 2. Redis Unavailable

1. `/health` will show `"redis": false`
2. The app falls back to in-memory caching and rate limiting
3. Check DigitalOcean managed Redis status
4. If persistent: restart the Redis instance

### 3. Rate Limit Spike (429s)

1. Check if a single IP is responsible (Datadog logs)
2. Current limit: 30 req/min per IP (configurable via `RATE_LIMIT_RPM`)
3. To temporarily increase: update the env var and redeploy

### 4. OpenAI API Errors

1. Check [OpenAI status](https://status.openai.com/)
2. The `/generate` endpoint will return a 500 with a descriptive message
3. Rate limiting protects against runaway API costs

### 5. Stripe Webhook Failures

1. Check Stripe Dashboard → Developers → Webhooks
2. Verify `STRIPE_WEBHOOK_SECRET` matches in Doppler
3. Stripe retries failed webhooks automatically for up to 3 days

---

## Deployment

### Backend (DigitalOcean App Platform)

```bash
# Deploy via CLI
doctl apps create --spec infrastructure/digitalocean-app.yaml

# Check deployment status
doctl apps list-deployments <app-id>

# View logs
doctl apps logs <app-id>
```

### Frontend (Azure Static Web Apps)

Deploys automatically on push to `main` via GitHub Actions.

### Manual Rollback

```bash
# DigitalOcean — rollback to previous deployment
doctl apps create-deployment <app-id> --force-rebuild

# Or revert the commit and push
git revert HEAD && git push origin main
```

---

## Secrets Rotation

All secrets are managed via **Doppler**. To rotate:

1. Generate new credentials in the respective service dashboard
2. Update in Doppler: `doppler secrets set KEY=new_value`
3. Redeploy (secrets are injected at runtime)
4. Verify the app is healthy after rotation

---

## Scaling Notes

| Component | Current | Scale Trigger |
|-----------|---------|---------------|
| Backend instances | 1 | > 100 rpm sustained |
| Redis | Managed (1 GB) | > 500 MB usage |
| Celery workers | 2 | Scraping queue > 50 pending |
| Frontend | Azure SWA (auto) | N/A (CDN-backed) |
