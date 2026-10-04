"""
Unit and Integration Tests for Product → Standard Recommendation Engine
Validates QCO registry lookups, attribute compatibility analysis, companion standards,
insufficient/unsupported product handling, and regulatory disclaimers.
"""

from unittest.mock import MagicMock
import pytest

from ai.src.recommendation.qco_registry import (
    ApplicableScheme,
    ProductStandardRecord,
    QCORegistry,
)
from ai.src.recommendation.engine import (
    ProductRecommendationEngine,
    ProductRecommendationResult,
    MANDATORY_REGULATORY_DISCLAIMER,
)
from ai.src.understanding.entities import ExtractedEntities, EntityExtractor
from ai.src.models.knowledge import BISChunk


def test_qco_registry_basic_lookups():
    """Verify registry lookups by canonical name, alias, and standard number."""
    # 1. Alias lookup: electric steam iron
    iron_record = QCORegistry.find_by_product_name("electric steam iron")
    assert iron_record is not None
    assert iron_record.product_id == "electric_iron"
    assert "IS 302" in iron_record.primary_standard
    assert iron_record.is_mandatory is True
    assert iron_record.scheme == ApplicableScheme.SCHEME_I_ISI
    assert "IS 302-1:2008" in iron_record.related_standards

    # 2. Alias lookup: bottled water
    water_record = QCORegistry.find_by_product_name("bottled water")
    assert water_record is not None
    assert water_record.product_id == "packaged_drinking_water"
    assert "IS 14543" in water_record.primary_standard

    # 3. Standard number lookup
    match_by_num = QCORegistry.find_by_standard_number("IS 14543:2016")
    assert match_by_num is not None
    assert match_by_num.product_id == "packaged_drinking_water"


def test_recommendation_engine_electric_iron_with_voltage():
    """Verify recommendation generation and voltage verification for 230V household electric iron."""
    engine = ProductRecommendationEngine()
    query = "I manufacture electric steam irons for household use at 230V, what standard applies?"

    result = engine.recommend(query)

    assert result.found is True
    assert result.product_identified == "Electric Iron (Dry / Steam)"
    assert result.confidence_score >= 0.85
    assert len(result.recommendations) >= 2  # Primary + IS 302-1 companion

    primary = result.recommendations[0]
    assert primary.is_primary is True
    assert "IS 302 (Part 2/Sec 3):2007" in primary.standard_number
    assert primary.is_mandatory is True
    assert "Electrical Appliances (Quality Control) Order" in (primary.qco_details or "")
    assert "230V is within permissible limit" in primary.attribute_fit.get("voltage", "")

    companion = result.recommendations[1]
    assert companion.is_primary is False
    assert "IS 302-1:2008" in companion.standard_number

    assert result.regulatory_disclaimer == MANDATORY_REGULATORY_DISCLAIMER
    assert len(result.suggested_next_steps) > 0


def test_recommendation_engine_voltage_out_of_scope_warning():
    """Verify that exceeding rated voltage limits flags a clear scope warning."""
    engine = ProductRecommendationEngine()
    query = "Electric iron rated at 440V three-phase"

    result = engine.recommend(query)

    assert result.found is True
    primary = result.recommendations[0]
    assert "out_of_scope_warning" in primary.attribute_fit
    assert "exceeds standard scope" in primary.attribute_fit["voltage"]
    assert result.confidence_score <= 0.60


def test_recommendation_engine_packaged_drinking_water():
    """Verify recommendation for packaged drinking water."""
    engine = ProductRecommendationEngine()
    query = "What BIS standard is required to sell packaged drinking water bottles?"

    result = engine.recommend(query)

    assert result.found is True
    assert result.product_identified == "Packaged Drinking Water (Other than Natural Mineral Water)"
    primary = result.recommendations[0]
    assert "IS 14543:2016" in primary.standard_number
    assert primary.scheme == "Scheme-I (ISI Mark)"
    assert primary.is_mandatory is True
    assert any("manakonline" in step.lower() for step in result.suggested_next_steps)


def test_unsupported_product_graceful_fallback():
    """Verify that unknown/unsupported products fail gracefully with no hallucinations."""
    engine = ProductRecommendationEngine()
    query = "What Indian standard applies to cryogenic rocket propellant injectors?"

    result = engine.recommend(query)

    assert result.found is False
    assert result.product_identified is None
    assert len(result.recommendations) == 0
    assert result.confidence_score == 0.0
    assert len(result.suggested_next_steps) > 0
    # Must point user to official BIS portal
    assert any("bis.gov.in" in step or "manakonline" in step for step in result.suggested_next_steps)


def test_retriever_scope_clause_enrichment():
    """Verify that when a retriever is provided, live scope clauses are resolved."""
    mock_retriever = MagicMock()
    mock_chunk = BISChunk(
        chunk_id="IS_302_2_3_C1_1",
        document_id="IS_302_2_3_2007",
        chunk_index=0,
        standard_number="IS 302 (Part 2/Sec 3):2007",
        section_title="Scope",
        clause="1.1",
        content="This standard deals with the safety of electric dry irons and steam irons...",
        char_count=80,
    )
    mock_result = MagicMock()
    mock_result.chunk = mock_chunk
    mock_retriever.retrieve.return_value = [mock_result]

    engine = ProductRecommendationEngine(retriever=mock_retriever)
    query = "Electric iron standards"

    result = engine.recommend(query)

    assert result.found is True
    primary = result.recommendations[0]
    assert any("Clause 1.1" in cl for cl in primary.matched_scope_clauses)
