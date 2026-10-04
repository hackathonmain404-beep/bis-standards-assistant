"""
Server Entrypoint — BIS Intelligent Assistant AI Service
Launches the FastAPI application on the configured host and port.
"""

import sys
from pathlib import Path

# Ensure repo root is in sys.path so 'ai' package is discoverable from any directory
repo_root = str(Path(__file__).resolve().parent.parent)
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

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
