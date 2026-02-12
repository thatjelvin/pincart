"""PinCart AI — Supabase client"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    import warnings
    warnings.warn(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY are not set. "
        "Copy .env.example to .env and fill in your Supabase credentials."
    )
    # Provide a valid-looking placeholder so the app can start for development.
    # Actual database calls will fail until real credentials are provided.
    SUPABASE_URL = SUPABASE_URL or "https://placeholder.supabase.co"
    SUPABASE_KEY = SUPABASE_KEY or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
