"""
Unit and Integration Tests for Generation & Synthesis Pipeline
Validates PromptBuilder, CitationValidator, Deterministic and Gemini LLM Clients,
and ResponseSynthesizer contract compliance.
"""

from unittest.mock import MagicMock, patch
import pytest

from ai.src.models.knowledge import BISChunk
from ai.src.reranking.selector import EvidenceContext
from ai.src.understanding.intent import QueryIntent
from ai.src.understanding.analyzer import QueryAnalysisResult
from ai.src.generation.prompts import PromptBuilder
from ai.src.generation.citations import CitationValidator
from ai.src.generation.llm import DeterministicLLMClient, GeminiLLMClient
from ai.src.generation.synthesizer import ResponseSynthesizer, AIResponsePayload


@pytest.fixture
def sample_chunks():
    c1 = BISChunk(
        chunk_id="chk-1",
        document_id="IS_14543_2016",
        chunk_index=0,
        standard_number="IS 14543:2016",
        document_title="Packaged Drinking Water",
        section_title="Requirements",
        clause="4.2",
        content="The water shall conform to the chemical requirements. The pH value shall be between 6.5 and 8.5.",
        char_count=98,
    )
    c2 = BISChunk(
        chunk_id="chk-2",
        document_id="IS_14543_2016",
        chunk_index=1,
        standard_number="IS 14543:2016",
        document_title="Packaged Drinking Water",
        section_title="Marking",
        clause="5.2",
        content="Every container shall be marked with the BIS Standard Mark and licensee details.",
        char_count=82,
    )
    return [c1, c2]


def test_prompt_builder_formatting(sample_chunks):
    """Verify prompt builder formats system prompt, evidence blocks, and history."""
    # 1. System prompt
    sys_en = PromptBuilder.build_system_prompt("en")
    assert "Bureau of Indian Standards" in sys_en
    assert "CRITICAL RULES" in sys_en

    sys_hi = PromptBuilder.build_system_prompt("hi")
    assert "Hindi" in sys_hi
    assert "Do NOT translate: Indian Standard numbers" in sys_hi

    # 2. Evidence block
    ev_block = PromptBuilder.build_evidence_block(sample_chunks)
    assert "=== EVIDENCE ===" in ev_block
    assert "EVIDENCE [1]:" in ev_block
    assert "IS 14543:2016" in ev_block
    assert "Clause: 4.2" in ev_block
    assert "EVIDENCE [2]:" in ev_block
    assert "=== END EVIDENCE ===" in ev_block

    # 3. History block truncation
    history = [
        {"role": "user", "content": f"Query {i}"}
        for i in range(10)
    ]
    hist_block = PromptBuilder.build_history_block(history, max_turns=3)
    assert "Query 7" in hist_block
    assert "Query 9" in hist_block
    assert "Query 2" not in hist_block  # Truncated

    # 4. Full prompt assembly
    full_prompt = PromptBuilder.build_full_prompt(
        query="What is the pH requirement?",
        chunks=sample_chunks,
        conversation_history=history,
        language="en",
    )
    assert "=== CURRENT USER QUERY ===" in full_prompt
    assert "What is the pH requirement?" in full_prompt


def test_citation_validator_logic(sample_chunks):
    """Verify citation extraction, stripping hallucinated markers, and contiguous renumbering."""
    text_with_cits = "The pH limit is 6.5 to 8.5 [1]. Marking must be present [2]. Extra hallucination [99]."

    # Validate and build
    cleaned, citations = CitationValidator.validate_and_build(text_with_cits, sample_chunks)
    assert "[1]" in cleaned
    assert "[2]" in cleaned
    assert "[99]" not in cleaned  # Stripped!
    assert len(citations) == 2
    assert citations[0]["index"] == 1
    assert citations[0]["standard_id"] == "IS 14543:2016"
    assert citations[0]["clause"] == "4.2"
    assert citations[1]["index"] == 2
    assert citations[1]["clause"] == "5.2"

    # Test renumbering when only chunk 2 is referenced
    text_single = "Every container must be marked properly [2]."
    renumbered, single_cits = CitationValidator.renumber_citations(text_single, sample_chunks)
    assert "[1]" in renumbered  # [2] was renumbered to [1]
    assert len(single_cits) == 1
    assert single_cits[0]["index"] == 1
    assert single_cits[0]["clause"] == "5.2"


def test_deterministic_llm_client(sample_chunks):
    """Verify local deterministic grounded response generation."""
    client = DeterministicLLMClient()

    # Normal generation with chunks
    resp_en = client.generate("Dummy prompt", query="pH limits", chunks=sample_chunks, language="en")
    assert "IS 14543:2016" in resp_en
    assert "[1]" in resp_en
    assert "[2]" in resp_en

    # Hindi generation
    resp_hi = client.generate("Dummy prompt", query="pH limits", chunks=sample_chunks, language="hi")
    assert "IS 14543:2016" in resp_hi
    assert "भारतीय मानक" in resp_hi

    # Empty chunks / uncertainty
    resp_empty = client.generate("Dummy prompt", chunks=[], language="en")
    assert "I could not find verified BIS information" in resp_empty


def test_gemini_llm_client_fallback_without_key(sample_chunks):
    """Verify Gemini client falls back gracefully to deterministic synthesizer when no API key is present."""
    with patch.dict("os.environ", {}, clear=True):
        client = GeminiLLMClient(api_key=None)
        resp = client.generate("Prompt", chunks=sample_chunks)
        assert "IS 14543:2016" in resp
        assert "[1]" in resp


def test_response_synthesizer_clarification():
    """Verify vague query triggers clarification request with proper schema."""
    synthesizer = ResponseSynthesizer()
    vague_query = "water"

    payload = synthesizer.synthesize(vague_query)

    assert isinstance(payload, AIResponsePayload)
    assert payload.response_text is not None  # Required contract key
    assert payload.needs_clarification is True
    assert len(payload.clarification_questions) > 0
    assert payload.citations == []


def test_response_synthesizer_out_of_scope():
    """Verify out-of-scope query generates polite domain refusal with follow-ups."""
    synthesizer = ResponseSynthesizer()
    query = "What is the weather in Delhi today?"

    payload = synthesizer.synthesize(query)

    assert payload.intent == QueryIntent.OUT_OF_SCOPE.value
    assert payload.needs_clarification is False
    assert "Bureau of Indian Standards" in payload.response_text
    assert len(payload.follow_up_suggestions) > 0
    assert payload.citations == []


def test_response_synthesizer_insufficient_evidence():
    """Verify Stage 6a Insufficient Evidence path generates uncertainty message."""
    synthesizer = ResponseSynthesizer()
    evidence = EvidenceContext(
        query="Unicorn certification",
        is_sufficient=False,
        selected_chunks=[],
        fallback_message="I could not find verified BIS information on this topic in the knowledge base.",
    )

    payload = synthesizer.synthesize("Unicorn certification", evidence=evidence)

    assert "I could not find verified BIS information" in payload.response_text
    assert payload.citations == []
    assert len(payload.follow_up_suggestions) > 0


def test_response_synthesizer_end_to_end_grounded():
    """Verify complete grounded generation matching all backend contract requirements."""
    synthesizer = ResponseSynthesizer()
    from ai.src.retrieval.hybrid import RetrievalResult

    r1 = RetrievalResult(
        chunk_id="chk-1",
        score=0.95,
        content="The water shall conform to the chemical requirements. The pH value shall be between 6.5 and 8.5.",
        standard_number="IS 14543:2016",
        document_title="Packaged Drinking Water",
        section_title="Requirements",
        clause="4.2",
    )
    r2 = RetrievalResult(
        chunk_id="chk-2",
        score=0.88,
        content="Every container shall be marked with the BIS Standard Mark and licensee details.",
        standard_number="IS 14543:2016",
        document_title="Packaged Drinking Water",
        section_title="Marking",
        clause="5.2",
    )

    evidence = EvidenceContext(
        query="What is the pH for packaged drinking water?",
        is_sufficient=True,
        selected_chunks=[r1, r2],
    )

    payload = synthesizer.synthesize(
        query="What is the pH for packaged drinking water?",
        evidence=evidence,
    )

    # 1. Mandatory contract fields
    assert payload.response_text != ""
    assert "[1]" in payload.response_text
    assert payload.intent in [QueryIntent.STANDARD_QUERY.value, QueryIntent.TESTING_REQUIREMENTS.value, QueryIntent.GENERAL_BIS.value]
    assert payload.needs_clarification is False
    assert payload.clarification_questions == []
    assert len(payload.citations) > 0
    assert payload.citations[0]["index"] == 1
    assert payload.citations[0]["standard_id"] == "IS 14543:2016"
    assert "snippet" in payload.citations[0]
    assert len(payload.follow_up_suggestions) > 0
    assert "processing_time_ms" in payload.metadata
