"""
Unit Tests for BIS Knowledge Models and Citation Structures
Verifies Phase 2 Acceptance Criteria AC-1 through AC-5.
"""

import pytest
from pydantic import ValidationError

from ai.src.models.knowledge import (
    DocumentType,
    DocumentStatus,
    ProductCategory,
    ContentType,
    BISDocument,
    BISSection,
    BISClause,
    BISChunk,
)
from ai.src.models.citations import BISCitation


def test_valid_bis_document_creation():
    """Verify that a valid BISDocument object is created with correct metadata."""
    doc = BISDocument(
        document_id="doc-is-14543-2016",
        title="Packaged Drinking Water (Other Than Packaged Natural Mineral Water) — Specification",
        standard_number="IS 14543:2016",
        document_type=DocumentType.INDIAN_STANDARD,
        year="2016",
        status=DocumentStatus.CURRENT,
        subject_area="Food and Agriculture",
        product_categories=[ProductCategory.FOOD_AND_AGRICULTURE.value, "Packaged Water"],
        source="Bureau of Indian Standards",
        source_url="https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/14543",
    )

    assert doc.document_id == "doc-is-14543-2016"
    assert doc.standard_number == "IS 14543:2016"
    assert doc.document_type == DocumentType.INDIAN_STANDARD
    assert doc.status == DocumentStatus.CURRENT
    assert len(doc.product_categories) == 2


def test_bis_document_rejects_missing_title_or_source():
    """Ensure BISDocument raises ValidationError if title or source is omitted."""
    with pytest.raises(ValidationError):
        BISDocument(
            document_id="doc-invalid",
            title="",  # Empty string rejected by min_length=1
            source="BIS",
        )

    with pytest.raises(ValidationError):
        BISDocument(
            document_id="doc-invalid",
            title="Valid Title",
            source="",  # Empty source rejected
        )


def test_bis_document_standard_number_validation():
    """Ensure standard_number must follow BIS conventions (start with IS/QCO/Scheme)."""
    with pytest.raises(ValidationError) as exc_info:
        BISDocument(
            document_id="doc-bad-std",
            title="Random Specification",
            standard_number="XYZ-9999",  # Invalid standard prefix
            source="BIS",
        )
    assert "standard_number must typically begin with" in str(exc_info.value)


def test_bis_section_and_clause_hierarchy():
    """Verify that sections and clauses link back to their parent document."""
    sec = BISSection(
        section_id="sec-is-14543-4",
        document_id="doc-is-14543-2016",
        section_number="4",
        section_title="Requirements",
        level=1,
    )
    assert sec.section_id == "sec-is-14543-4"
    assert sec.document_id == "doc-is-14543-2016"
    assert sec.level == 1

    clause = BISClause(
        clause_id="cl-is-14543-4-2",
        document_id="doc-is-14543-2016",
        section_id=sec.section_id,
        clause_number="4.2",
        clause_title="Chemical Requirements",
        content="The water shall conform to the chemical limits prescribed in Table 1.",
        standard_number="IS 14543:2016",
    )
    assert clause.clause_id == "cl-is-14543-4-2"
    assert clause.section_id == "sec-is-14543-4"
    assert clause.clause_number == "4.2"


def test_bis_chunk_provenance_and_char_count():
    """Verify that BISChunk computes character count and retains complete provenance."""
    sample_text = "The water shall be clear and free from undesirable odor, taste, and color."
    chunk = BISChunk(
        chunk_id="chk-is-14543-001",
        document_id="doc-is-14543-2016",
        section_id="sec-is-14543-4",
        clause_id="cl-is-14543-4-2",
        clause="4.2",
        content=sample_text,
        content_type=ContentType.TEXT,
        chunk_index=0,
        standard_number="IS 14543:2016",
        document_title="Packaged Drinking Water",
        section_title="4. Requirements",
        product_categories=["food_and_agriculture"],
    )

    assert chunk.char_count == len(sample_text)
    assert chunk.standard_number == "IS 14543:2016"
    assert chunk.clause == "4.2"


def test_bis_chunk_to_citation_dict_matches_backend_contract():
    """
    Critical contract test:
    Verify that BISChunk.to_citation_dict outputs the exact dictionary
    structure required by backend/src/types.ts CitationItem.
    """
    chunk = BISChunk(
        chunk_id="chk-is-302-2-3-001",
        document_id="doc-is-302-2-3",
        clause="1.1",
        content="This standard deals with the safety of electric dry irons and steam irons for household use.",
        chunk_index=1,
        standard_number="IS 302 (Part 2/Sec 3):2007",
        document_title="Electric Irons Safety Requirements",
        section_title="1. Scope",
    )

    citation_dict = chunk.to_citation_dict(index=1)

    assert citation_dict["index"] == 1
    assert citation_dict["standard_id"] == "IS 302 (Part 2/Sec 3):2007"
    assert citation_dict["document_title"] == "Electric Irons Safety Requirements"
    assert citation_dict["section"] == "1. Scope"
    assert citation_dict["clause"] == "1.1"
    assert "safety of electric dry irons" in citation_dict["snippet"]
    assert citation_dict["source_document_id"] == "doc-is-302-2-3"


def test_biscitation_model_enforces_positive_index():
    """Verify that citations enforce 1-based indexing (index >= 1) per backend rules."""
    with pytest.raises(ValidationError):
        BISCitation(
            index=0,  # 0 is invalid (citations must be 1-based [1], [2]...)
            standard_id="IS 14543:2016",
        )

    valid_citation = BISCitation(
        index=1,
        standard_id="IS 14543:2016",
        document_title="Packaged Drinking Water",
        clause="4.2",
    )
    assert valid_citation.index == 1
    backend_dict = valid_citation.to_backend_dict()
    assert backend_dict["index"] == 1
    assert backend_dict["standard_id"] == "IS 14543:2016"


def test_models_are_frozen_immutable():
    """Ensure models cannot be mutated after creation (preserves data integrity)."""
    doc = BISDocument(
        document_id="doc-immutable",
        title="Frozen Document",
        source="BIS",
    )
    with pytest.raises(ValidationError):
        doc.title = "Modified Title"  # Mutating frozen model must fail


def test_json_roundtrip_serialization():
    """Verify that models can serialize to JSON and deserialize back with zero data loss."""
    original = BISDocument(
        document_id="doc-json-test",
        title="Test Serialization",
        standard_number="IS 10500:2012",
        source="BIS",
    )
    json_str = original.model_dump_json()
    reconstructed = BISDocument.model_validate_json(json_str)

    assert reconstructed.document_id == original.document_id
    assert reconstructed.standard_number == original.standard_number
    assert reconstructed.title == original.title
