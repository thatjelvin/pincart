# PinCart AI — Product Requirements Document

**Version:** 1.0 — MVP
**Status:** Draft
**Target Release:** 30 days from sprint start
**Confidentiality:** Internal use only

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals, Objectives & Success Metrics](#2-goals-objectives--success-metrics)
3. [Target Users & Personas](#3-target-users--personas)
4. [Scope Definition](#4-scope-definition)
5. [Feature Requirements](#5-feature-requirements)
   - 5.1 [Module A: Trend Discovery](#51-module-a-trend-discovery)
   - 5.2 [Module B: Supplier Matching](#52-module-b-supplier-matching)
   - 5.3 [Module C: AI Product Page Generator](#53-module-c-ai-product-page-generator)
   - 5.4 [Module D: Shopify Export System](#54-module-d-shopify-export-system)
   - 5.5 [Module E: Dashboard & Navigation](#55-module-e-dashboard--navigation)
   - 5.6 [Module F: Authentication & Accounts](#56-module-f-authentication--accounts)
   - 5.7 [Module G: Billing & Subscriptions](#57-module-g-billing--subscriptions)
6. [Monetization & Pricing](#6-monetization--pricing)
7. [Technical Architecture](#7-technical-architecture)
8. [Data Model](#8-data-model)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [UX & Design Principles](#10-ux--design-principles)
11. [Error Handling & Edge Cases](#11-error-handling--edge-cases)
12. [Analytics & Instrumentation](#12-analytics--instrumentation)
13. [Launch Checklist & Definition of Done](#13-launch-checklist--definition-of-done)
14. [Post-MVP Roadmap](#14-post-mvp-roadmap)
15. [Risks & Mitigations](#15-risks--mitigations)
16. [Appendix: Shopify CSV Schema](#16-appendix-shopify-csv-schema)

---

## 1. Executive Summary

### 1.1 Product Vision

**PinCart AI** is a lightweight SaaS tool that collapses the entire dropshipping product-launch workflow — from trend discovery to a live Shopify listing — into under ten minutes.

The product pipeline does four things in sequence:
1. Discovers high-engagement Pinterest products via keyword/niche input
2. Matches them to real suppliers with live pricing and margin estimates
3. Generates optimized, conversion-ready product pages using AI
4. Exports a Shopify-ready CSV (or, post-MVP, pushes directly via OAuth)

The core promise is **speed to first sale**, not deep analytics or enterprise tooling.

### 1.2 The Problem

The standard dropshipping onboarding workflow is fragmented and high-friction for beginners:

| Step | Current Pain |
|------|-------------|
| Trend Research | Manual browsing across TikTok, Pinterest, Amazon — no unified signal |
| Supplier Discovery | Separate AliExpress/CJ search with no demand validation |
| Product Copywriting | Written from scratch with no ecommerce experience |
| Shopify Setup | Manual field-by-field entry, often abandoned |

This fragmentation causes most beginners to drop out before making their first sale.

### 1.3 The Solution

PinCart AI unifies these four steps into a single guided pipeline accessible from one dashboard. The user enters a niche keyword and the system handles everything downstream — surfacing validated product ideas, matching suppliers, generating copy, and producing an import-ready file.

> **MVP Success Metric:** Within 10 minutes of signup, a user should find 1 validated trending product, receive a fully written Shopify product page, and be ready to accept orders the same day. If this happens reliably → MVP is successful.

---

## 2. Goals, Objectives & Success Metrics

### 2.1 Business Goals

- Ship a working, revenue-generating MVP within 30 days
- Achieve ≥ 5 paying customers within the MVP window (primary go/no-go gate)
- Validate willingness-to-pay before investing in post-MVP features
- Maintain solo-developer buildability throughout the sprint

### 2.2 User Goals

- Find a trending, sellable product without needing analytics knowledge
- See a real supplier price and estimated profit margin before committing
- Receive a professional product page without writing a single word
- Be ready to accept Shopify orders on the same day they sign up

### 2.3 Key Performance Indicators

| KPI | Definition | MVP Target |
|-----|-----------|-----------|
| Time to First Export | Avg. time from signup → first CSV download | < 10 minutes |
| Activation Rate | % of signups who complete ≥ 1 generation | > 60% |
| Free-to-Paid Conversion | % of free users who upgrade | > 15% |
| 30-Day MRR | Total monthly recurring revenue at day 30 | ≥ $95 (5 × $19) |
| Month 1 Churn | % of paid users who cancel in first month | < 30% |
| Supplier Match Rate | % of products with a matched supplier | > 75% |
| Page Generation Success | % of AI requests completing without error | > 98% |
| CSV Import Success | % of exported CSVs that import cleanly to Shopify | 100% |

---

## 3. Target Users & Personas

### Primary Personas

**Persona 1 — "First-Timer Felix"**
- Age: 22–35
- Has heard of dropshipping from YouTube but never made a sale
- Overwhelmed by the number of tools in the ecosystem
- Needs a guided, opinionated workflow with one clear action at each step
- Willing to pay $19/month if the tool visibly saves hours of work

**Persona 2 — "Pinterest Patrice"**
- Age: 28–45
- Already active on Pinterest, has a following in a niche (home, wellness, fashion)
- Wants to monetize their Pinterest presence by linking to a store they own
- Starts from Pinterest content naturally — PinCart AI fits their existing mental model
- Values speed and visual polish over deep customization

### Secondary Persona

**Persona 3 — "Side Hustle Sam"**
- Has run a Shopify store before, or currently runs one
- Wants a faster way to test new niches without full research cycles
- May use PinCart AI as a complement to existing tools, not a replacement
- More likely to subscribe to Pro tier; sensitive to limits

---

## 4. Scope Definition

### 4.1 In Scope — MVP

- Pinterest trend discovery via keyword input (scraping-based, no API)
- Demand scoring and deduplication of pin results
- Supplier matching via AliExpress and CJdropshipping (scraping-based)
- Profit margin estimation
- AI product page generation (title, description, bullets, FAQ, meta description)
- Ad copy generation (TikTok hook + Pinterest caption) — Pro tier only
- Shopify-compatible CSV export
- Usage metering against plan limits
- User authentication (email/password + Google OAuth)
- Stripe subscription billing (Starter and Pro tiers)
- Four-page dashboard: Discover, Generate, Export, Billing
- Export history with re-download capability

### 4.2 Out of Scope — MVP

The following are explicitly deferred to post-MVP. No exceptions without written product owner approval.

- Direct Shopify OAuth push
- WooCommerce, Etsy, or Amazon export
- Pinterest login / saved board analysis
- ML-based demand scoring or trend forecasting
- Brand voice customization or saved tone profiles
- Multi-language product page generation
- Competitor or cross-platform trend comparison
- Inventory tracking or order fulfillment
- Annual billing plans
- Team accounts or multi-user workspaces
- Mobile apps (iOS / Android)
- Email marketing integrations

---

## 5. Feature Requirements

### 5.1 Module A: Trend Discovery

**Purpose:** Surface Pinterest products with genuine viral demand so the user starts from proof of consumer interest, not a supplier catalog.

#### 5.1.1 User Input

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Keyword / Niche | Text input | Yes | e.g., "home decor", "fitness gadgets" |
| Region Filter | Dropdown (US, UK, AU, Global) | No | Defaults to Global |

- No Pinterest login required from the user
- Character limit on keyword: 80 characters
- Keyword is sanitized server-side before passing to scraper

#### 5.1.2 Processing Pipeline

1. Playwright headless browser submits keyword to Pinterest search
2. First two pages of results are scraped (approx. 50–80 pins)
3. Pin data collected per result:
   - Image URL
   - Pin title
   - Save count
   - Board name
   - Pin URL
   - Last activity timestamp (where available)
4. **Deduplication:** Visual similarity clustering removes variant images of the same product. Any pin whose image hash is within a defined perceptual hash distance of an already-retained pin is discarded
5. **Demand Scoring:** Each remaining pin receives a score (0–100):
   - Save count: 60% weight (logarithmic scale, normalized within result set)
   - Recency of last save activity: 25% weight
   - Board-keyword relevance (title match): 15% weight
6. Results sorted by Demand Score descending; top 20 returned

#### 5.1.3 Output — Trending Products List

Each card in the results list displays:

| Field | Description |
|-------|-------------|
| Product Thumbnail | Pin image at 200×200px |
| Product Title | Pinterest pin title (editable inline before passing to Generate) |
| Demand Score | 0–100 badge — red < 40, amber 40–69, green ≥ 70 |
| Save Count | Raw save figure |
| Source Pin | Icon linking to original Pinterest URL |
| Supplier Match | Icon: green checkmark (matched), gray dash (not yet matched), red X (no match found) |
| Select CTA | "Generate Page" button → passes product into Module C |

#### 5.1.4 Usage Limits by Plan

| Plan | Searches per Month |
|------|--------------------|
| Free | 3 |
| Starter | 20 |
| Pro | 100 |

#### 5.1.5 Technical Notes & MVP Simplifications

- No Pinterest API used. All data scraped via Playwright.
- Demand scoring is heuristic, not ML. ML scoring is a post-MVP enhancement.
- Results cached per keyword for 4 hours to reduce scraping frequency.
- If Pinterest returns a CAPTCHA or blocks the request, the user receives a "results temporarily unavailable" message and the search is retried automatically once after a 30-second delay.
- Scraping should use randomized user-agent strings and request pacing to reduce detection risk.

---

### 5.2 Module B: Supplier Matching

**Purpose:** Validate that each trending product is actually sourceable at a profitable price before the user invests time in generating a page.

#### 5.2.1 Matching Process

Matching is triggered automatically when a user selects a product from the Discover list. Two methods run in parallel:

1. **Reverse-image search** — pin thumbnail submitted to AliExpress visual search
2. **Keyword search** — cleaned product title submitted to CJdropshipping product catalog

Results from both sources are merged, deduplicated (by product URL), and ranked by:
- Supplier rating (descending)
- Price (ascending, as tiebreaker)

Top 3 matches are presented to the user.

#### 5.2.2 Supplier Result Fields

| Field | Description |
|-------|-------------|
| Product Image | Supplier's primary listing image |
| Supplier Name | Store name on AliExpress or CJdropshipping |
| Unit Cost | Listed price in USD |
| Suggested Retail Price | Auto-calculated at 2.8× unit cost (editable by user) |
| Estimated Gross Margin | (Retail − Cost) / Retail, expressed as % |
| Shipping Regions | Supported delivery countries |
| Estimated Delivery | Supplier's stated shipping window |
| Supplier Link | Direct URL to product listing for manual verification |

#### 5.2.3 Margin Disclaimer

The margin estimate assumes a 2.8× markup with no deductions for Shopify transaction fees, payment processor fees, advertising spend, or taxes. A persistent inline disclaimer communicates this to the user.

#### 5.2.4 No-Match State

Expected no-match rate at MVP: ~15–25% of products. When no supplier is found:
- Display a "No supplier match found" state with a clear explanation
- Provide direct search links to AliExpress and CJdropshipping pre-filled with the product keyword
- Allow the user to proceed to the AI generator anyway (without price/margin data pre-filled)

#### 5.2.5 MVP Simplifications

- No official supplier API. All matching is scraping-based.
- Only AliExpress and CJdropshipping supported at MVP.
- Markup multiplier (2.8×) is hardcoded at MVP; configurable per-user in post-MVP settings.

---

### 5.3 Module C: AI Product Page Generator

**Purpose:** Eliminate the highest-friction beginner task — writing product copy — by producing a publication-ready product page in under 60 seconds.

#### 5.3.1 User Inputs

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Product Name | Text (auto-populated, editable) | Yes | Pulled from Pinterest title |
| Supplier Details | Auto-populated | No | Price, image, description snippets from Module B |
| Target Audience | Free text | No | e.g., "moms with toddlers", "gym beginners" |
| Tone Preset | Single-select dropdown | Yes | Standard, Playful, Luxury, Urgency-Driven |

#### 5.3.2 Generated Output Assets

| Asset | Description | Word/Char Count | Availability |
|-------|-------------|-----------------|-------------|
| SEO Product Title | Keyword-optimized title for Shopify + Google Shopping | 60–70 chars | All plans |
| Benefit-Driven Description | Transformation-focused copy (outcomes > features) | 250–400 words | All plans |
| Bullet Feature Points | 5–7 concise feature bullets for product page | ~10–15 words each | All plans |
| FAQ Section | 4–6 Q&A pairs addressing pre-purchase objections | ~30–60 words per Q&A | All plans |
| Meta Description | Shopify SEO field copy | ≤ 155 chars | All plans |
| TikTok Ad Hook | 3-second opening line for video ads | 1–2 sentences | Pro only |
| Pinterest Ad Copy | Pin description optimized for saves + CTR | ≤ 100 words | Pro only |

#### 5.3.3 AI Generation Technical Specification

- **Provider:** OpenAI API
- **Model:** GPT-4o (primary); GPT-3.5-turbo as cost fallback if 4o latency > 10s
- **Prompt architecture:** Single structured prompt template with dynamic variable injection (product name, price point, features, target audience, tone preset)
- **Temperature:** 0.7 for descriptions and FAQs; 0.9 for ad copy
- **Max tokens:** 1,500 per full generation call
- **Estimated cost per generation:** $0.04–$0.08
- **Output format:** Structured JSON parsed server-side, stored in Supabase
- **Partial regeneration:** Users can regenerate any individual section (title, description, FAQ, etc.) without triggering a full generation. Counts as 0.25 against their generation limit.

#### 5.3.4 Generation Limits by Plan

| Plan | AI Generations per Month | Partial Regenerations |
|------|--------------------------|-----------------------|
| Free | 1 | 4 (= 1 full equivalent) |
| Starter | 10 | Unlimited within 10-gen equivalent |
| Pro | Unlimited | Unlimited |

#### 5.3.5 Post-Generation UX

- All generated fields are displayed inline and are fully editable before export
- "Copy to clipboard" icon on each individual asset
- "Regenerate all" and "Regenerate [section]" buttons available
- Page is auto-saved to the user's account every 30 seconds while editing

#### 5.3.6 MVP Simplifications

- Single prompt template for all niches; niche-specific variants are post-MVP
- No brand voice learning or saved profiles
- No image generation; product images sourced from supplier listing only
- Tone presets affect prompt instruction language only — no fine-tuning

---

### 5.4 Module D: Shopify Export System

**Purpose:** Deliver the generated product page as a Shopify-importable file, enabling the user to go live on the same session.

#### 5.4.1 Export Format

The exported `.csv` file conforms exactly to **Shopify's standard product import CSV specification** (see Appendix for full column schema). All required Shopify columns are populated. The file is validated against Shopify's schema server-side before the download link is made available.

#### 5.4.2 Field Population Logic

| Shopify Column | Population Source |
|---------------|-------------------|
| Handle | URL-safe slug auto-generated from product title |
| Title | AI-generated SEO product title |
| Body (HTML) | AI description + bullet list + FAQ, HTML-formatted |
| Vendor | User's store name (set in account settings; defaults to "My Store") |
| Type | Product category inferred from niche keyword |
| Tags | Auto-generated from keyword + product attributes |
| Published | `TRUE` by default; user can toggle to `FALSE` for draft |
| Variant Price | Suggested retail price from supplier matching (editable) |
| Variant SKU | Auto-generated: `PCA-[6-char-nonce]-[unix-timestamp]` |
| Variant Inventory Policy | `continue` (oversell allowed — standard for dropshipping) |
| Image Src | Primary supplier product image URL |
| SEO Title | Same as product title |
| SEO Description | AI-generated meta description |

#### 5.4.3 Export History

- All exports are saved to the user's account with a timestamp and product name
- Re-download available from the Export page at any time (no expiry at MVP)
- Free tier: exports are disabled (export button is visible but gated with upgrade prompt)

#### 5.4.4 Post-MVP Upgrade Path

Direct Shopify OAuth integration will replace or supplement CSV export post-MVP. The OAuth flow will allow one-click push of the generated product directly to the user's connected Shopify store without manual file import.

---

### 5.5 Module E: Dashboard & Navigation

**Purpose:** Provide a minimal, low-cognitive-load workspace with one clear action per screen.

#### 5.5.1 Page Structure

| Page | Route | Primary Action | Secondary Actions |
|------|-------|---------------|-------------------|
| Discover | `/discover` | Search by keyword | Select product → Generate |
| Generate | `/generate` | Generate product page | Edit fields, Regenerate sections |
| Export | `/export` | Download CSV | View export history, Re-download |
| Billing | `/billing` | Upgrade plan | View invoices, Cancel subscription |

#### 5.5.2 Global Navigation

- Persistent left sidebar on desktop; bottom tab bar on mobile-breakpoint
- Usage meter displayed in sidebar: "[X] of [Y] generations used this month"
- Upgrade prompt appears when user hits 80% of any plan limit
- Hard limit notification and feature lock at 100% usage

#### 5.5.3 Design Principles

- **5-minute learning curve:** No feature should require a tooltip or documentation to understand
- **One clear action per screen:** Secondary actions are visually subordinate to the primary CTA
- **No clutter:** Dashboard shows only the current pipeline state, not historical analytics
- **Progressive disclosure:** Advanced options (tone preset, region filter) are collapsed by default behind an "Advanced" toggle

---

### 5.6 Module F: Authentication & Accounts

#### 5.6.1 Sign-Up Methods

- Email + password
- Google OAuth (recommended for speed)

#### 5.6.2 Account Data

| Field | Notes |
|-------|-------|
| Email | Used for billing, notifications |
| Store Name | Populates the "Vendor" field in Shopify CSV exports |
| Plan Tier | Free / Starter / Pro |
| Usage Counters | Searches used, generations used — reset monthly on billing cycle |
| Saved Pages | All generated product pages retained in account |
| Export History | All CSV exports retained with re-download links |

#### 5.6.3 Email Flows (MVP Minimum)

- Email verification on signup
- Password reset
- Payment confirmation
- Usage limit warning (at 80% of plan limits)

---

### 5.7 Module G: Billing & Subscriptions

**Provider:** Stripe

#### 5.7.1 Plan Enforcement

- Plan limits are enforced server-side, not client-side only
- Attempting a gated action (e.g., exporting on free tier) shows an in-context upgrade modal — not a separate page — to minimize friction
- Downgrade behavior: if a user cancels, they retain their current tier until the end of the billing period, then revert to Free

#### 5.7.2 Stripe Integration Requirements

- Stripe Checkout for new subscriptions
- Stripe Customer Portal for plan management, invoice history, and cancellation
- Webhook handlers for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Failed payment grace period: 3 days before access is restricted

---

## 6. Monetization & Pricing

### 6.1 Plan Structure

| Feature | Free | Starter — $19/mo | Pro — $39/mo |
|---------|------|-------------------|--------------|
| Product Discoveries | 3 total | 20 / month | 100 / month |
| AI Generations | 1 total | 10 / month | Unlimited |
| CSV Export | ✗ | ✓ | ✓ |
| Ad Copy (TikTok + Pinterest) | ✗ | ✗ | ✓ |
| Export History | ✗ | ✓ (30 days) | ✓ (unlimited) |
| Support | None | Email | Priority email |

### 6.2 Pricing Rationale

- **Free tier** is restrictive enough to drive upgrades but generous enough to demonstrate value (users can discover products and generate one page — they just can't export)
- **Starter at $19/month** targets the widest beginner segment; priced below the cost of a Fiverr product description
- **Pro at $39/month** targets more active users and side hustlers who need volume
- **No annual plan at MVP** — prioritize fast, low-commitment signups over LTV optimization

### 6.3 Upgrade Triggers (UX Moments)

- Attempting CSV export on Free tier
- Hitting search or generation limit on any tier
- Viewing ad copy preview on Starter (blurred with "Upgrade to Pro" overlay)

---

## 7. Technical Architecture

### 7.1 Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js (App Router) | SSR, fast iteration, Vercel-native |
| Hosting | Vercel | Zero-config deploys, free tier generous |
| Backend | Python FastAPI | Scraping ecosystem, async support |
| Scraping | Playwright (Python) | Headless Chrome, handles JS-rendered pages |
| AI | OpenAI API (GPT-4o) | Best instruction-following for structured output |
| Database | Supabase (PostgreSQL) | Auth, DB, and storage in one; generous free tier |
| Payments | Stripe | Industry standard, excellent webhook support |
| Storage | Supabase Storage | Generated CSV file storage, user media |

### 7.2 Architecture Diagram (Simplified)

```
User Browser
     │
     ▼
Next.js Frontend (Vercel)
     │
     ├── Supabase Auth (JWT)
     │
     ▼
FastAPI Backend
     ├── /discover  → Playwright scraper → Pinterest
     ├── /match     → Playwright scraper → AliExpress / CJ
     ├── /generate  → OpenAI API
     └── /export    → CSV builder → Supabase Storage
          │
          ▼
     Supabase PostgreSQL
```

### 7.3 API Endpoints (MVP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/discover` | Submit keyword, return top 20 trending products |
| POST | `/api/match` | Submit product, return top 3 supplier matches |
| POST | `/api/generate` | Submit product + supplier data, return generated page JSON |
| POST | `/api/regenerate` | Regenerate a single section of an existing page |
| POST | `/api/export` | Build and store Shopify CSV, return download URL |
| GET | `/api/exports` | Return user's export history |
| GET | `/api/usage` | Return current plan usage counters |

### 7.4 Environment Variables Required

```
OPENAI_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

---

## 8. Data Model

### 8.1 Core Tables (Supabase / PostgreSQL)

**`users`**
```
id              uuid PRIMARY KEY
email           text UNIQUE NOT NULL
store_name      text
plan_tier       enum('free', 'starter', 'pro') DEFAULT 'free'
stripe_customer_id  text
created_at      timestamp
```

**`searches`**
```
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users
keyword         text
region          text
results_json    jsonb   -- top 20 products
created_at      timestamp
```

**`generated_pages`**
```
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users
product_name    text
supplier_data   jsonb
generated_copy  jsonb   -- all AI-generated assets
tone_preset     text
created_at      timestamp
updated_at      timestamp
```

**`exports`**
```
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users
page_id         uuid REFERENCES generated_pages
csv_storage_url text
shopify_handle  text
created_at      timestamp
```

**`usage`**
```
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users
month           date   -- first day of billing month
searches_used   integer DEFAULT 0
generations_used numeric DEFAULT 0  -- allows 0.25 increments
```

---

## 9. Non-Functional Requirements

### 9.1 Performance

| Metric | Target |
|--------|--------|
| Pinterest search + scrape | < 8 seconds |
| Supplier matching (parallel) | < 6 seconds |
| AI page generation | < 12 seconds |
| CSV export build | < 2 seconds |
| Dashboard initial load | < 2 seconds (LCP) |

### 9.2 Reliability

- Target uptime: 99.5% monthly (allows ~3.6 hrs downtime/month)
- Scraping failure rate: < 10% of requests
- OpenAI API timeout handling: retry once after 5s, then return graceful error with manual retry option

### 9.3 Security

- All API routes require valid Supabase JWT authentication
- Plan enforcement validated server-side on every request — never client-side alone
- No Pinterest or supplier credentials are stored; scraping uses ephemeral sessions
- Stripe webhook signature validation required on all webhook handlers
- User-generated content (custom inputs) is sanitized before inclusion in OpenAI prompts (prompt injection mitigation)
- CSV files stored in Supabase Storage with private bucket; access requires signed URLs

### 9.4 Scalability

- At MVP scale (< 500 active users), the current architecture is adequate without additional infrastructure
- Playwright scraping is the primary bottleneck; a job queue (e.g., Redis + ARQ) should be introduced when concurrent scraping requests exceed ~10/minute

---

## 10. UX & Design Principles

### 10.1 Core Principles

1. **One action per screen.** Each page has a single dominant call-to-action. Everything else is subordinate.
2. **5-minute learning curve.** No feature should require documentation to use.
3. **Progress over perfection.** Show partial results while loading (e.g., stream supplier matches as they resolve rather than waiting for all three).
4. **No dead ends.** Every error state has a recovery action.
5. **Friction-free upgrade.** Upgrade prompts appear in-context, never requiring navigation away from the task.

### 10.2 Loading States

- Trend discovery: skeleton cards while results load; first 5 results displayed as they arrive (progressive loading)
- Supplier matching: spinner with status copy ("Checking AliExpress...", "Checking CJdropshipping...")
- AI generation: animated progress indicator with stage labels ("Analyzing product...", "Writing description...", "Building FAQ...")

### 10.3 Empty States

| Screen | Empty State Copy |
|--------|-----------------|
| Discover (first visit) | "Enter a niche to find your first trending product — try 'home decor' or 'pet accessories'" |
| Generate (no product selected) | "Select a product from Discover to start generating your page" |
| Export (no exports yet) | "Your exported files will appear here. Complete your first generation to export." |

---

## 11. Error Handling & Edge Cases

| Scenario | System Behavior |
|----------|----------------|
| Pinterest scrape returns CAPTCHA | Retry once after 30s delay; if second attempt fails, show "Results temporarily unavailable. Try again in a few minutes." |
| Pinterest returns 0 results for keyword | Show "No trending products found for this keyword. Try a broader term." with 3 suggested alternatives |
| Supplier matching returns 0 results | Show no-match state with manual AliExpress/CJ search links pre-filled with product keyword |
| OpenAI API timeout (> 15s) | Show error with "Retry" button; do not charge generation against user's limit |
| OpenAI API returns malformed JSON | Server-side retry with clarifying prompt; if second attempt fails, surface error and offer manual retry |
| CSV fails Shopify schema validation | Display specific field error and allow user to correct inline before re-export |
| Stripe payment failure | Webhook triggers email notification; 3-day grace period before access restriction |
| User exceeds plan limit mid-session | In-context modal explaining limit reached, with upgrade CTA and option to dismiss |

---

## 12. Analytics & Instrumentation

### 12.1 Required Tracking Events (MVP)

| Event | Trigger | Properties |
|-------|---------|-----------|
| `signup_completed` | User verifies email | plan_tier, signup_method |
| `search_submitted` | User submits keyword | keyword, region |
| `product_selected` | User clicks "Generate Page" | demand_score, has_supplier_match |
| `generation_started` | User clicks Generate | tone_preset, has_target_audience |
| `generation_completed` | AI returns successfully | duration_ms, plan_tier |
| `section_regenerated` | User regenerates a section | section_name |
| `export_downloaded` | User downloads CSV | plan_tier |
| `upgrade_prompt_shown` | Limit gate triggered | trigger_feature, plan_tier |
| `upgrade_completed` | Stripe checkout completed | from_plan, to_plan |

### 12.2 Tooling

- **Product analytics:** Posthog (open-source, generous free tier)
- **Error tracking:** Sentry (frontend + backend)
- **Uptime monitoring:** Better Uptime or UptimeRobot

---

## 13. Launch Checklist & Definition of Done

### 13.1 Technical Readiness

- [ ] Discover → Generate → Export flow works end-to-end without manual intervention
- [ ] All plan limits enforced server-side
- [ ] Stripe subscriptions fully operational (checkout, webhooks, cancellation)
- [ ] Email flows working (verification, password reset, billing confirmation)
- [ ] All error states handled with recovery actions
- [ ] Shopify CSV validated against Shopify's schema on at least 10 test imports
- [ ] Sentry error tracking active
- [ ] Core analytics events firing correctly in Posthog

### 13.2 Business Readiness

- [ ] Pricing page live with Starter and Pro plan options
- [ ] Terms of Service and Privacy Policy published
- [ ] Stripe billing portal accessible to users
- [ ] At least 5 external beta testers have completed the full flow
- [ ] At least 5 people have paid for a subscription

### 13.3 Definition of Done

> **PinCart AI is MVP-complete when:** (1) a user can sign up and complete the full discover → generate → export flow without any manual intervention from the team, AND (2) at least 5 people have paid for a subscription. Revenue, not perfection, defines completion.

---

## 14. Post-MVP Roadmap

Listed in rough priority order. None of these are commitments — sequencing depends on which paid user feedback signals are strongest.

| Priority | Feature | Rationale |
|----------|---------|-----------|
| P1 | Direct Shopify OAuth push | Eliminates last friction point in the pipeline |
| P1 | AliExpress / CJdropshipping API integration | Replaces fragile scraping with reliable data |
| P2 | Niche-specific AI prompt variants | Higher quality copy for fashion, beauty, pet niches |
| P2 | Brand voice customization | Retention feature for recurring users |
| P2 | ML-based demand scoring | More accurate trending product identification |
| P3 | Pinterest OAuth — saved board analysis | High-intent user path for Pinterest creators |
| P3 | WooCommerce export format | Broadens addressable market |
| P3 | Bulk product generation (10+ at once) | Pro power user feature |
| P3 | Annual billing plans | LTV optimization |
| P4 | Team accounts | Unlocks agency / freelancer segment |
| P4 | Mobile app | Reach expansion |

---

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Pinterest blocks scraping at scale | High | High | Rate-limit requests; rotate user agents; cache aggressively; evaluate Pinterest API partnership post-MVP |
| AliExpress scraping breaks | Medium | High | Abstract supplier matching behind an interface layer so CJdropshipping can cover alone; fast-track API integration |
| OpenAI API cost overrun | Low | Medium | Enforce generation limits; use GPT-3.5-turbo as cost fallback; monitor cost per generation in Stripe dashboard |
| Shopify changes CSV import format | Low | Medium | Schema validation step will catch format mismatches before users are affected; maintain Shopify CSV changelog watch |
| Free tier users don't convert | Medium | High | Limit export access firmly on free tier (the primary conversion lever); A/B test upgrade prompt copy |
| Solo developer capacity | High | Medium | Strict scope enforcement; no features added to MVP sprint without explicit trade-off analysis |
| Legal risk from scraping Pinterest | Medium | Medium | Use scraped data for display only (no redistribution); consult ToS; move to API integration as soon as viable |

---

## 16. Appendix: Shopify CSV Schema

Complete column list for Shopify product import CSV. All columns must be present even if empty.

```
Handle, Title, Body (HTML), Vendor, Product Category, Type, Tags, Published,
Option1 Name, Option1 Value, Option2 Name, Option2 Value, Option3 Name, Option3 Value,
Variant SKU, Variant Grams, Variant Inventory Tracker, Variant Inventory Qty,
Variant Inventory Policy, Variant Fulfillment Service, Variant Price,
Variant Compare At Price, Variant Requires Shipping, Variant Taxable,
Variant Barcode, Image Src, Image Position, Image Alt Text,
Gift Card, SEO Title, SEO Description, Google Shopping / Google Product Category,
Google Shopping / Gender, Google Shopping / Age Group, Google Shopping / MPN,
Google Shopping / AdWords Grouping, Google Shopping / AdWords Labels,
Google Shopping / Condition, Google Shopping / Custom Product,
Google Shopping / Custom Label 0, Google Shopping / Custom Label 1,
Google Shopping / Custom Label 2, Google Shopping / Custom Label 3,
Google Shopping / Custom Label 4, Variant Image, Variant Weight Unit,
Variant Tax Code, Cost per item, Included / United States,
Price / United States, Compare At Price / United States, Status
```

**PinCart AI populates:** Handle, Title, Body (HTML), Vendor, Type, Tags, Published, Option1 Name, Option1 Value, Variant SKU, Variant Inventory Policy, Variant Fulfillment Service, Variant Price, Variant Requires Shipping, Variant Taxable, Image Src, Image Position, SEO Title, SEO Description, Status.

All other columns are left empty (Shopify accepts this on import).

---

*PinCart AI PRD v1.0 — February 2026 — Confidential*
