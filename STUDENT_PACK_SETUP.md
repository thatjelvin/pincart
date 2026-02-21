# 🎓 GitHub Student Pack Setup Guide

Step-by-step instructions for redeeming each Student Pack benefit used by PinCart AI.

---

## Prerequisites

- Verified [GitHub Student Developer Pack](https://education.github.com/pack)
- GitHub account linked to your `.edu` email

---

## 1. Doppler — Secrets Management (Team Plan)

1. Visit [doppler.com/github-students](https://www.doppler.com/github-students) and sign up with GitHub
2. Create a new project called **pincart**
3. Create three environments: `dev`, `staging`, `production`
4. Add all secrets from `backend/.env.example` and `frontend/.env.local.example`
5. Install the CLI:
   ```bash
   # macOS
   brew install dopplerhq/cli/doppler
   # Linux
   curl -Ls https://cli.doppler.com/install.sh | sh
   ```
6. Authenticate and select project:
   ```bash
   doppler login
   doppler setup        # select pincart / dev
   ```
7. Run the backend with Doppler-injected secrets:
   ```bash
   doppler run -- uvicorn main:app --reload --port 8000
   ```

---

## 2. DigitalOcean — $200 Cloud Credit

1. Redeem at [digitalocean.com/github-students](https://www.digitalocean.com/github-students)
2. Create a new project in the DigitalOcean dashboard
3. Deploy the backend via App Platform:
   ```bash
   doctl apps create --spec infrastructure/digitalocean-app.yaml
   ```
4. Set environment variables in the App Platform dashboard
5. The $200 credit covers ~12 months of a basic app + managed Redis

---

## 3. Microsoft Azure — $100 Credit

1. Activate at [azure.microsoft.com/free/students](https://azure.microsoft.com/en-us/free/students/)
2. Deploy the frontend as an Azure Static Web App:
   - Go to **Static Web Apps** in the Azure Portal
   - Connect your GitHub repo, set build preset to **Next.js**
   - Root: `pincart/frontend`
3. The configuration file is at `infrastructure/azure-static-web-apps.yml`

---

## 4. Sentry — Error Tracking (50k errors/month)

1. Redeem at [sentry.io/for/github-students](https://sentry.io/for/github-students/)
2. Create a project: **Platform → Python (FastAPI)** and another for **JavaScript (Next.js)**
3. Copy the DSN values:
   - Backend: set `SENTRY_DSN` in Doppler
   - Frontend: set `NEXT_PUBLIC_SENTRY_DSN` in Doppler
4. Sentry auto-initialises in the backend via `services/sentry_setup.py`

---

## 5. Datadog — Monitoring (Pro, 2 years)

1. Redeem at [datadog.com/github-students](https://www.datadoghq.com/github-students/)
2. Install the Datadog agent on your DigitalOcean droplet or App Platform
3. Import the dashboard: **Dashboards → Import** → upload `monitoring/datadog/dashboard.json`
4. Key metrics tracked: request rate, P95 latency, error rate, cache hit ratio

---

## 6. Mailgun — Transactional Email (20k emails/month)

1. Sign up at [mailgun.com](https://www.mailgun.com/) (use GitHub Student credit)
2. Verify your sending domain
3. Set `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` in Doppler
4. Email templates are in `backend/templates/email/`

---

## 7. Namecheap — Free .me Domain

1. Redeem at [nc.me](https://nc.me/) with your GitHub Student account
2. Register `pincart.me` (or your preferred `.me` domain)
3. Configure DNS:
   - Frontend (Azure): Add a CNAME record pointing to your Static Web App
   - Backend (DigitalOcean): Add an A record pointing to your app's IP

---

## 8. GitHub Actions — CI/CD (3,000 min/month)

Already configured! Workflows are in `.github/workflows/`:
- `ci-cd.yml` — Build, test, and deploy on push to `main`
- `test.yml` — Run tests and lint on pull requests

---

## Cost Summary

| Service | Student Pack Benefit | Monthly Cost |
|---------|---------------------|-------------|
| DigitalOcean | $200 credit (1 year) | $0 |
| Azure | $100 credit | $0 |
| Sentry | 50k errors free | $0 |
| Datadog | Pro tier (2 years) | $0 |
| Mailgun | 20k emails/month | $0 |
| Doppler | Team plan | $0 |
| Namecheap | Free .me domain | $0 |
| GitHub Actions | 3,000 min/month | $0 |
| **Total** | | **$0/month** |
