"""
Automated Unit and Integration Tests for Hybrid Retrieval Engine
Verifies Phase 4 Acceptance Criteria AC-1 through AC-7.
"""

from pathlib import Path
import numpy as np
import pytest

from ai.src.ingestion.pipeline import IngestionPipeline
from ai.src.models.knowledge import BISChunk, ContentType, DocumentType
from ai.src.retrieval.bm25 import BM25Index
from ai.src.retrieval.embeddings import DeterministicEmbeddingProvider
from ai.src.retrieval.hybrid import HybridRetriever, RetrievalResult
from ai.src.retrieval.vector_store import VectorIndex


def test_deterministic_embedding_provider():
    """Verify that DeterministicEmbeddingProvider produces unit-normalized, deterministic vectors."""
    provider = DeterministicEmbeddingProvider(dimension=128)
    text = "Packaged drinking water must be safe from microbiological contamination."

    vec1 = provider.embed_text(text)
    vec2 = provider.embed_text(text)

    assert vec1.shape == (128,)
    assert np.allclose(vec1, vec2), "Embedding must be 100% deterministic"

    norm = np.linalg.norm(vec1)
    assert np.isclose(norm, 1.0, atol=1e-5), "Vectors must be L2 normalized to unit length"

    # Similar text should have higher cosine similarity than unrelated text
    similar_text = "Drinking water requires microbiological safety testing."
    unrelated_text = "Heavy duty structural steel plates for building construction."

    vec_sim = provider.embed_text(similar_text)
    vec_unrel = provider.embed_text(unrelated_text)

    sim_score = float(np.dot(vec1, vec_sim))
    unrel_score = float(np.dot(vec1, vec_unrel))

    assert sim_score > unrel_score, f"Expected {sim_score} > {unrel_score}"


def test_bm25_exact_code_matching():
    """Verify that BM25 accurately prioritizes exact Indian Standard numbers and clauses."""
    index = BM25Index()
    docs = [
        ("doc-water-scope", "IS 14543:2016 Clause 1.1 Specification for packaged drinking water"),
        ("doc-water-chem", "IS 14543:2016 Clause 4.2 Chemical requirements and pH limits"),
        ("doc-iron-safety", "IS 302 (Part 2/Sec 3):2007 Clause 8.1 Protection against live parts"),
    ]
    index.add_documents(docs)

    hits = index.search("IS 14543 pH limits", top_k=2)
    assert len(hits) > 0
    top_doc_id, score = hits[0]
    assert top_doc_id == "doc-water-chem", "Expected Clause 4.2 to rank first for pH query"
    assert score > 0


def test_vector_similarity_search():
    """Verify that VectorIndex retrieves semantically relevant items using cosine similarity."""
    provider = DeterministicEmbeddingProvider(dimension=128)
    vector_index = VectorIndex(dimension=128)

    doc_ids = ["chunk-1", "chunk-2"]
    texts = [
        "Thermostat temperature control for electric irons to prevent excessive heating.",
        "Microbiological sampling requirements for food and drinking water.",
    ]
    embeddings = provider.embed_batch(texts)
    vector_index.add_chunks(doc_ids, embeddings)

    query = "iron overheating thermostat"
    query_vec = provider.embed_text(query)

    results = vector_index.search(query_vec, top_k=1)
    assert len(results) == 1
    top_id, sim = results[0]
    assert top_id == "chunk-1"
    assert sim > 0


def test_hybrid_retriever_reciprocal_rank_fusion():
    """Verify that HybridRetriever merges lexical and vector rankings into RetrievalResult models."""
    retriever = HybridRetriever()

    chunks = [
        BISChunk(
            chunk_id="chk-iron-01",
            document_id="doc-iron",
            clause="8.1",
            content="Appliances shall be constructed so that testing finger probes cannot touch live parts.",
            chunk_index=0,
            standard_number="IS 302 (Part 2/Sec 3):2007",
            document_title="Electric Irons Safety",
            section_title="8. Protection Against Live Parts",
            product_categories=["electrical_appliances"],
        ),
        BISChunk(
            chunk_id="chk-water-01",
            document_id="doc-water",
            clause="4.2",
            content="Total dissolved solids (TDS) shall not exceed 500 mg/l in drinking water.",
            chunk_index=1,
            standard_number="IS 14543:2016",
            document_title="Packaged Drinking Water",
            section_title="4. Requirements",
            product_categories=["packaged_water"],
        ),
    ]

    retriever.index_chunks(chunks)

    results = retriever.search("finger probe live parts electric iron", top_k=1)
    assert len(results) == 1
    top_hit = results[0]
    assert isinstance(top_hit, RetrievalResult)
    assert top_hit.chunk_id == "chk-iron-01"
    assert top_hit.clause == "8.1"
    assert top_hit.standard_number == "IS 302 (Part 2/Sec 3):2007"
    assert top_hit.score == 1.0  # Normalized top score


def test_metadata_filtering():
    """Verify that metadata filtering strictly isolates results by standard number and category."""
    retriever = HybridRetriever()

    chunks = [
        BISChunk(
            chunk_id="chk-elec",
            document_id="doc-iron",
            clause="1.1",
            content="General safety requirements for electric dry irons.",
            chunk_index=0,
            standard_number="IS 302:2007",
            product_categories=["electrical_appliances"],
        ),
        BISChunk(
            chunk_id="chk-water",
            document_id="doc-water",
            clause="1.1",
            content="General safety requirements for packaged drinking water.",
            chunk_index=1,
            standard_number="IS 14543:2016",
            product_categories=["packaged_water", "food_and_agriculture"],
        ),
    ]

    retriever.index_chunks(chunks)

    # Search with generic term "safety requirements" but filter by category
    water_results = retriever.search("safety requirements", top_k=5, filter_category="packaged_water")
    assert len(water_results) == 1
    assert water_results[0].chunk_id == "chk-water"

    # Search with filter by standard number
    iron_results = retriever.search("safety requirements", top_k=5, filter_standard="IS 302")
    assert len(iron_results) == 1
    assert iron_results[0].chunk_id == "chk-elec"


def test_real_seed_corpus_retrieval():
    """
    Integration Test:
    Ingests authentic seed files (IS 14543 and IS 302) and verifies that
    real-world user questions retrieve the exact regulatory clauses.
    """
    raw_dir = Path("d:/bis/ai/data/raw")
    pipeline = IngestionPipeline()

    _, water_chunks = pipeline.process_text(
        raw_text=(raw_dir / "is_14543_sample.txt").read_text(encoding="utf-8"),
        document_id="doc-water",
        title="Packaged Drinking Water Specification",
        standard_number="IS 14543:2016",
        product_categories=["packaged_water", "food_and_agriculture"],
    )

    _, iron_chunks = pipeline.process_text(
        raw_text=(raw_dir / "is_302_2_3_sample.txt").read_text(encoding="utf-8"),
        document_id="doc-iron",
        title="Electric Irons Safety Requirements",
        standard_number="IS 302 (Part 2/Sec 3):2007",
        product_categories=["electrical_appliances"],
    )

    all_chunks = water_chunks + iron_chunks
    retriever = HybridRetriever()
    retriever.index_chunks(all_chunks)

    # Test Query 1: Water Chemical Limits
    q1 = "What are the chemical limits and pH requirements for packaged drinking water?"
    hits1 = retriever.search(q1, top_k=3)
    assert len(hits1) > 0
    assert hits1[0].standard_number == "IS 14543:2016"
    assert hits1[0].clause == "4.2", "Clause 4.2 (Physical and Chemical Requirements) must be #1"
    assert "pH value shall be between 6.5 and 8.5" in hits1[0].content

    # Test Query 2: Electric Iron Live Parts Protection
    q2 = "How to protect users from accidental contact with live electrical parts in irons?"
    hits2 = retriever.search(q2, top_k=3)
    assert len(hits2) > 0
    assert hits2[0].standard_number == "IS 302 (Part 2/Sec 3):2007"
    assert hits2[0].clause in ["8.1", "8.2"], "Live parts safety clause must rank #1"

    # Test Query 3: Thermostat Temperature Control
    q3 = "Thermostat temperature control for electric iron soleplate"
    hits3 = retriever.search(q3, top_k=3)
    assert len(hits3) > 0
    assert hits3[0].clause == "11.2", "Clause 11.2 (Heating / Thermostat) must rank #1"

    # Test Citation Export
    citation = hits1[0].to_citation_dict(index=1)
    assert citation["index"] == 1
    assert citation["standard_id"] == "IS 14543:2016"
    assert citation["clause"] == "4.2"
    assert "pH value" in citation["snippet"]
