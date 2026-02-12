"""AI Product Page Generator — OpenAI GPT-4o"""
import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
from db import supabase

router = APIRouter()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))

SYSTEM_PROMPT = """You are an expert ecommerce copywriter who writes high-conversion Shopify product pages. 
You specialize in dropshipping products and write copy that sells. Your output must be valid JSON."""


class GenerateRequest(BaseModel):
    product_name: str
    target_audience: str = ""
    tone: str = "standard"  # standard, playful, luxury, urgency
    supplier_price: float | None = None
    user_id: str | None = None


@router.post("/generate")
async def generate_page(req: GenerateRequest):
    """Generate a full AI product page."""
    if not req.product_name.strip():
        raise HTTPException(400, "Product name is required")

    tone_instructions = {
        "standard": "Write in a clear, professional ecommerce tone.",
        "playful": "Write in a fun, energetic tone with personality.",
        "luxury": "Write in an elevated, premium tone that signals quality and exclusivity.",
        "urgency": "Write with urgency and scarcity — limited stock, trending now, selling fast.",
    }
    tone_text = tone_instructions.get(req.tone, tone_instructions["standard"])

    audience_line = f"Target audience: {req.target_audience}." if req.target_audience else ""
    price_line = f"The product costs approximately ${req.supplier_price} wholesale." if req.supplier_price else ""

    prompt = f"""Write a complete Shopify product page for: "{req.product_name}"

{audience_line}
{price_line}
{tone_text}

Return a JSON object with these exact keys:
{{
  "seo_title": "SEO-optimized product title (60-70 characters)",
  "description": "Benefit-driven product description focusing on outcomes, not features (250-400 words, HTML formatted with <p> tags)",
  "bullets": ["5-7 concise feature bullet points"],
  "faq": [
    {{"q": "question", "a": "answer"}}
  ],
  "meta_description": "SEO meta description under 155 characters",
  "tiktok_hook": "A punchy 1-2 sentence TikTok ad opening hook",
  "pinterest_caption": "Pinterest pin description optimized for saves (under 100 words)"
}}

Write for MAXIMUM conversion. Make the buyer feel they need this product TODAY."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or "{}"
        generated = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(500, "AI returned invalid output. Please retry.")
    except Exception as e:
        raise HTTPException(500, f"AI generation failed: {str(e)}")

    # Save to Supabase if user_id provided
    if req.user_id:
        try:
            supabase.table("generations").insert({
                "user_id": req.user_id,
                "product_name": req.product_name,
                "supplier_data": {"price": req.supplier_price},
                "generated_copy": generated,
                "tone_preset": req.tone,
            }).execute()
        except Exception:
            pass  # Don't fail the request if DB save fails

    return {
        "product_name": req.product_name,
        "generated": generated,
    }
