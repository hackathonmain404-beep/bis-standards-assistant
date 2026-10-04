"""
Query Analyzer Orchestrator — BIS Intelligent Assistant Understanding Engine
Combines Intent Classification, Entity Extraction, and Clarification Logic.
Follows docs/ai/AI_PIPELINE.md Stage 2 and docs/ai/AI_RULES.md Section 5.
"""

from __future__ import annotations

import re
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from ai.src.understanding.intent import QueryIntent, IntentClassifier
from ai.src.understanding.entities import ExtractedEntities, EntityExtractor


from ai.src.multilingual.detector import LanguageDetector
from ai.src.multilingual.localization import HindiLocalization


class QueryAnalysisResult(BaseModel):
    """
    Complete analysis of a user query.
    Directly provides the intent and clarification fields for the backend API contract.
    """
    model_config = ConfigDict(frozen=True, extra="forbid")

    intent: QueryIntent = Field(..., description="Classified intent")
    needs_clarification: bool = Field(default=False, description="True if query is too vague to search accurately")
    entities: ExtractedEntities = Field(default_factory=ExtractedEntities, description="Extracted standard codes and products")
    clarification_questions: List[str] = Field(default_factory=list, description="Targeted questions if clarification is needed")
    follow_up_suggestions: List[str] = Field(default_factory=list, description="Clickable recommended next questions")
    response_preview: Optional[str] = Field(None, description="Immediate response text for special intents (clarification/out-of-scope)")


class QueryAnalyzer:
    """
    Analyzes queries, detects vagueness, and routes appropriately.
    """

    # Vague generic terms that trigger clarification when no specific product or standard is named
    VAGUE_GENERIC_TERMS = [
        "i make products",
        "i manufacture products",
        "i make items",
        "i produce goods",
        "i want certification",
        "i want bis certification",
        "need bis certificate",
        "bis certification",
        "how to get isi",
        "how to get bis",
        "what are the standards",
        "standards for my product",
        "compliance requirements",
        # Hindi vague phrases
        "मैं उत्पाद बनाता हूँ",
        "मैं सामान बनाता हूँ",
        "मुझे लाइसेंस चाहिए",
        "मुझे सर्टिफिकेट चाहिए",
        "प्रमाणन आवश्यकताएं",
        "मेरे उत्पाद के लिए मानक",
        "बीआईएस प्रमाणन",
        "आईएसआई मार्क कैसे प्राप्त करें",
    ]

    VAGUE_WORDS_PATTERN = re.compile(r"^\s*(?:products?|items?|goods?|appliances?|certificate|certification|licence|standards?|सामान|उत्पाद)\s*$", re.IGNORECASE)

    @classmethod
    def analyze(cls, query: str, language: Optional[str] = None) -> QueryAnalysisResult:
        """
        Orchestrates full query understanding pipeline with multilingual awareness.
        """
        cleaned_query = query.strip()
        effective_lang = LanguageDetector.detect_language(cleaned_query, language)
        is_hindi = (effective_lang == "hi")

        # 1. Extract entities first
        entities = EntityExtractor.extract(cleaned_query)

        # 2. Check for Ambiguity / Vagueness
        is_vague = cls._is_query_vague(cleaned_query, entities)

        if is_vague:
            if is_hindi:
                return QueryAnalysisResult(
                    intent=QueryIntent.CLARIFICATION_NEEDED,
                    needs_clarification=True,
                    entities=entities,
                    clarification_questions=HindiLocalization.CLARIFICATION_QUESTIONS,
                    follow_up_suggestions=HindiLocalization.CLARIFICATION_FOLLOW_UPS,
                    response_preview=HindiLocalization.CLARIFICATION_PREVIEW,
                )
            return QueryAnalysisResult(
                intent=QueryIntent.CLARIFICATION_NEEDED,
                needs_clarification=True,
                entities=entities,
                clarification_questions=[
                    "What specific type or intended use of your product (e.g., packaged drinking water, electric steam iron)?",
                    "Is the product intended for domestic, commercial, or industrial applications?",
                ],
                follow_up_suggestions=[
                    "I manufacture household electrical appliances",
                    "I produce packaged drinking water",
                    "What are the major BIS mandatory certification schemes?",
                ],
                response_preview=(
                    "To help you identify the applicable Indian Standards and certification requirements, "
                    "could you clarify the specific product type, intended use, or operating voltage?"
                ),
            )

        # 3. Classify Intent
        intent = IntentClassifier.classify(cleaned_query)

        # 4. Handle Out of Scope
        if intent == QueryIntent.OUT_OF_SCOPE:
            if is_hindi:
                return QueryAnalysisResult(
                    intent=QueryIntent.OUT_OF_SCOPE,
                    needs_clarification=False,
                    entities=entities,
                    clarification_questions=[],
                    follow_up_suggestions=HindiLocalization.OUT_OF_SCOPE_FOLLOW_UPS,
                    response_preview=HindiLocalization.OUT_OF_SCOPE_PREVIEW,
                )
            return QueryAnalysisResult(
                intent=QueryIntent.OUT_OF_SCOPE,
                needs_clarification=False,
                entities=entities,
                clarification_questions=[],
                follow_up_suggestions=[
                    "Which Indian Standards are mandatory under QCOs?",
                    "How do I search for a product standard on BIS?",
                ],
                response_preview=(
                    "I am a specialized assistant for the Bureau of Indian Standards (BIS). "
                    "I can answer questions regarding Indian Standards, certification schemes, testing requirements, "
                    "and hallmarking. Could you please rephrase your query in the context of BIS standards?"
                ),
            )

        # 5. Normal In-Scope Query: generate contextual follow-up suggestions
        suggestions = cls._generate_suggestions(intent, entities, is_hindi=is_hindi)

        return QueryAnalysisResult(
            intent=intent,
            needs_clarification=False,
            entities=entities,
            clarification_questions=[],
            follow_up_suggestions=suggestions,
            response_preview=None,
        )

    @classmethod
    def _is_query_vague(cls, query: str, entities: ExtractedEntities) -> bool:
        """
        Determines whether a query lacks enough specificity to retrieve standard clauses.
        """
        q_lower = query.lower().strip()

        # If user explicitly specified a standard number (e.g., "IS 14543"), it is never vague
        if entities.standard_numbers:
            return False

        # Extremely short prompts (e.g., "items", "help")
        if len(q_lower) < 8 or cls.VAGUE_WORDS_PATTERN.match(q_lower):
            return True

        # Matches recognized vague phrases without specific products
        if not entities.product_mentions:
            for phrase in cls.VAGUE_GENERIC_TERMS:
                if phrase in q_lower or q_lower == phrase:
                    return True

        return False

    @staticmethod
    def _generate_suggestions(intent: QueryIntent, entities: ExtractedEntities, is_hindi: bool = False) -> List[str]:
        """Generates smart follow-up suggestions based on intent, entities, and language."""
        if is_hindi:
            if intent == QueryIntent.PRODUCT_DISCOVERY:
                if "water" in " ".join(entities.product_mentions):
                    return [
                        "IS 14543 के तहत कौन से रासायनिक परीक्षण अनिवार्य हैं?",
                        "पैकेज्ड पानी के लिए ISI Mark लाइसेंस कैसे प्राप्त करें?",
                        "पानी के परीक्षण के लिए कौन सी मान्यता प्राप्त प्रयोगशालाएं हैं?",
                    ]
                if "iron" in " ".join(entities.product_mentions):
                    return [
                        "IS 302-2-3 के तहत इलेक्ट्रिक आयरन के लिए सुरक्षा परीक्षण क्या हैं?",
                        "क्या इलेक्ट्रिक आयरन के लिए प्रमाणन QCO के तहत अनिवार्य है?",
                        "इलेक्ट्रिक आयरन के थर्मोस्टेट की क्या आवश्यकताएं हैं?",
                    ]
                return [
                    "इस उत्पाद के लिए कौन सी परीक्षण सुविधाएं आवश्यक हैं?",
                    "Scheme-I के तहत BIS लाइसेंस के लिए आवेदन कैसे करें?",
                    "क्या इस मानक को लागू करने वाले Quality Control Orders (QCO) हैं?",
                ]
            if intent == QueryIntent.TESTING_REQUIREMENTS:
                return [
                    "इन परीक्षणों के लिए BIS द्वारा मान्यता प्राप्त प्रयोगशालाएं कौन सी हैं?",
                    "मानक के तहत नमूनाकरण (sampling) प्रक्रिया क्या है?",
                    "अनुपालन के लिए स्वीकृति मानदंड क्या हैं?",
                ]
            if intent == QueryIntent.CERTIFICATION_GUIDANCE:
                return [
                    "Scheme-I के लिए आवेदन करने हेतु कौन से दस्तावेज़ आवश्यक हैं?",
                    "Scheme-I (ISI Mark) और Scheme-II (CRS) में क्या अंतर है?",
                    "BIS लाइसेंस प्राप्त करने में औसतन कितना समय लगता है?",
                ]
            if intent == QueryIntent.HALLMARKING:
                return [
                    "सोने के आभूषणों के लिए मान्यता प्राप्त शुद्धता ग्रेड क्या हैं?",
                    "उपभोक्ता BIS Care ऐप पर HUID नंबर कैसे सत्यापित कर सकते हैं?",
                ]
            return [
                "घरेलू बिजली के उपकरणों पर कौन सा मानक लागू होता है?",
                "BIS लाइसेंस असली है या नहीं, यह कैसे जांचें?",
            ]

        if intent == QueryIntent.PRODUCT_DISCOVERY:
            if "water" in " ".join(entities.product_mentions):
                return [
                    "What chemical limits and testing are required under IS 14543?",
                    "How do I apply for an ISI mark licence for packaged water?",
                    "Which recognized laboratories test drinking water?",
                ]
            if "iron" in " ".join(entities.product_mentions):
                return [
                    "What safety testing is required under IS 302 for electric irons?",
                    "Is certification for electric irons mandatory under a QCO?",
                    "What are the thermostat requirements for electric irons?",
                ]
            return [
                "What testing facilities are required for this product?",
                "How do I apply for a BIS licence under Scheme I?",
                "Are there Quality Control Orders (QCO) enforcing this standard?",
            ]

        if intent == QueryIntent.TESTING_REQUIREMENTS:
            return [
                "Which laboratories are recognized by BIS for these tests?",
                "What sampling procedures are mandated?",
                "What are the acceptance criteria for compliance?",
            ]

        if intent == QueryIntent.CERTIFICATION_GUIDANCE:
            return [
                "What documents are required to apply for Scheme I?",
                "What is the difference between Scheme I (ISI mark) and Scheme II (CRS)?",
                "What is the average timeline for obtaining a BIS licence?",
            ]

        if intent == QueryIntent.HALLMARKING:
            return [
                "What are the recognized purity grades for gold jewellery?",
                "How can a consumer verify HUID numbers on BIS Care app?",
            ]

        return [
            "Which standard applies to domestic electrical appliances?",
            "How do I verify if a BIS licence is authentic?",
        ]
