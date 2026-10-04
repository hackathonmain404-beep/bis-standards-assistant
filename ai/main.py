"""
Server Entrypoint — BIS Intelligent Assistant AI Service
Launches the FastAPI application on the configured host and port.
"""

import sys
import uvicorn
from ai.src.service.api import app
from ai.src.config import AIConfig


def start() -> None:
    port = AIConfig.get_service_port()
    host = "0.0.0.0"
    print(f"Starting BIS Intelligent Assistant AI Service on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    start()
