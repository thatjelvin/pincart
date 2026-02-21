"""Pytest fixtures for PinCart AI backend tests."""
import os
import sys

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Set dummy env vars so the Supabase client can initialise without real creds
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MTU5MDIyLCJleHAiOjE5MzE3MzUwMjJ9.abc123")
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")
