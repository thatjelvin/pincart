"""PinCart AI — Celery async task queue for Pinterest scraping."""
import os

from celery import Celery

REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "pincart",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_soft_time_limit=120,
    task_time_limit=180,
    worker_concurrency=2,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def scrape_pinterest_task(self, keyword: str) -> dict:
    """Run Pinterest scraping as a background Celery task.

    Usage::

        result = scrape_pinterest_task.delay("home decor")
        data = result.get(timeout=60)
    """
    import asyncio
    from routers.discover import _scrape_pinterest

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        results = loop.run_until_complete(_scrape_pinterest(keyword))
        return {"keyword": keyword, "count": len(results), "products": results}
    except Exception as exc:
        raise self.retry(exc=exc)
    finally:
        loop.close()
