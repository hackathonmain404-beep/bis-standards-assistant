"""
Configuration & Environment Loader — BIS Intelligent Assistant
Loads environment variables from ai/.env and root .env without external dependencies.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional


def load_env() -> None:
    """
    Loads key=value pairs from ai/.env and d:/bis/.env into os.environ if not already set.
    """
    candidates = [
        Path(__file__).resolve().parent.parent / ".env",  # ai/.env
        Path(__file__).resolve().parent.parent.parent / ".env",  # repo root .env
    ]

    for env_path in candidates:
        if env_path.is_file():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip("\"'")
                        if key and key not in os.environ:
                            os.environ[key] = val
            except Exception:
                pass


# Auto-load on import
load_env()


class AIConfig:
    """Central configuration for AI/RAG engine."""
    @staticmethod
    def get_gemini_api_key() -> Optional[str]:
        return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    @staticmethod
    def get_gemini_model() -> str:
        return os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    @staticmethod
    def get_service_port() -> int:
        return int(os.getenv("AI_SERVICE_PORT", "8001"))
