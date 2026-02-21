"""PinCart AI — Sentry error tracking initialisation."""
import os
from typing import Optional

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration


def init_sentry() -> Optional[str]:
    """Initialise Sentry if ``SENTRY_DSN`` is set.

    Returns the DSN on success, ``None`` when skipped.
    """
    dsn: str = os.getenv("SENTRY_DSN", "")
    if not dsn:
        return None

    sentry_sdk.init(
        dsn=dsn,
        environment=os.getenv("SENTRY_ENVIRONMENT", "production"),
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.2")),
        profiles_sample_rate=float(
            os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1")
        ),
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            StarletteIntegration(transaction_style="endpoint"),
        ],
        send_default_pii=False,
    )
    return dsn
