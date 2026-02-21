"""PinCart AI — Mailgun transactional email client."""
import os
from typing import Optional

import httpx

MAILGUN_API_KEY: str = os.getenv("MAILGUN_API_KEY", "")
MAILGUN_DOMAIN: str = os.getenv("MAILGUN_DOMAIN", "")
MAILGUN_FROM: str = os.getenv(
    "MAILGUN_FROM", f"PinCart AI <noreply@{MAILGUN_DOMAIN}>"
)
MAILGUN_API_URL: str = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"


async def send_email(
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
) -> bool:
    """Send a transactional email via Mailgun.

    Returns ``True`` on success, ``False`` otherwise.
    """
    if not MAILGUN_API_KEY or not MAILGUN_DOMAIN:
        return False

    data = {
        "from": MAILGUN_FROM,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    if text:
        data["text"] = text

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                MAILGUN_API_URL,
                auth=("api", MAILGUN_API_KEY),
                data=data,
            )
            return resp.status_code == 200
    except Exception:
        return False
