"""Tests for rate-limiting middleware."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def rate_limited_client():
    """Return a client with rate limiting enabled and a low limit."""
    os.environ["RATE_LIMIT_ENABLED"] = "true"
    os.environ["RATE_LIMIT_RPM"] = "3"
    # Force module reload to pick up env changes
    import importlib
    import core.rate_limit as rl_mod

    importlib.reload(rl_mod)

    from main import app

    with TestClient(app) as c:
        yield c
    # Reset
    os.environ["RATE_LIMIT_ENABLED"] = "false"
    os.environ["RATE_LIMIT_RPM"] = "30"
    importlib.reload(rl_mod)


def test_health_not_rate_limited(rate_limited_client):
    """/health should be exempt from rate limiting."""
    for _ in range(10):
        resp = rate_limited_client.get("/health")
        assert resp.status_code == 200
