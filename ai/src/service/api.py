"""
FastAPI HTTP Service Interface — BIS Intelligent Assistant AI Engine
Exposes POST /query and GET /health endpoints matching docs/api/API_CONTRACT.md.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from ai.src.service.pipeline import BISPipeline
from ai.src.generation.synthesizer import AIResponsePayload
from ai.src.config import AIConfig

logger = logging.getLogger(__name__)

# Global singleton pipeline instance
_pipeline_instance: Optional[BISPipeline] = None


def get_pipeline() -> BISPipeline:
    """Returns or lazily instantiates the BISPipeline singleton."""
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = BISPipeline()
    return _pipeline_instance


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes corpus and models at startup."""
    logger.info("Initializing BIS Intelligent Assistant AI Pipeline...")
    pipeline = get_pipeline()
    logger.info(
        "AI Pipeline ready: %d standards, %d chunks indexed.",
        pipeline.get_indexed_standards_count(),
        pipeline.get_chunks_count(),
    )
    yield


import time
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

app = FastAPI(
    title="BIS Intelligent Assistant — AI / RAG Service",
    description="Domain-specific RAG engine for the Bureau of Indian Standards (BIS)",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend and backend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request, call_next):
    """Logs incoming HTTP requests and attaches performance telemetry header."""
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000
    response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"
    logger.info("%s %s -> %d (%.2f ms)", request.method, request.url.path, response.status_code, duration_ms)
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    """Custom handler for pydantic validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Request body validation failed", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc: Exception):
    """Global error boundary preventing unhandled stack trace leakage."""
    logger.error("Unhandled service error on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal AI Service Error. The query could not be processed at this time.",
            "error_code": "INTERNAL_AI_ERROR",
        },
    )


class QueryRequest(BaseModel):
    """Incoming query request payload matching docs/api/API_CONTRACT.md."""
    model_config = ConfigDict(extra="ignore")

    session_id: Optional[str] = Field(None, description="Client session identifier")
    query: Optional[str] = Field(None, description="User query text")
    message: Optional[str] = Field(None, description="Alias for query")
    conversation_history: Optional[List[Dict[str, str]]] = Field(
        default_factory=list,
        description="Prior conversational turns [{'role': 'user', 'content': '...'}]",
    )
    language: str = Field(default="en", description="Target response language ('en' or 'hi')")


class HealthResponse(BaseModel):
    """Health check payload."""
    status: str = "healthy"
    service: str = "bis-ai-service"
    version: str = "1.0.0"
    standards_indexed: int
    chunks_count: int
    model: str


@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
def health_check() -> HealthResponse:
    """
    Returns the operational health and index readiness of the AI engine.
    """
    pipeline = get_pipeline()
    return HealthResponse(
        status="healthy",
        service="bis-ai-service",
        version="1.0.0",
        standards_indexed=pipeline.get_indexed_standards_count(),
        chunks_count=pipeline.get_chunks_count(),
        model=AIConfig.get_gemini_model(),
    )


@app.post("/query", response_model=AIResponsePayload, tags=["Inference"])
def process_query(req: QueryRequest) -> AIResponsePayload:
    """
    Processes a natural language query against the BIS knowledge base.
    Guarantees 'response_text' (not 'text') and contiguous 1-based citations.
    """
    user_query = req.query or req.message
    if not user_query or not user_query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'query' or 'message' must be provided and non-empty.",
        )

    pipeline = get_pipeline()
    result = pipeline.query(
        query=user_query.strip(),
        session_id=req.session_id,
        conversation_history=req.conversation_history,
        language=req.language or "en",
    )
    return result


class IngestRequest(BaseModel):
    """Payload to trigger ingestion of a PDF or text standard."""
    model_config = ConfigDict(extra="ignore")

    file_path: str = Field(..., description="Path to PDF or TXT standard document on disk")
    standard_number: Optional[str] = Field(None, description="Indian Standard number (e.g. IS 10500:2012)")
    title: Optional[str] = Field(None, description="Document title")
    document_id: Optional[str] = Field(None, description="Unique document ID (e.g. doc-is-10500-2012)")
    year: Optional[str] = Field(None, description="Publication year")
    categories: Optional[List[str]] = Field(default_factory=list, description="Product categories")


@app.post("/corpus/reload", tags=["Ingestion"])
def reload_corpus() -> Dict[str, Any]:
    """
    Reloads all processed chunks from disk and re-indexes the search engine in memory.
    """
    pipeline = get_pipeline()
    standards_count, chunks_count = pipeline.reload_corpus()
    return {
        "status": "reloaded",
        "standards_indexed": standards_count,
        "chunks_count": chunks_count,
    }


@app.post("/corpus/ingest", tags=["Ingestion"])
def ingest_file(req: IngestRequest) -> Dict[str, Any]:
    """
    Ingests a single PDF or text file into the knowledge base and re-indexes in-memory retriever.
    """
    from pathlib import Path
    from ai.src.ingestion.pipeline import IngestionPipeline

    target_path = Path(req.file_path)
    if not target_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found on server at: {req.file_path}",
        )

    pipeline = get_pipeline()
    ingestor = IngestionPipeline()
    try:
        doc, chunks = ingestor.process_file_and_save(
            input_filepath=target_path,
            output_dir=pipeline.processed_dir,
            document_id=req.document_id,
            title=req.title,
            standard_number=req.standard_number,
            year=req.year,
            product_categories=req.categories,
        )
        # Hot-reload in memory
        standards_count, chunks_count = pipeline.reload_corpus()
        return {
            "status": "ingested",
            "document_id": doc.document_id,
            "standard_number": doc.standard_number,
            "title": doc.title,
            "chunks_created": len(chunks),
            "total_standards_indexed": standards_count,
            "total_chunks_indexed": chunks_count,
        }
    except Exception as exc:
        logger.error("Failed to ingest file %s: %s", req.file_path, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest document: {exc}",
        )

