"""PinCart AI — FastAPI Application"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import discover, match, generate, export, billing

app = FastAPI(title="PinCart AI", version="1.0.0")

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


@app.get("/health")
def health():
    return {"status": "ok"}
