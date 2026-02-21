"""Pytest fixtures for PinCart AI backend tests."""
import os
import sys

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client():
    """Return a FastAPI TestClient with rate-limiting disabled."""
    os.environ["RATE_LIMIT_ENABLED"] = "false"
    # Re-import to pick up env change
    from main import app

    with TestClient(app) as c:
        yield c
