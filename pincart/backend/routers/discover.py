"""Pinterest Trend Discovery — Playwright scraper"""
import asyncio
import random
from fastapi import APIRouter, Query, HTTPException
from playwright.async_api import async_playwright

router = APIRouter()

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
]

# In-memory cache: keyword -> (timestamp, results)
_cache: dict[str, tuple[float, list]] = {}
CACHE_TTL = 4 * 3600  # 4 hours


async def _scrape_pinterest(keyword: str) -> list[dict]:
    """Scrape Pinterest search results for a keyword."""
    import time

    # Check cache
    now = time.time()
    if keyword.lower() in _cache:
        ts, results = _cache[keyword.lower()]
        if now - ts < CACHE_TTL:
            return results

    pins: list[dict] = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={"width": 1280, "height": 900},
        )
        page = await context.new_page()

        url = f"https://www.pinterest.com/search/pins/?q={keyword.replace(' ', '%20')}"
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=15000)
            await page.wait_for_timeout(3000)

            # Scroll once for more results
            await page.evaluate("window.scrollBy(0, 2000)")
            await page.wait_for_timeout(2000)

            # Extract pin data from the page
            pins = await page.evaluate("""
                () => {
                    const results = [];
                    // Pinterest renders pins in divs with data-test-id or role=listitem
                    const pinElements = document.querySelectorAll('[data-test-id="pin"], [role="listitem"]');

                    pinElements.forEach((el, i) => {
                        if (i >= 50) return; // cap at 50

                        const img = el.querySelector('img');
                        const link = el.querySelector('a[href*="/pin/"]');
                        const titleEl = el.querySelector('[title]') || el.querySelector('img');

                        if (img && link) {
                            results.push({
                                image: img.src || img.getAttribute('srcset')?.split(' ')[0] || '',
                                title: titleEl?.getAttribute('title') || titleEl?.getAttribute('alt') || 'Untitled Pin',
                                pin_url: 'https://www.pinterest.com' + (link.getAttribute('href') || ''),
                                saves_text: ''
                            });
                        }
                    });

                    // Fallback: grab all images if structured parsing fails
                    if (results.length === 0) {
                        const imgs = document.querySelectorAll('img[src*="pinimg"]');
                        imgs.forEach((img, i) => {
                            if (i >= 50) return;
                            const parent = img.closest('a');
                            results.push({
                                image: img.src || '',
                                title: img.alt || 'Pinterest Product',
                                pin_url: parent ? 'https://www.pinterest.com' + parent.getAttribute('href') : '',
                                saves_text: ''
                            });
                        });
                    }
                    return results;
                }
            """)
        except Exception:
            # Retry once after delay
            await page.wait_for_timeout(5000)
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=15000)
                await page.wait_for_timeout(4000)
                pins = await page.evaluate("""
                    () => {
                        const results = [];
                        const imgs = document.querySelectorAll('img[src*="pinimg"]');
                        imgs.forEach((img, i) => {
                            if (i >= 50) return;
                            const parent = img.closest('a');
                            results.push({
                                image: img.src || '',
                                title: img.alt || 'Pinterest Product',
                                pin_url: parent ? 'https://www.pinterest.com' + parent.getAttribute('href') : '',
                                saves_text: ''
                            });
                        });
                        return results;
                    }
                """)
            except Exception:
                pass
        finally:
            await browser.close()

    # Deduplicate by image URL
    seen = set()
    unique: list[dict] = []
    for pin in pins:
        key = pin.get("image", "")
        if key and key not in seen:
            seen.add(key)
            unique.append(pin)

    # Score and rank — simple heuristic based on position (earlier = higher engagement)
    scored: list[dict] = []
    for i, pin in enumerate(unique[:30]):
        score = max(0, 100 - i * 3)  # Position-based score
        pin["demand_score"] = score
        scored.append(pin)

    scored.sort(key=lambda x: x["demand_score"], reverse=True)
    top20 = scored[:20]

    # Cache results
    _cache[keyword.lower()] = (now, top20)
    return top20


@router.get("/discover")
async def discover(keyword: str = Query(..., max_length=80, description="Niche or product keyword")):
    """Discover trending Pinterest products for a keyword."""
    if not keyword.strip():
        raise HTTPException(400, "Keyword is required")

    results = await _scrape_pinterest(keyword.strip())
    if not results:
        raise HTTPException(
            404,
            detail="No trending products found for this keyword. Try a broader term like 'home decor' or 'pet accessories'.",
        )
    return {"keyword": keyword, "count": len(results), "products": results}
