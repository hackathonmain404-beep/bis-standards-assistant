"""
End-to-End Service & Integration Tests — BIS Intelligent Assistant
Validates the unified BISPipeline orchestrator and FastAPI HTTP endpoints (/query and /health).
Follows docs/ai/AI_PIPELINE.md and docs/api/API_CONTRACT.md.
"""

import pytest
from fastapi.testclient import TestClient

from ai.src.service.pipeline import BISPipeline
from ai.src.service.api import app, get_pipeline
from ai.src.understanding.intent import QueryIntent


@pytest.fixture(scope="module")
def pipeline():
    return get_pipeline()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_bis_pipeline_initialization(pipeline):
    """Verify that BISPipeline boots up with seed standards and indexed chunks."""
    assert pipeline.get_indexed_standards_count() >= 2
    assert pipeline.get_chunks_count() >= 10
    assert "doc-is-14543-2016" in pipeline.documents or any("14543" in doc_id for doc_id in pipeline.documents)


def test_bis_pipeline_standard_query_flow(pipeline):
    """Verify end-to-end query answering for water requirements with citations."""
    query = "What is the scope of IS 14543:2016 for packaged drinking water?"
    result = pipeline.query(query)

    assert result.response_text != ""
    assert result.intent in [
        QueryIntent.STANDARD_QUERY.value,
        QueryIntent.TESTING_REQUIREMENTS.value,
        QueryIntent.GENERAL_BIS.value,
    ]
    assert result.needs_clarification is False
    assert len(result.citations) > 0

    assert any("IS 14543" in (c["standard_id"] or "") for c in result.citations)
    first_cit = result.citations[0]
    assert first_cit["index"] == 1
    assert "snippet" in first_cit
    assert len(result.follow_up_suggestions) > 0


def test_bis_pipeline_product_recommendation_flow(pipeline):
    """Verify end-to-end product standard recommendation and retrieval."""
    query = "I manufacture electric steam irons for household use at 230V, what standard applies?"
    result = pipeline.query(query)

    assert result.response_text != ""
    assert result.needs_clarification is False
    assert len(result.citations) > 0
    # Must retrieve electric iron standard IS 302 (Part 2/Sec 3):2007
    found_iron = any("302" in (c["standard_id"] or "") for c in result.citations)
    assert found_iron is True


def test_bis_pipeline_clarification_flow(pipeline):
    """Verify that vague input properly halts at clarification without retrieval."""
    query = "i make products"
    result = pipeline.query(query)

    assert result.needs_clarification is True
    assert len(result.clarification_questions) > 0
    assert result.citations == []


def test_bis_pipeline_out_of_scope_flow(pipeline):
    """Verify that non-BIS query triggers polite domain refusal without hallucinations."""
    query = "What is the weather in Mumbai today?"
    result = pipeline.query(query)

    assert result.intent == QueryIntent.OUT_OF_SCOPE.value
    assert result.needs_clarification is False
    assert "Bureau of Indian Standards" in result.response_text
    assert result.citations == []
    assert len(result.follow_up_suggestions) > 0


def test_fastapi_health_endpoint(client):
    """Verify GET /health returns 200 and accurate service status."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["service"] == "bis-ai-service"
    assert data["version"] == "1.0.0"
    assert data["standards_indexed"] >= 2
    assert data["chunks_count"] >= 10
    assert "model" in data


def test_fastapi_query_endpoint(client):
    """Verify POST /query matches backend RealAIServiceClient contract."""
    payload = {
        "session_id": "test-session-123",
        "query": "What is the scope of IS 14543:2016 for packaged drinking water?",
        "language": "en",
    }
    resp = client.post("/query", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # CONTRACT VALIDATION: response_text must exist (NOT 'text')
    assert "response_text" in data
    assert isinstance(data["response_text"], str)
    assert data["response_text"] != ""

    assert "intent" in data
    assert "citations" in data
    assert isinstance(data["citations"], list)
    assert len(data["citations"]) > 0

    first_cit = data["citations"][0]
    assert first_cit["index"] == 1
    assert "standard_id" in first_cit
    assert "clause" in first_cit
    assert "snippet" in first_cit

    assert "needs_clarification" in data
    assert "clarification_questions" in data
    assert "follow_up_suggestions" in data
    assert "metadata" in data


def test_fastapi_query_validation_error(client):
    """Verify POST /query rejects empty or missing query with 400 Bad Request."""
    resp = client.post("/query", json={"language": "en"})
    assert resp.status_code == 400
    assert "detail" in resp.json()
