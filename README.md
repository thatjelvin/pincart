# 🛒 PinCart AI

> **Find trending Pinterest products → Match suppliers → Generate AI product pages → Export Shopify CSV**

PinCart AI is a full-stack SaaS platform that helps entrepreneurs launch dropshipping stores in under 10 minutes. Discover viral products on Pinterest, get AI-generated product descriptions, and export ready-to-use Shopify product listings.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF)](https://stripe.com/)

---

## ✨ Key Features

- 🔍 **Pinterest Product Discovery** - Scrape trending products from Pinterest based on niche keywords
- 🤝 **Supplier Matching** - Automatically find and match products with suppliers
- 🤖 **AI-Powered Content Generation** - Generate compelling product descriptions using GPT-4
- 📊 **Profit Calculator** - Calculate margins and pricing in real-time
- 📦 **Shopify CSV Export** - One-click export to Shopify-ready CSV format
- 💳 **Subscription Billing** - Stripe-powered subscription management
- 🔐 **Authentication** - Secure user authentication via Supabase Auth (Email + OAuth)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Deployment:** Vercel

### Backend
- **Framework:** FastAPI (Python)
- **Web Scraping:** Playwright (headless Chromium)
- **AI:** OpenAI GPT-4o
- **Deployment:** Railway / Render

### Infrastructure
- **Database & Auth:** Supabase (PostgreSQL)
- **Payments:** Stripe Subscriptions
- **Domain:** Name.com

---

## 📁 Project Structure

```
pincart/
├── pincart/
│   ├── frontend/                 # Next.js application
│   │   ├── src/
│   │   │   ├── app/             # App router pages
│   │   │   │   ├── page.tsx     # Landing page
│   │   │   │   ├── dashboard/   # Main dashboard
│   │   │   │   ├── billing/     # Subscription management
│   │   │   │   ├── login/       # Authentication
│   │   │   │   └── signup/      # User registration
│   │   │   ├── components/      # React components
│   │   │   │   ├── DiscoverPanel.tsx
│   │   │   │   ├── GeneratePanel.tsx
│   │   │   │   └── ExportPanel.tsx
│   │   │   └── lib/             # Utilities
│   │   │       ├── supabase.ts  # Supabase client
│   │   │       └── api.ts       # API client
│   │   └── package.json
│   │
│   ├── backend/                  # FastAPI application
│   │   ├── main.py              # App entry point
│   │   ├── db.py                # Database client
│   │   ├── requirements.txt     # Python dependencies
│   │   └── routers/             # API endpoints
│   │       ├── discover.py      # Product discovery
│   │       ├── match.py         # Supplier matching
│   │       ├── generate.py      # AI generation
│   │       ├── export.py        # CSV export
│   │       └── billing.py       # Stripe integration
│   │
│   ├── supabase/
│   │   └── schema.sql           # Database schema
│   │
│   └── README.md                # Detailed setup guide
│
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** - Backend runtime
- **Node.js 18+** - Frontend runtime
- **Supabase Account** - Database and authentication (free tier available)
- **OpenAI API Key** - For AI content generation
- **Stripe Account** - Payment processing (test mode for development)

### 1. Clone the Repository

```bash
git clone https://github.com/thatjelvin/pincart.git
cd pincart/pincart
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the backend server
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### 4. Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor** in your Supabase dashboard
3. Copy the contents of `supabase/schema.sql` and execute it
4. Copy your **Project URL** and **API Keys** to both `.env` files

### 5. Stripe Setup

1. Create products in [Stripe Dashboard](https://dashboard.stripe.com/) → **Products**:
   - **Starter Plan**: $19/month (recurring)
   - **Pro Plan**: $39/month (recurring)
2. Copy the **Price IDs** (format: `price_xxx`) to `backend/.env`:
   ```
   STRIPE_STARTER_PRICE_ID=price_xxx
   STRIPE_PRO_PRICE_ID=price_xxx
   ```
3. Set up a webhook endpoint in Stripe Dashboard:
   - **URL**: `https://your-backend.com/stripe-webhook`
   - **Events**: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy the **Webhook Signing Secret** to `STRIPE_WEBHOOK_SECRET`

**Local Testing**: Use the Stripe CLI for webhook testing:
```bash
stripe listen --forward-to localhost:8000/stripe-webhook
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check endpoint |
| `GET` | `/discover?keyword=<term>` | Discover trending Pinterest products |
| `POST` | `/match-product` | Find supplier matches for a product |
| `POST` | `/generate` | Generate AI-powered product page content |
| `POST` | `/export` | Export products as Shopify-ready CSV |
| `POST` | `/create-checkout` | Create Stripe checkout session |
| `POST` | `/create-portal` | Create Stripe billing portal session |
| `POST` | `/stripe-webhook` | Handle Stripe webhook events |

API documentation is available at `http://localhost:8000/docs` (Swagger UI).

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import the repository at [vercel.com](https://vercel.com)
3. Set **Root Directory** to `pincart/frontend`
4. Add all environment variables from `frontend/.env.local`
5. Deploy (auto-deploys on push to main)

### Backend Deployment (Railway)

1. Connect your GitHub repository at [railway.app](https://railway.app)
2. Set **Root Directory** to `pincart/backend`
3. Set **Start Command**: 
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Add all environment variables from `backend/.env`
5. Deploy

### Backend Deployment (Alternative: Render)

1. Create a new **Web Service** at [render.com](https://render.com)
2. Set **Root Directory** to `pincart/backend`
3. Set **Build Command**:
   ```bash
   pip install -r requirements.txt && playwright install chromium && playwright install-deps
   ```
4. Set **Start Command**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Add all environment variables
6. Deploy

---

## 🎯 User Flow

1. **Sign Up** - User creates an account (email or Google OAuth)
2. **Discover** - Enter a niche keyword to find trending Pinterest products
3. **Browse** - View top 20 trending products with images and engagement metrics
4. **Generate** - Click "Generate Page" to match suppliers and create AI content
5. **Review** - See pricing, margins, and AI-generated product descriptions
6. **Export** - Download Shopify-ready CSV file
7. **Import** - Upload CSV to Shopify store
8. **Launch** - Product is live and ready to sell

**Target Time: Under 10 minutes from signup to ready-to-sell product.**

---

## 📸 Screenshots

*(Add screenshots of your application here)*

- Landing page
- Dashboard
- Product discovery
- AI generation
- Export interface

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT-4 API
- [Supabase](https://supabase.com/) for database and authentication
- [Stripe](https://stripe.com/) for payment processing
- [Vercel](https://vercel.com/) for frontend hosting
- [Railway](https://railway.app/) / [Render](https://render.com/) for backend hosting

---

## 📞 Support

For questions or issues, please open an issue on GitHub or reach out to the maintainers.

---

**Built with ❤️ for entrepreneurs and dropshippers**

*Ship fast. Get paying users. Prove demand.*
