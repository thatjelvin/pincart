# PinCart AI — MVP

**Find trending Pinterest products → Match suppliers → Generate AI product pages → Export Shopify CSV**

Full-stack SaaS: Next.js frontend + Python FastAPI backend + Supabase + Stripe.

---

## Project Structure

```
pincart/
├── frontend/                 # Next.js (Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── globals.css           # Tailwind styles
│   │   │   ├── signup/page.tsx       # Signup
│   │   │   ├── login/page.tsx        # Login
│   │   │   ├── dashboard/page.tsx    # Main dashboard
│   │   │   └── billing/page.tsx      # Billing & plans
│   │   ├── components/
│   │   │   ├── DiscoverPanel.tsx      # Pinterest discovery
│   │   │   ├── GeneratePanel.tsx      # AI page generation
│   │   │   └── ExportPanel.tsx        # CSV export
│   │   └── lib/
│   │       ├── supabase.ts            # Supabase client
│   │       └── api.ts                 # Backend API client
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── .env.local.example
│
├── backend/                  # Python FastAPI (Railway/Render)
│   ├── main.py                        # App entry point
│   ├── db.py                          # Supabase client
│   ├── requirements.txt
│   ├── routers/
│   │   ├── discover.py                # GET /discover
│   │   ├── match.py                   # POST /match-product
│   │   ├── generate.py                # POST /generate
│   │   ├── export.py                  # POST /export
│   │   └── billing.py                 # Stripe checkout + webhooks
│   └── .env.example
│
├── supabase/
│   └── schema.sql                     # Database schema
│
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase project (free tier)
- An OpenAI API key
- A Stripe account (test mode)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Copy env file and fill in your keys
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux

# Start backend
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file and fill in your keys
copy .env.local.example .env.local   # Windows
# cp .env.local.example .env.local   # macOS/Linux

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:8000`.

### 3. Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Paste the contents of `supabase/schema.sql` and run it
4. Copy your project URL and keys to both `.env` files

### 4. Stripe Setup

1. Create products in **Stripe Dashboard → Products**:
   - **Starter Plan**: $19/month recurring
   - **Pro Plan**: $39/month recurring
2. Copy the **Price IDs** (starts with `price_`) into backend `.env`:
   ```
   STRIPE_STARTER_PRICE_ID=price_xxx
   STRIPE_PRO_PRICE_ID=price_xxx
   ```
3. Set up webhook endpoint:
   - URL: `https://your-backend.com/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy **Webhook Signing Secret** to `STRIPE_WEBHOOK_SECRET`

For local testing, use `stripe listen --forward-to localhost:8000/stripe-webhook`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_STARTER_PRICE_ID` | Stripe price ID for Starter plan |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan |
| `FRONTEND_URL` | Frontend URL (for CORS + Stripe redirects) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variables in Vercel dashboard
5. Deploy — auto-deploys on push

### Backend → Railway or Render

**Railway:**
1. Connect GitHub repo at [railway.app](https://railway.app)
2. Set **Root Directory** to `backend`
3. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Deploy

**Render:**
1. Create new **Web Service** at [render.com](https://render.com)
2. Set **Root Directory** to `backend`
3. Set **Build Command**: `pip install -r requirements.txt && playwright install chromium && playwright install-deps`
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

### Custom Domain (Name.com)

1. Add your domain in Vercel dashboard → Domains
2. Update DNS at Name.com:
   - `A` record → Vercel IP
   - `CNAME` for `www` → `cname.vercel-dns.com`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/discover?keyword=<term>` | Discover trending Pinterest products |
| POST | `/match-product` | Find supplier matches for a product |
| POST | `/generate` | Generate AI product page |
| POST | `/export` | Export Shopify-ready CSV |
| POST | `/create-checkout` | Create Stripe checkout session |
| POST | `/create-portal` | Create Stripe billing portal session |
| POST | `/stripe-webhook` | Handle Stripe webhook events |

---

## End-to-End Flow

1. User signs up (email or Google OAuth)
2. Enters a niche keyword on the **Discover** tab
3. Pinterest is scraped → top 20 trending products shown
4. User clicks **Generate Page** on a product
5. Suppliers are matched → pricing and margins displayed
6. User configures tone + audience → AI generates full product page
7. User clicks **Export** → downloads Shopify-ready CSV
8. User imports CSV into Shopify → product is live

**Target: Under 10 minutes from signup to ready-to-sell.**

---

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind CSS → Vercel
- **Backend:** Python FastAPI → Railway/Render
- **Scraping:** Playwright (headless Chromium)
- **AI:** OpenAI GPT-4o
- **Database + Auth:** Supabase (PostgreSQL)
- **Payments:** Stripe Subscriptions
- **Domain:** Name.com

---

*Ship fast. Get paying users. Prove demand.*
