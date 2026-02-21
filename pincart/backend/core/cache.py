"""PinCart AI — Redis caching layer."""
import os
import json
import hashlib
from typing import Any, Optional

import redis.asyncio as redis

REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DEFAULT_TTL: int = int(os.getenv("CACHE_TTL_SECONDS", str(24 * 3600)))  # 24 hours

_pool: Optional[redis.Redis] = None


async def get_redis() -> redis.Redis:
    """Return a shared async Redis connection (lazy-initialised)."""
    global _pool
    if _pool is None:
        _pool = redis.from_url(REDIS_URL, decode_responses=True)
    return _pool


def _cache_key(prefix: str, identifier: str) -> str:
    """Build a deterministic cache key."""
    h = hashlib.sha256(identifier.encode()).hexdigest()[:16]
    return f"pincart:{prefix}:{h}"


async def cache_get(prefix: str, identifier: str) -> Optional[Any]:
    """Retrieve a cached JSON value, or *None* on miss."""
    try:
        r = await get_redis()
        raw = await r.get(_cache_key(prefix, identifier))
        if raw is not None:
            return json.loads(raw)
    except Exception:
        pass
    return None


async def cache_set(
    prefix: str,
    identifier: str,
    value: Any,
    ttl: int = DEFAULT_TTL,
) -> None:
    """Store a JSON-serialisable value with a TTL (seconds)."""
    try:
        r = await get_redis()
        await r.set(
            _cache_key(prefix, identifier),
            json.dumps(value),
            ex=ttl,
        )
    except Exception:
        pass


async def close_redis() -> None:
    """Close the connection pool (call on shutdown)."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
