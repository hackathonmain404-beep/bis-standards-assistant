"""
Automated Unit Tests for BIS Document Ingestion Pipeline
Verifies Phase 3 Acceptance Criteria AC-1 through AC-6.
"""

from pathlib import Path
import pytest

from ai.src.ingestion.cleaner import TextCleaner
from ai.src.ingestion.chunker import ClauseParser, HierarchicalChunker
from ai.src.ingestion.pipeline import IngestionPipeline
from ai.src.models.knowledge import DocumentType, DocumentStatus


def test_text_cleaner_normalizes_and_strips_noise():
    """Verify that TextCleaner converts smart quotes, strips page numbers, and collapses newlines."""
    messy_text = (
        "IS 14543:2016  \t  \n"
        "Page 1 of 12\n"
        "“Packaged Drinking Water” — ‘Requirements’\n\n\n\n"
        "The water shall be clear.   "
    )
    cleaned = TextCleaner.clean(messy_text)

    # Quotes should be converted to straight quotes
    assert '"Packaged Drinking Water"' in cleaned
    assert "'Requirements'" in cleaned
    # Page artifact should be removed
    assert "Page 1 of 12" not in cleaned
    # Consecutive newlines collapsed to 2
    assert "\n\n\n" not in cleaned
    assert "The water shall be clear." in cleaned


def test_clause_parser_detects_sections_and_clauses():
    """Verify that ClauseParser identifies section headers and individual numbered clauses."""
    sample = (
        "1. SCOPE\n"
        "1.1 This standard prescribes requirements for drinking water.\n"
        "1.2 Water shall be derived from potable sources.\n\n"
        "4. REQUIREMENTS\n"
        "4.1 Hygienic premises:\n"
        "Premises shall conform to guidelines."
    )
    clauses = ClauseParser.parse_clauses(sample)

    assert len(clauses) == 3
    assert clauses[0].section_title == "1. SCOPE"
    assert clauses[0].clause_number == "1.1"
    assert "prescribes requirements" in clauses[0].content

    assert clauses[1].section_title == "1. SCOPE"
    assert clauses[1].clause_number == "1.2"

    assert clauses[2].section_title == "4. REQUIREMENTS"
    assert clauses[2].clause_number == "4.1"


def test_hierarchical_chunker_preserves_clauses_and_metadata():
    """Verify that HierarchicalChunker attaches denormalized metadata and does not break clauses."""
    sample = (
        "4. REQUIREMENTS\n"
        "4.2 Physical and Chemical Requirements:\n"
        "The pH value shall be between 6.5 and 8.5. Total dissolved solids shall not exceed 500 mg/l."
    )
    chunker = HierarchicalChunker(target_chunk_size=500, max_chunk_size=1000)
    chunks = chunker.chunk_document(
        text=sample,
        document_id="doc-test-14543",
        standard_number="IS 14543:2016",
        document_title="Packaged Drinking Water Specification",
        product_categories=["packaged_water"],
    )

    assert len(chunks) == 1
    chunk = chunks[0]
    assert chunk.standard_number == "IS 14543:2016"
    assert chunk.document_title == "Packaged Drinking Water Specification"
    assert chunk.clause == "4.2"
    assert chunk.section_title == "4. REQUIREMENTS"
    assert "pH value shall be between 6.5 and 8.5" in chunk.content
    assert chunk.char_count > 0


def test_chunk_citation_compatibility():
    """Verify that chunks produced by the chunker generate backend-compatible citations."""
    sample = (
        "8. PROTECTION AGAINST ACCESS TO LIVE PARTS\n"
        "8.1 Appliances shall be constructed and enclosed so that there is adequate protection."
    )
    chunker = HierarchicalChunker()
    chunks = chunker.chunk_document(
        text=sample,
        document_id="doc-is-302-2-3",
        standard_number="IS 302 (Part 2/Sec 3):2007",
        document_title="Electric Irons Safety Requirements",
    )

    assert len(chunks) == 1
    citation = chunks[0].to_citation_dict(index=1)

    assert citation["index"] == 1
    assert citation["standard_id"] == "IS 302 (Part 2/Sec 3):2007"
    assert citation["clause"] == "8.1"
    assert citation["section"] == "8. PROTECTION AGAINST ACCESS TO LIVE PARTS"
    assert "adequate protection" in citation["snippet"]
    assert citation["source_document_id"] == "doc-is-302-2-3"


def test_ingestion_pipeline_end_to_end(tmp_path: Path):
    """Verify end-to-end ingestion from raw file to saved processed JSON artifact."""
    raw_file = Path("d:/bis/ai/data/raw/is_14543_sample.txt")
    assert raw_file.exists(), "Raw sample file must exist"

    pipeline = IngestionPipeline()
    doc, chunks = pipeline.process_file_and_save(
        input_filepath=raw_file,
        output_dir=tmp_path,
        document_id="doc-is-14543-test",
        title="Packaged Drinking Water — Specification",
        standard_number="IS 14543:2016",
        document_type=DocumentType.INDIAN_STANDARD,
        year="2016",
        product_categories=["packaged_water", "food_and_agriculture"],
    )

    assert doc.document_id == "doc-is-14543-test"
    assert doc.standard_number == "IS 14543:2016"
    assert doc.total_chunks == len(chunks)
    assert len(chunks) >= 5, "Expected at least 5 clauses in the sample"

    # Verify output JSON artifact was created
    expected_output_json = tmp_path / "doc-is-14543-test_chunks.json"
    assert expected_output_json.exists()
    content = expected_output_json.read_text(encoding="utf-8")
    assert "IS 14543:2016" in content
    assert "doc-is-14543-test" in content


def test_seed_standards_pipeline_ingestion():
    """Verify that both seed standard files in data/raw can be processed cleanly to data/processed."""
    raw_dir = Path("d:/bis/ai/data/raw")
    processed_dir = Path("d:/bis/ai/data/processed")

    pipeline = IngestionPipeline()

    # 1. Ingest IS 14543
    doc_water, chunks_water = pipeline.process_file_and_save(
        input_filepath=raw_dir / "is_14543_sample.txt",
        output_dir=processed_dir,
        document_id="doc-is-14543-2016",
        title="Packaged Drinking Water (Other Than Packaged Natural Mineral Water) — Specification",
        standard_number="IS 14543:2016",
        document_type=DocumentType.INDIAN_STANDARD,
        year="2016",
        product_categories=["food_and_agriculture", "packaged_water"],
    )
    assert doc_water.total_chunks > 0
    assert (processed_dir / "doc-is-14543-2016_chunks.json").exists()

    # 2. Ingest IS 302
    doc_iron, chunks_iron = pipeline.process_file_and_save(
        input_filepath=raw_dir / "is_302_2_3_sample.txt",
        output_dir=processed_dir,
        document_id="doc-is-302-2-3-2007",
        title="Safety of Household and Similar Electrical Appliances — Particular Requirements: Electric Irons",
        standard_number="IS 302 (Part 2/Sec 3):2007",
        document_type=DocumentType.INDIAN_STANDARD,
        year="2007",
        product_categories=["electrical_appliances"],
    )
    assert doc_iron.total_chunks > 0
    assert (processed_dir / "doc-is-302-2-3-2007_chunks.json").exists()
