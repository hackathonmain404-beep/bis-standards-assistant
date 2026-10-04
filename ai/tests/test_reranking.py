"""
Automated Unit Tests for Evidence Selection and Reranking Subsystem
Verifies Phase 5 Acceptance Criteria AC-1 through AC-7.
"""

from pathlib import Path
import pytest

from ai.src.ingestion.pipeline import IngestionPipeline
from ai.src.retrieval.hybrid import HybridRetriever, RetrievalResult
from ai.src.reranking.scorer import RelevanceScorer
from ai.src.reranking.selector import EvidenceSelector, EvidenceContext


def test_relevance_scorer_boosts_term_and_standard_matches():
    """Verify that RelevanceScorer provides alignment boost when standard code or keywords match."""
    scorer = RelevanceScorer()

    candidate = RetrievalResult(
        chunk_id="chk-1",
        score=0.5,
        content="The water shall conform to chemical limits and pH requirements between 6.5 and 8.5.",
        standard_number="IS 14543:2016",
        clause="4.2",
        section_title="4. Requirements",
        document_title="Packaged Drinking Water",
    )

    # Query with exact standard code and matching terms
    query_exact = "What are the pH limits under IS 14543:2016?"
    score_exact = scorer.score_candidate(query_exact, candidate)

    # Query with generic irrelevant terms
    query_irrelevant = "Can you recommend a certified mechanical steel bolt?"
    score_irrelevant = scorer.score_candidate(query_irrelevant, candidate)

    assert score_exact > score_irrelevant
    assert score_exact > 0.60, f"Expected strong match score, got {score_exact}"


def test_evidence_selector_threshold_filtering():
    """Verify that EvidenceSelector filters out chunks with relevance score below min_threshold."""
    selector = EvidenceSelector(min_threshold=0.40)

    candidates = [
        RetrievalResult(
            chunk_id="chk-good",
            score=0.85,
            content="Testing finger probes shall not touch live parts in electric irons.",
            standard_number="IS 302",
            clause="8.1",
        ),
        RetrievalResult(
            chunk_id="chk-bad",
            score=0.15,
            content="Unrelated paragraph about agricultural seeds and fertilizers.",
            standard_number="IS 9999",
            clause="1.1",
        ),
    ]

    context = selector.select_evidence("electric iron live parts testing finger", candidates)

    assert context.is_sufficient is True
    assert len(context.selected_chunks) == 1
    assert context.selected_chunks[0].chunk_id == "chk-good"
    assert context.dropped_chunks_count == 1


def test_insufficient_evidence_path_activation():
    """Verify that Stage 6a Insufficient Evidence is triggered when no candidates pass threshold."""
    selector = EvidenceSelector(min_threshold=0.40)

    # Candidates that have no relation to the query
    candidates = [
        RetrievalResult(
            chunk_id="chk-weak-1",
            score=0.10,
            content="Marking requirements for cement packaging bags.",
            standard_number="IS 269",
        ),
        RetrievalResult(
            chunk_id="chk-weak-2",
            score=0.12,
            content="Sampling methodology for structural steel rods.",
            standard_number="IS 2062",
        ),
    ]

    context = selector.select_evidence("how to bake a sourdough bread at home", candidates)

    assert context.is_sufficient is False
    assert len(context.selected_chunks) == 0
    assert context.fallback_message is not None
    assert "could not find verified BIS information" in context.fallback_message
    assert context.formatted_prompt_block == ""


def test_deduplication_removes_identical_content():
    """Verify that near-duplicate chunks are removed while different clauses are preserved."""
    selector = EvidenceSelector(min_threshold=0.30)

    candidates = [
        RetrievalResult(
            chunk_id="chk-orig",
            score=0.90,
            content="The soleplate temperature shall be controlled by a reliable thermostat conforming to IS 302-1.",
            clause="11.2",
            standard_number="IS 302",
        ),
        RetrievalResult(
            chunk_id="chk-dup",
            score=0.85,
            content="The soleplate temperature shall be controlled by a reliable thermostat conforming to IS 302-1.",
            clause="11.2",  # Identical clause and content
            standard_number="IS 302",
        ),
        RetrievalResult(
            chunk_id="chk-distinct-clause",
            score=0.75,
            content="Appliances and surroundings shall not attain excessive temperature in normal use.",
            clause="11.1",  # Different clause
            standard_number="IS 302",
        ),
    ]

    context = selector.select_evidence("soleplate thermostat temperature", candidates)

    assert len(context.selected_chunks) == 2
    clause_numbers = [c.clause for c in context.selected_chunks]
    assert "11.2" in clause_numbers
    assert "11.1" in clause_numbers
    assert context.dropped_chunks_count == 1


def test_budget_fitting_limits_chunks_and_characters():
    """Verify that EvidenceSelector enforces max_chunks and max_total_chars."""
    selector = EvidenceSelector(min_threshold=0.20, max_chunks=2, max_total_chars=500)

    candidates = [
        RetrievalResult(
            chunk_id=f"chk-{i}",
            score=0.90 - (i * 0.05),
            content=f"Clause {i} requirements content description paragraph for testing.",
            clause=f"1.{i}",
        )
        for i in range(5)
    ]

    context = selector.select_evidence("requirements content", candidates)

    assert len(context.selected_chunks) <= 2
    total_chars = sum(len(c.content) for c in context.selected_chunks)
    assert total_chars <= 500


def test_format_prompt_block_compliance():
    """Verify that formatted prompt text matches docs/ai/PROMPT_INTEGRATION.md specification."""
    chunks = [
        RetrievalResult(
            chunk_id="chk-water",
            score=0.95,
            content="Water shall conform to chemical limits in Table 1.",
            standard_number="IS 14543:2016",
            document_title="Packaged Drinking Water",
            section_title="4. Requirements",
            clause="4.2",
        ),
        RetrievalResult(
            chunk_id="chk-hygiene",
            score=0.80,
            content="Premises shall conform to hygienic guidelines.",
            standard_number="IS 14543:2016",
            document_title="Packaged Drinking Water",
            section_title="4. Requirements",
            clause="4.1",
        ),
    ]

    prompt_text = EvidenceSelector.format_prompt_block(chunks)

    assert "=== EVIDENCE ===" in prompt_text
    assert "=== END EVIDENCE ===" in prompt_text
    assert "EVIDENCE [1]:" in prompt_text
    assert "Source: IS 14543:2016 — Packaged Drinking Water" in prompt_text
    assert "Clause: 4.2" in prompt_text
    assert "EVIDENCE [2]:" in prompt_text
    assert "Clause: 4.1" in prompt_text
    assert "INSTRUCTION: Base your answer ONLY on the evidence above." in prompt_text


def test_end_to_end_retrieval_to_evidence_selection():
    """Integration Test: Full pipeline from raw file ingestion -> retrieval -> evidence selection."""
    raw_dir = Path("d:/bis/ai/data/raw")
    pipeline = IngestionPipeline()

    _, water_chunks = pipeline.process_text(
        raw_text=(raw_dir / "is_14543_sample.txt").read_text(encoding="utf-8"),
        document_id="doc-water",
        title="Packaged Drinking Water Specification",
        standard_number="IS 14543:2016",
        product_categories=["packaged_water"],
    )

    retriever = HybridRetriever()
    retriever.index_chunks(water_chunks)

    # 1. Search for drinking water chemical limits
    query = "What are the chemical limits and pH requirements for packaged drinking water?"
    raw_hits = retriever.search(query, top_k=6)

    # 2. Select evidence
    selector = EvidenceSelector(min_threshold=0.35, max_chunks=3)
    evidence_ctx = selector.select_evidence(query, raw_hits)

    assert evidence_ctx.is_sufficient is True
    assert len(evidence_ctx.selected_chunks) > 0
    # Top evidence should be Clause 4.2
    assert evidence_ctx.selected_chunks[0].clause == "4.2"
    assert "pH value shall be between 6.5 and 8.5" in evidence_ctx.selected_chunks[0].content
    assert "=== EVIDENCE ===" in evidence_ctx.formatted_prompt_block
    assert "EVIDENCE [1]:" in evidence_ctx.formatted_prompt_block
