"""PinCart AI — FastAPI Application."""
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from dotenv import load_dotenv

load_dotenv()

# Sentry — initialise before anything else when DSN is configured
from services.sentry_setup import init_sentry

init_sentry()

from routers import discover, match, generate, export, billing
from core.cache import close_redis
from core.rate_limit import RateLimitMiddleware

app = FastAPI(title="PinCart AI", version="1.0.0")


# --- Security headers middleware ---
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach common security headers to every response."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=63072000; includeSubDomains; preload"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(discover.router, tags=["Discover"])
app.include_router(match.router, tags=["Match"])
app.include_router(generate.router, tags=["Generate"])
app.include_router(export.router, tags=["Export"])
app.include_router(billing.router, tags=["Billing"])


@app.on_event("shutdown")
async def _shutdown() -> None:
    await close_redis()


@app.get("/health")
async def health() -> dict:
    """Health-check endpoint used by load balancers and uptime monitors."""
    redis_ok = False
    try:
        from core.cache import get_redis

        r = await get_redis()
        redis_ok = await r.ping()
    except Exception:
        pass
    return {"status": "ok", "redis": redis_ok}
