"""
Automated Unit Tests for Query Understanding Subsystem
Verifies Phase 6 Acceptance Criteria AC-1 through AC-6.
"""

import pytest

from ai.src.understanding.intent import QueryIntent, IntentClassifier
from ai.src.understanding.entities import EntityExtractor
from ai.src.understanding.analyzer import QueryAnalyzer


def test_intent_classifier_taxonomy():
    """Verify that IntentClassifier accurately maps common queries to their canonical intent."""
    cases = [
        ("I manufacture electric steam irons. Which standard applies?", QueryIntent.PRODUCT_DISCOVERY),
        ("What is IS 14543?", QueryIntent.STANDARD_QUERY),
        ("What chemical and microbiological tests are required?", QueryIntent.TESTING_REQUIREMENTS),
        ("How to apply for an ISI mark licence under Scheme I?", QueryIntent.CERTIFICATION_GUIDANCE),
        ("Where can I find accredited testing laboratories?", QueryIntent.LAB_DISCOVERY),
        ("What are the gold hallmarking HUID guidelines?", QueryIntent.HALLMARKING),
        ("How do I check if the BIS mark on my bottle is authentic?", QueryIntent.CONSUMER_QUERY),
        ("What does clause 4.2 mean?", QueryIntent.CLAUSE_EXPLANATION),
        ("What is the weather in Delhi today?", QueryIntent.OUT_OF_SCOPE),
        ("Who won the cricket world cup?", QueryIntent.OUT_OF_SCOPE),
    ]

    for query, expected_intent in cases:
        detected = IntentClassifier.classify(query)
        assert detected == expected_intent, f"For query '{query}', expected {expected_intent}, got {detected}"


def test_entity_extractor_standard_numbers():
    """Verify that EntityExtractor accurately identifies varied Indian Standard notations."""
    sample_text = (
        "We need compliance with IS 14543:2016 for drinking water, "
        "and our appliances must follow IS 302 (Part 2/Sec 3):2007 along with IS 10500."
    )
    entities = EntityExtractor.extract(sample_text)

    assert "IS 14543:2016" in entities.standard_numbers
    assert "IS 302 (Part 2/Sec 3):2007" in entities.standard_numbers
    assert "IS 10500" in entities.standard_numbers
    assert len(entities.standard_numbers) == 3


def test_entity_extractor_attributes_and_products():
    """Verify that EntityExtractor captures products, electrical ratings, clauses, and use."""
    query = (
        "I manufacture a domestic electric steam iron operating at 230V single-phase. "
        "Does Clause 8.1 require finger probe testing?"
    )
    entities = EntityExtractor.extract(query)

    assert "electric steam iron" in entities.product_mentions
    assert entities.attributes.get("voltage") == "230V"
    assert entities.attributes.get("intended_use") == "domestic"
    assert entities.attributes.get("phase") == "single-phase"
    assert "8.1" in entities.clause_references


def test_vague_query_clarification_trigger():
    """Verify that ambiguous or overly short prompts trigger CLARIFICATION_NEEDED."""
    vague_inputs = [
        "i make products",
        "i manufacture products",
        "need bis certificate",
        "products",
        "items",
    ]

    for q in vague_inputs:
        res = QueryAnalyzer.analyze(q)
        assert res.intent == QueryIntent.CLARIFICATION_NEEDED, f"Expected vague for '{q}', got {res.intent}"
        assert res.needs_clarification is True
        assert len(res.clarification_questions) >= 2
        assert len(res.follow_up_suggestions) > 0
        assert res.response_preview is not None


def test_out_of_scope_query_handling():
    """Verify that non-BIS queries route to OUT_OF_SCOPE and do not trigger clarification."""
    res = QueryAnalyzer.analyze("Can you give me a recipe for chocolate cookies?")

    assert res.intent == QueryIntent.OUT_OF_SCOPE
    assert res.needs_clarification is False
    assert res.response_preview is not None
    assert "specialized assistant for the Bureau of Indian Standards" in res.response_preview


def test_clear_query_does_not_trigger_clarification():
    """Verify that clear, specific queries proceed directly without requiring clarification."""
    res = QueryAnalyzer.analyze("Which Indian Standard applies to domestic electric steam irons at 230V?")

    assert res.intent == QueryIntent.PRODUCT_DISCOVERY
    assert res.needs_clarification is False
    assert len(res.clarification_questions) == 0
    assert "electric steam iron" in res.entities.product_mentions
    assert res.entities.attributes.get("voltage") == "230V"
    assert len(res.follow_up_suggestions) > 0
