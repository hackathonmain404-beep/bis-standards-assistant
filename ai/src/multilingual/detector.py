"""
Language Detection Engine — BIS Intelligent Assistant Multilingual Module
Identifies query language (English vs Hindi/Hinglish) and handles explicit language overrides.
Follows docs/ai/AI_PIPELINE.md Multilingual Handling and docs/ai/PROMPT_INTEGRATION.md.
"""

from __future__ import annotations

import re
from typing import Optional


class LanguageDetector:
    """
    Detects language of queries with Devanagari script detection and Hinglish heuristics.
    """

    # Unicode range for Devanagari script: U+0900 to U+097F
    DEVANAGARI_PATTERN = re.compile(r"[\u0900-\u097f]")

    # Common Romanized Hindi grammatical markers
    ROMANIZED_HINDI_PATTERNS = [
        r"\bkya\b",
        r"\bhai\b",
        r"\bhain\b",
        r"\bkaise\b",
        r"\bke\s+liye\b",
        r"\bchahiye\b",
        r"\bkarna\b",
        r"\bhoga\b",
        r"\bkaun\s+sa\b",
        r"\bkitna\b",
        r"\banivarya\b",
        r"\bpaani\b",
        r"\bpani\b",
        r"\bpeene\b",
    ]

    ROMANIZED_HINDI_REGEX = re.compile(
        "|".join(ROMANIZED_HINDI_PATTERNS),
        re.IGNORECASE,
    )

    @classmethod
    def detect_language(cls, query: str, requested_language: Optional[str] = None) -> str:
        """
        Determines the effective language code ('en' or 'hi').
        If requested_language is explicitly 'hi', it is honored.
        If requested_language is 'auto' or not provided (or default 'en' but query is in Hindi),
        script inspection is performed.
        """
        if requested_language:
            norm = requested_language.strip().lower()
            if norm in ("hi", "hindi"):
                return "hi"
            if norm in ("en", "english"):
                # If explicit English, check if text has significant Devanagari (user forgot to set lang)
                devanagari_count = len(cls.DEVANAGARI_PATTERN.findall(query))
                if devanagari_count >= 3:
                    return "hi"
                return "en"

        # Check for Devanagari script
        devanagari_matches = cls.DEVANAGARI_PATTERN.findall(query)
        if len(devanagari_matches) >= 2:
            return "hi"

        # Check for Romanized Hindi markers
        if cls.ROMANIZED_HINDI_REGEX.search(query):
            return "hi"

        return "en"

    @classmethod
    def is_devanagari(cls, text: str) -> bool:
        """Returns True if the text contains Devanagari characters."""
        return bool(cls.DEVANAGARI_PATTERN.search(text))
