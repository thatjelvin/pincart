"""Tests for the /discover endpoint (mocked Playwright scraping)."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from unittest.mock import AsyncMock, patch

import pytest


MOCK_PINS = [
    {
        "image": "https://i.pinimg.com/1.jpg",
        "title": "Test Product",
        "pin_url": "https://www.pinterest.com/pin/123",
        "saves_text": "",
        "demand_score": 100,
    },
    {
        "image": "https://i.pinimg.com/2.jpg",
        "title": "Another Product",
        "pin_url": "https://www.pinterest.com/pin/456",
        "saves_text": "",
        "demand_score": 97,
    },
]


def test_discover_returns_products(client):
    """GET /discover?keyword=test returns mocked products."""
    with patch("routers.discover._scrape_pinterest", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = MOCK_PINS
        resp = client.get("/discover", params={"keyword": "test"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["keyword"] == "test"
    assert data["count"] == 2
    assert len(data["products"]) == 2


def test_discover_empty_keyword(client):
    """GET /discover with blank keyword returns 400."""
    resp = client.get("/discover", params={"keyword": "   "})
    assert resp.status_code == 400


def test_discover_no_results(client):
    """GET /discover returns 404 when scraping finds nothing."""
    with patch("routers.discover._scrape_pinterest", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = []
        resp = client.get("/discover", params={"keyword": "xyznonexistent"})
    assert resp.status_code == 404
