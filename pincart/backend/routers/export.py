"""Shopify CSV Exporter"""
import csv
import io
import uuid
import time
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()

# Full Shopify CSV columns — all must be present
SHOPIFY_COLUMNS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags",
    "Published", "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value",
    "Option3 Name", "Option3 Value", "Variant SKU", "Variant Grams",
    "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy",
    "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
    "Variant Requires Shipping", "Variant Taxable", "Variant Barcode",
    "Image Src", "Image Position", "Image Alt Text", "Gift Card",
    "SEO Title", "SEO Description",
    "Google Shopping / Google Product Category", "Google Shopping / Gender",
    "Google Shopping / Age Group", "Google Shopping / MPN",
    "Google Shopping / AdWords Grouping", "Google Shopping / AdWords Labels",
    "Google Shopping / Condition", "Google Shopping / Custom Product",
    "Google Shopping / Custom Label 0", "Google Shopping / Custom Label 1",
    "Google Shopping / Custom Label 2", "Google Shopping / Custom Label 3",
    "Google Shopping / Custom Label 4", "Variant Image", "Variant Weight Unit",
    "Variant Tax Code", "Cost per item", "Included / United States",
    "Price / United States", "Compare At Price / United States", "Status",
]


def _slugify(text: str) -> str:
    import re
    slug = text.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s]+', '-', slug)
    return slug[:80]


class ExportRequest(BaseModel):
    product_name: str
    description_html: str = ""
    bullets: list[str] = []
    faq: list[dict] = []
    price: float = 29.99
    image_url: str = ""
    vendor: str = "My Store"
    tags: str = ""
    seo_title: str = ""
    seo_description: str = ""


@router.post("/export")
async def export_csv(req: ExportRequest):
    """Generate and return a Shopify-compatible product CSV."""
    if not req.product_name.strip():
        raise HTTPException(400, "Product name is required")

    # Build HTML body
    body_parts = []
    if req.description_html:
        body_parts.append(req.description_html)
    if req.bullets:
        bullet_html = "<ul>" + "".join(f"<li>{b}</li>" for b in req.bullets) + "</ul>"
        body_parts.append(bullet_html)
    if req.faq:
        faq_html = "<div class='faq'>"
        for item in req.faq:
            faq_html += f"<h4>{item.get('q', '')}</h4><p>{item.get('a', '')}</p>"
        faq_html += "</div>"
        body_parts.append(faq_html)

    body_html = "\n".join(body_parts)

    # Generate SKU
    nonce = uuid.uuid4().hex[:6].upper()
    sku = f"PCA-{nonce}-{int(time.time())}"

    # Build row with all Shopify columns
    row = {col: "" for col in SHOPIFY_COLUMNS}
    row.update({
        "Handle": _slugify(req.product_name),
        "Title": req.product_name,
        "Body (HTML)": body_html,
        "Vendor": req.vendor,
        "Type": "Dropship",
        "Tags": req.tags or req.product_name.lower(),
        "Published": "TRUE",
        "Option1 Name": "Title",
        "Option1 Value": "Default Title",
        "Variant SKU": sku,
        "Variant Inventory Policy": "continue",
        "Variant Fulfillment Service": "manual",
        "Variant Price": str(req.price),
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Image Src": req.image_url,
        "Image Position": "1",
        "Image Alt Text": req.product_name,
        "Gift Card": "FALSE",
        "SEO Title": req.seo_title or req.product_name,
        "SEO Description": req.seo_description or "",
        "Status": "active",
    })

    # Write CSV to memory
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=SHOPIFY_COLUMNS)
    writer.writeheader()
    writer.writerow(row)
    output.seek(0)

    filename = f"pincart-{_slugify(req.product_name)}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
