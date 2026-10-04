"""
Intent Taxonomy and Classifier — BIS Intelligent Assistant Understanding Engine
Classifies user queries into standard BIS intents per docs/ai/AI_PIPELINE.md Stage 2.
"""

from __future__ import annotations

import re
from enum import Enum
from typing import List, Pattern


class QueryIntent(str, Enum):
    """Canonical intent taxonomy matching AI_PIPELINE.md Stage 2 and backend types.ts."""
    PRODUCT_DISCOVERY = "PRODUCT_DISCOVERY"
    STANDARD_QUERY = "STANDARD_QUERY"
    CERTIFICATION_GUIDANCE = "CERTIFICATION_GUIDANCE"
    TESTING_REQUIREMENTS = "TESTING_REQUIREMENTS"
    LAB_DISCOVERY = "LAB_DISCOVERY"
    HALLMARKING = "HALLMARKING"
    CONSUMER_QUERY = "CONSUMER_QUERY"
    CLAUSE_EXPLANATION = "CLAUSE_EXPLANATION"
    GENERAL_BIS = "GENERAL_BIS"
    CLARIFICATION_NEEDED = "CLARIFICATION_NEEDED"
    OUT_OF_SCOPE = "OUT_OF_SCOPE"


class IntentClassifier:
    """
    Pattern-matching and keyword-based intent classifier.
    Fast, deterministic, and maps cleanly to the backend intent taxonomy.
    """

    # Non-BIS out-of-scope signatures (English & Hindi)
    OUT_OF_SCOPE_PATTERNS = [
        re.compile(r"\b(?:weather|forecast|rain|temperature today|climate in|मौसम|आज का मौसम|बारिश)\b", re.IGNORECASE),
        re.compile(r"\b(?:recipe|cook|baking|movie|cricket|football|sports score|रेसिपी|खाना बनाना|फिल्म|क्रिकेट|मैच)\b", re.IGNORECASE),
        re.compile(r"\b(?:who won|president of|capital of|tell me a joke|चुटकुला|राजधानी)\b", re.IGNORECASE),
        re.compile(r"\b(?:write python code|javascript loop|write a poem|कविता|कंप्यूटर प्रोग्राम)\b", re.IGNORECASE),
    ]

    # Specific BIS intent pattern signatures (ordered by specificity)
    INTENT_RULES: List[tuple[QueryIntent, Pattern]] = [
        # 1. Hallmarking
        (
            QueryIntent.HALLMARKING,
            re.compile(r"\b(?:hallmark|hallmarking|gold purity|silver purity|karat|carat|jewellery purity|huid|हॉलमार्किंग|हॉलमार्क|सोने की शुद्धता|कैरेट)\b", re.IGNORECASE),
        ),
        # 2. Clause Explanation
        (
            QueryIntent.CLAUSE_EXPLANATION,
            re.compile(r"\b(?:clause\s+\d+|what does clause|explain clause|section\s+\d+\.\d+|क्लॉज|धारा\s+\d+|खंड\s+\d+)\b", re.IGNORECASE),
        ),
        # 3. Laboratory Discovery
        (
            QueryIntent.LAB_DISCOVERY,
            re.compile(r"\b(?:testing lab|recognized lab|laboratories|where can i test|test center|accredited lab|प्रयोगशाला|परीक्षण केंद्र|लैब)\b", re.IGNORECASE),
        ),
        # 4. Standard Query (Direct lookup of an IS number)
        (
            QueryIntent.STANDARD_QUERY,
            re.compile(r"\b(?:what is is\s+\d+|scope of is\s+\d+|tell me about is\s+\d+|^is\s+\d+|मानक\s+(?:संख्या\s+)?is\s+\d+)\b", re.IGNORECASE),
        ),
        # 5. Product Discovery (Manufacturer asking what standard applies to a product)
        (
            QueryIntent.PRODUCT_DISCOVERY,
            re.compile(r"\b(?:which\s+(?:indian\s+)?standard|what\s+(?:indian\s+)?standard|standard(?:s)?\s+applies?|applicable standard|standards?\s+for|i\s+(?:manufacture|produce|make)|qco for|mandatory for|कौन सा मानक|किस मानक|मानक लागू होता|उत्पाद बनाता)\b", re.IGNORECASE),
        ),
        # 6. Testing Requirements
        (
            QueryIntent.TESTING_REQUIREMENTS,
            re.compile(r"\b(?:testing|tests\b|test\s+method|test\s+procedure|sampling\s+method|microbiological|chemical\s+limits?|परीक्षण|जांच आवश्यकताएं|रासायनिक सीमाएं|पीएच)\b", re.IGNORECASE),
        ),
        # 7. Certification Guidance
        (
            QueryIntent.CERTIFICATION_GUIDANCE,
            re.compile(r"\b(?:how to apply|certification process|licence|license|scheme-?i|scheme-?1|scheme-?ii|scheme-?2|crs registration|isi mark application|fees for licence|प्रमाणन प्रक्रिया|लाइसेंस कैसे|आवेदन कैसे|योजना-1)\b", re.IGNORECASE),
        ),
        # 8. Consumer Query
        (
            QueryIntent.CONSUMER_QUERY,
            re.compile(r"\b(?:check\s+(?:if\s+)?(?:the\s+)?(?:bis|isi)\s+mark|verify\s+(?:the\s+)?(?:licence|license|mark|isi)|is\s+authentic|authentic|fake\s+mark|complaint|bis\s+care\s+app|सत्यापन|नकली|असली|शिकायत)\b", re.IGNORECASE),
        ),
    ]

    @classmethod
    def classify(cls, query: str) -> QueryIntent:
        """
        Classifies user query text into a canonical QueryIntent.
        """
        q = query.strip()
        if not q:
            return QueryIntent.CLARIFICATION_NEEDED

        # 1. Check Out of Scope patterns
        for pattern in cls.OUT_OF_SCOPE_PATTERNS:
            if pattern.search(q):
                return QueryIntent.OUT_OF_SCOPE

        # 2. Check BIS-specific intent patterns
        for intent, pattern in cls.INTENT_RULES:
            if pattern.search(q):
                return intent

        # 3. Default fallback
        return QueryIntent.GENERAL_BIS
