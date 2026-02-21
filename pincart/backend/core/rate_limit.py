"""PinCart AI — Rate-limiting middleware.

Uses a simple sliding-window counter stored in Redis.
Falls back to an in-memory dict when Redis is unavailable.
"""
import os
import time
from typing import Dict, Tuple

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

# Configurable via environment
RATE_LIMIT_RPM: int = int(os.getenv("RATE_LIMIT_RPM", "30"))  # requests per minute
RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"

# In-memory fallback store: ip -> (window_start, count)
_mem_store: Dict[str, Tuple[float, int]] = {}


def _client_ip(request: Request) -> str:
    """Extract the client IP from the request."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding-window rate limiter (per IP, per minute)."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if not RATE_LIMIT_ENABLED:
            return await call_next(request)

        # Skip health-check and docs
        if request.url.path in ("/health", "/docs", "/openapi.json", "/redoc"):
            return await call_next(request)

        ip = _client_ip(request)
        now = time.time()
        window_start = now - 60

        # Try Redis first
        try:
            from core.cache import get_redis

            r = await get_redis()
            key = f"pincart:rl:{ip}"
            # Remove old entries
            await r.zremrangebyscore(key, 0, window_start)
            count = await r.zcard(key)
            if count >= RATE_LIMIT_RPM:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please try again later.",
                )
            await r.zadd(key, {str(now): now})
            await r.expire(key, 120)
            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_RPM)
            response.headers["X-RateLimit-Remaining"] = str(
                max(0, RATE_LIMIT_RPM - count - 1)
            )
            return response
        except HTTPException:
            raise
        except Exception:
            pass

        # Fallback: in-memory counter
        entry = _mem_store.get(ip)
        if entry is None or entry[0] < window_start:
            _mem_store[ip] = (now, 1)
        else:
            ws, cnt = entry
            if cnt >= RATE_LIMIT_RPM:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please try again later.",
                )
            _mem_store[ip] = (ws, cnt + 1)

        response = await call_next(request)
        return response
