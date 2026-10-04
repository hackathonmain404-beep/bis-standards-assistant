"""
Cross-Lingual Query Translator & Concept Mapper — BIS Intelligent Assistant Multilingual Module
Transforms Hindi/Hinglish domain queries into enriched English search representations
so that English-language standards documents can be accurately retrieved.
Follows docs/ai/AI_PIPELINE.md Multilingual Handling (Stage 2-3).
"""

from __future__ import annotations

import re
from typing import Dict, List, Tuple

from ai.src.multilingual.preserver import TermPreserver


class QueryTranslator:
    """
    Translates and concept-maps Hindi query keywords into technical English retrieval terms.
    """

    # Domain vocabulary mapping from Hindi (Devanagari / Romanized) to English retrieval keywords
    DOMAIN_CONCEPT_MAP: List[Tuple[re.Pattern, str]] = [
        # Products
        (re.compile(r"(?:पैकेज्ड\s*ड्रिंकिंग\s*वॉटर|पैकेज्ड\s*वॉटर|बोतलबंद\s*पानी|पीने\s*का\s*पानी|मिनरल\s*वाटर|paani|pani)", re.IGNORECASE), "packaged drinking water IS 14543"),
        (re.compile(r"(?:इलेक्ट्रिक\s*आयरन|बिजली\s*की\s*इस्त्री|बिजली\s*का\s*प्रेस|इस्त्री|iron|istri)", re.IGNORECASE), "electric iron IS 302-2-3"),
        (re.compile(r"(?:पोर्टलैंड\s*सीमेंट|सीमेंट|cement)", re.IGNORECASE), "portland cement IS 269"),
        (re.compile(r"(?:टीएमटी\s*बार्स?|स्टील\s*बार्स?|सरिया|steel\s*bars?)", re.IGNORECASE), "high strength deformed steel bars IS 1786"),
        (re.compile(r"(?:सोने\s*के\s*आभूषण|सोना|हॉलमार्किंग|स्वर्ण|gold\s*jewelry|hallmark)", re.IGNORECASE), "hallmarking gold jewelry IS 1417"),

        # Technical Parameters & Tests
        (re.compile(r"(?:पीएच\s*मान|पीएच\s*स्तर|पीएच|ph\s*value|ph)", re.IGNORECASE), "pH value limits Table 1"),
        (re.compile(r"(?:टीडीएस|कुल\s*घुलित\s*ठोस|tds)", re.IGNORECASE), "total dissolved solids TDS"),
        (re.compile(r"(?:सूक्ष्मजैविक|माइक्रोबायोलॉजिकल|रोगाणु|जीवाणु|microbiological)", re.IGNORECASE), "microbiological parameters"),
        (re.compile(r"(?:सुरक्षा\s*आवश्यकताएं|सुरक्षा\s*नियम|सुरक्षा|safety)", re.IGNORECASE), "safety requirements"),
        (re.compile(r"(?:तापमान|थर्मोस्टेट|temperature|thermostat)", re.IGNORECASE), "temperature thermostat heating"),
        (re.compile(r"(?:परीक्षण|जांच|टेस्ट|testing|test)", re.IGNORECASE), "testing procedures requirements"),

        # Regulatory & Schemes
        (re.compile(r"(?:अनिवार्य|ज़रूरी|लाज़मी|mandatory|compulsory)", re.IGNORECASE), "mandatory Quality Control Order QCO"),
        (re.compile(r"(?:प्रमाणन|लाइसेंस|अनुज्ञप्ति|certification|license)", re.IGNORECASE), "certification Scheme-I ISI Mark"),
        (re.compile(r"(?:मानक\s*नंबर|मानक|standard)", re.IGNORECASE), "Indian Standard"),
        (re.compile(r"(?:प्रयोगशाला|लैब|laboratory|lab)", re.IGNORECASE), "laboratory testing"),
    ]

    @classmethod
    def to_retrieval_query(cls, query: str) -> str:
        """
        Builds an enriched English retrieval query from a Hindi / mixed query.
        Preserves standard numbers in canonical alphanumeric form (e.g., 'IS 14543').
        """
        # 1. Normalize Devanagari standard notations (e.g. 'आईएस 14543' -> 'IS 14543')
        normalized = TermPreserver.ensure_canonical_terms(query)

        # 2. Extract any standard numbers already in the query
        standards = re.findall(r"\bIS\s*\d+(?:-\d+)*(?:\s*\([^\)]+\))*", normalized, re.IGNORECASE)

        # 3. Match concepts and collect English search tokens
        matched_tokens: List[str] = []
        for pattern, english_tokens in cls.DOMAIN_CONCEPT_MAP:
            if pattern.search(normalized):
                matched_tokens.append(english_tokens)

        # If no domain concepts were matched, keep standard numbers and clean ASCII characters
        if not matched_tokens:
            ascii_words = re.findall(r"[A-Za-z0-9\-]+", normalized)
            if ascii_words:
                return " ".join(ascii_words)
            return normalized

        # Combine standards, matched English concepts, and ASCII terms
        query_parts: List[str] = []
        if standards:
            query_parts.extend(standards)
        query_parts.extend(matched_tokens)

        # Deduplicate while preserving order
        seen = set()
        deduped: List[str] = []
        for part in " ".join(query_parts).split():
            low = part.lower()
            if low not in seen:
                seen.add(low)
                deduped.append(part)

        return " ".join(deduped)
