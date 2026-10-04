"""
Comprehensive Multilingual Hindi & Technical Term Preservation Test Suite — BIS Intelligent Assistant
Validates Phase 12 requirements:
- Script & language detection (Devanagari vs English vs Romanized Hindi)
- Technical term preservation (Indian Standards, clauses, schemes, acronyms)
- Cross-lingual query translation & concept enrichment
- Hindi entity extraction & vagueness handling
- Grounded Hindi LLM generation with inline citations [1], [2]
- End-to-end pipeline and FastAPI endpoint execution
"""

import pytest
from fastapi.testclient import TestClient

from ai.src.multilingual.detector import LanguageDetector
from ai.src.multilingual.preserver import TermPreserver
from ai.src.multilingual.translator import QueryTranslator
from ai.src.multilingual.localization import HindiLocalization
from ai.src.understanding.entities import EntityExtractor
from ai.src.understanding.analyzer import QueryAnalyzer
from ai.src.understanding.intent import QueryIntent
from ai.src.generation.llm import DeterministicLLMClient
from ai.src.models.knowledge import BISChunk
from ai.src.service.pipeline import BISPipeline
from ai.src.service.api import app


# 1. Language Detection Tests
def test_language_detector_devanagari_and_english():
    # Pure Devanagari
    assert LanguageDetector.detect_language("क्या पैकेज्ड पानी के लिए BIS लाइसेंस चाहिए?") == "hi"
    assert LanguageDetector.detect_language("IS 14543 में pH मान क्या है?") == "hi"

    # English
    assert LanguageDetector.detect_language("What is the pH limit for packaged water in IS 14543?") == "en"
    assert LanguageDetector.detect_language("How do I apply for Scheme-I ISI Mark?") == "en"

    # Romanized Hindi / Hinglish heuristics
    assert LanguageDetector.detect_language("kya packaged water ke liye bis anivarya hai?") == "hi"

    # Explicit override
    assert LanguageDetector.detect_language("What are the standards?", requested_language="hi") == "hi"
    assert LanguageDetector.detect_language("IS 14543 details", requested_language="en") == "en"


# 2. Technical Term Preservation Tests
def test_term_preserver_restores_canonical_standards():
    # Standards restoration
    sample_text = (
        "आधिकारिक भारतीय मानक आईएस 14543 और आई.एस. 302-2-3 के अनुसार, "
        "क्लॉज 4.2 तथा धारा 5.1 में आवश्यकताएं दी गई हैं। "
        "स्कीम-1 और बीआईएस द्वारा आईएसआई मार्क प्रदान किया जाता है। "
        "सारणी 1 में रासायनिक सीमाएं हैं।"
    )

    canonical = TermPreserver.ensure_canonical_terms(sample_text)

    assert "IS 14543" in canonical
    assert "IS 302-2-3" in canonical
    assert "Clause 4.2" in canonical
    assert "Clause 5.1" in canonical
    assert "Scheme-I" in canonical
    assert "BIS" in canonical
    assert "ISI Mark" in canonical
    assert "Table 1" in canonical


def test_term_preserver_devanagari_digits():
    text_with_hindi_digits = "मानक संख्या आईएस १४५४३"
    canonical = TermPreserver.ensure_canonical_terms(text_with_hindi_digits)
    assert canonical == "मानक संख्या IS 14543"


def test_term_preserver_verification():
    valid_text = "According to IS 14543 and Clause 4.2, the water must be tested."
    is_ok, missing = TermPreserver.verify_preservation(valid_text, ["IS 14543"])
    assert is_ok is True
    assert missing == []

    invalid_text = "According to standard rules, the water must be tested."
    is_ok, missing = TermPreserver.verify_preservation(invalid_text, ["IS 14543"])
    assert is_ok is False
    assert "IS 14543" in missing


# 3. Cross-Lingual Query Translation Tests
def test_query_translator_maps_hindi_to_english_retrieval():
    hindi_query = "बोतलबंद पानी के लिए pH मान क्या है?"
    translated = QueryTranslator.to_retrieval_query(hindi_query)

    assert "packaged drinking water" in translated.lower()
    assert "ph value" in translated.lower()
    assert "IS 14543" in translated

    iron_query = "बिजली की इस्त्री के लिए सुरक्षा परीक्षण और तापमान"
    translated_iron = QueryTranslator.to_retrieval_query(iron_query)

    assert "electric iron" in translated_iron.lower()
    assert "IS 302-2-3" in translated_iron
    assert "safety" in translated_iron.lower()


# 4. Entity Extractor Hindi Support Tests
def test_entity_extractor_hindi_support():
    query = "मुझे घरेलू बिजली की इस्त्री और आईएस 302-2-3 के बारे में जानकारी चाहिए"
    entities = EntityExtractor.extract(query)

    assert "IS 302-2-3" in entities.standard_numbers
    assert "electric iron" in entities.product_mentions
    assert entities.attributes.get("intended_use") == "domestic"

    water_query = "पैकेज्ड ड्रिंकिंग वॉटर और आईएस 14543"
    water_entities = EntityExtractor.extract(water_query)

    assert "IS 14543" in water_entities.standard_numbers
    assert "packaged drinking water" in water_entities.product_mentions


# 5. Query Analyzer Hindi Clarification and Refusal Tests
def test_query_analyzer_hindi_clarification_flow():
    # Vague Hindi query
    vague_query = "मैं उत्पाद बनाता हूँ और मुझे लाइसेंस चाहिए"
    result = QueryAnalyzer.analyze(vague_query)

    assert result.intent == QueryIntent.CLARIFICATION_NEEDED
    assert result.needs_clarification is True
    assert result.response_preview == HindiLocalization.CLARIFICATION_PREVIEW
    assert result.clarification_questions == HindiLocalization.CLARIFICATION_QUESTIONS
    assert result.follow_up_suggestions == HindiLocalization.CLARIFICATION_FOLLOW_UPS


def test_query_analyzer_hindi_out_of_scope_flow():
    out_of_scope = "आज का मौसम कैसा रहेगा और बारिश कब होगी?"
    result = QueryAnalyzer.analyze(out_of_scope)

    assert result.intent == QueryIntent.OUT_OF_SCOPE
    assert result.needs_clarification is False
    assert result.response_preview == HindiLocalization.OUT_OF_SCOPE_PREVIEW
    assert result.follow_up_suggestions == HindiLocalization.OUT_OF_SCOPE_FOLLOW_UPS


# 6. Deterministic LLM Hindi Generation Tests
def test_deterministic_llm_hindi_generation_with_citations():
    client = DeterministicLLMClient()
    chunk = BISChunk(
        chunk_id="is14543-cl4-2",
        chunk_index=0,
        document_id="is-14543-2016",
        standard_number="IS 14543",
        document_title="Packaged Drinking Water Specification",
        section_title="Requirements",
        clause="4.2",
        content="The pH of packaged drinking water shall be between 6.5 and 8.5 when tested in accordance with IS 3025.",
    )

    response = client.generate(
        prompt="Synthesize response",
        query="बोतलबंद पानी का pH मान क्या होना चाहिए?",
        chunks=[chunk],
        language="hi",
    )

    assert "IS 14543" in response
    assert "[1]" in response
    assert "Clause 4.2" in response
    assert "आधिकारिक भारतीय मानक" in response


# 7. End-to-End Pipeline Multilingual Execution
def test_pipeline_end_to_end_hindi_query():
    pipeline = BISPipeline()
    query = "बोतलबंद पानी के लिए pH मान क्या निर्धारित है?"

    payload = pipeline.run(query=query, language="hi")

    # Contract adherence
    assert payload.response_text is not None
    assert len(payload.response_text) > 20
    assert "[1]" in payload.response_text
    assert ("IS 14543" in payload.response_text or any("IS 14543" in c.get("standard_id", "") for c in payload.citations))
    assert len(payload.citations) > 0
    assert payload.citations[0]["index"] == 1
    assert payload.citations[0]["standard_id"].startswith("IS 14543")
    assert payload.needs_clarification is False
    assert len(payload.follow_up_suggestions) > 0


# 8. FastAPI /query Endpoint Multilingual Test
def test_fastapi_multilingual_hindi_endpoint():
    client = TestClient(app)
    response = client.post(
        "/query",
        json={
            "query": "क्या पैकेज्ड ड्रिंकिंग वॉटर के लिए BIS ISI मार्क अनिवार्य है?",
            "language": "hi",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "response_text" in data
    assert "citations" in data
    assert "IS 14543" in data["response_text"]
    assert data["metadata"]["query_language"] == "hi"
