"""
Service Package — BIS Intelligent Assistant
Exposes the unified BISPipeline orchestrator and FastAPI application endpoints.
"""

from ai.src.service.pipeline import BISPipeline
from ai.src.service.api import app

__all__ = ["BISPipeline", "app"]
