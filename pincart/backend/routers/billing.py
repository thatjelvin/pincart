"""Stripe Billing & Webhook Handler"""
import os
import stripe
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from db import supabase

router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Plan price IDs — set these after creating products in Stripe Dashboard
PLAN_PRICES = {
    "starter": os.getenv("STRIPE_STARTER_PRICE_ID", "price_starter"),
    "pro": os.getenv("STRIPE_PRO_PRICE_ID", "price_pro"),
}


class CheckoutRequest(BaseModel):
    user_id: str
    email: str
    plan: str  # "starter" or "pro"


@router.post("/create-checkout")
async def create_checkout(req: CheckoutRequest):
    """Create a Stripe Checkout session for subscription."""
    if req.plan not in PLAN_PRICES:
        raise HTTPException(400, "Invalid plan. Choose 'starter' or 'pro'.")

    try:
        # Get or create Stripe customer
        user_data = supabase.table("users").select("stripe_customer_id").eq("id", req.user_id).single().execute()
        customer_id = user_data.data.get("stripe_customer_id") if user_data.data else None

        if not customer_id:
            customer = stripe.Customer.create(email=req.email, metadata={"user_id": req.user_id})
            customer_id = customer.id
            supabase.table("users").update({"stripe_customer_id": customer_id}).eq("id", req.user_id).execute()

        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{"price": PLAN_PRICES[req.plan], "quantity": 1}],
            success_url=f"{FRONTEND_URL}/dashboard?upgraded=true",
            cancel_url=f"{FRONTEND_URL}/billing?cancelled=true",
            metadata={"user_id": req.user_id, "plan": req.plan},
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(500, f"Checkout creation failed: {str(e)}")


@router.post("/create-portal")
async def create_portal(req: CheckoutRequest):
    """Create Stripe Customer Portal session for managing subscription."""
    try:
        user_data = supabase.table("users").select("stripe_customer_id").eq("id", req.user_id).single().execute()
        customer_id = user_data.data.get("stripe_customer_id") if user_data.data else None

        if not customer_id:
            raise HTTPException(400, "No billing account found. Subscribe to a plan first.")

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{FRONTEND_URL}/billing",
        )
        return {"portal_url": session.url}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Portal creation failed: {str(e)}")


@router.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(400, "Invalid webhook signature")

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        user_id = data.get("metadata", {}).get("user_id")
        plan = data.get("metadata", {}).get("plan", "starter")
        if user_id:
            supabase.table("users").update({
                "plan_tier": plan,
                "stripe_customer_id": data.get("customer"),
            }).eq("id", user_id).execute()

    elif event_type == "customer.subscription.updated":
        customer_id = data.get("customer")
        status = data.get("status")
        if customer_id and status == "active":
            # Plan could have changed
            price_id = data["items"]["data"][0]["price"]["id"] if data.get("items") else None
            plan = "starter"
            for plan_name, pid in PLAN_PRICES.items():
                if pid == price_id:
                    plan = plan_name
                    break
            supabase.table("users").update({"plan_tier": plan}).eq("stripe_customer_id", customer_id).execute()

    elif event_type == "customer.subscription.deleted":
        customer_id = data.get("customer")
        if customer_id:
            supabase.table("users").update({"plan_tier": "free"}).eq("stripe_customer_id", customer_id).execute()

    elif event_type == "invoice.payment_failed":
        # Could send email notification here — skip for MVP
        pass

    return {"received": True}
