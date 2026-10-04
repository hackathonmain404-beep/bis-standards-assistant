"""
Technical Term Preservation Engine — BIS Intelligent Assistant Multilingual Module
Strictly enforces docs/ai/AI_PIPELINE.md:
"Standard numbers, clause numbers, scheme names, and technical BIS terminology must NEVER be translated.
They must appear as-is in any language."
"""

from __future__ import annotations

import re
from typing import List, Tuple


class TermPreserver:
    """
    Enforces canonical alphanumeric preservation for Indian Standards, clauses, and schemes.
    """

    # Devanagari transliteration normalizations
    DEVANAGARI_REPLACEMENTS = [
        # Standard designations
        (re.compile(r"(?:आई\.?\s*एस\.?|आईएस)\s*(\d+)", re.IGNORECASE), r"IS \1"),
        # Clauses / Sections / Tables
        (re.compile(r"(?:क्लॉज|क्लौज|खंड|धारा)\s*(\d+(?:\.\d+)*)", re.IGNORECASE), r"Clause \1"),
        (re.compile(r"(?:तालिका|सारणी)\s*(\d+)", re.IGNORECASE), r"Table \1"),
        # Scheme designations
        (re.compile(r"(?:स्कीम|योजना)\s*[-–—]?\s*(?:१|1|I|i)\b", re.IGNORECASE), r"Scheme-I"),
        (re.compile(r"(?:स्कीम|योजना)\s*[-–—]?\s*(?:२|2|II|ii)\b", re.IGNORECASE), r"Scheme-II"),
        (re.compile(r"(?:स्कीम|योजना)\s*[-–—]?\s*(?:४|4|IV|iv)\b", re.IGNORECASE), r"Scheme-IV"),
        (re.compile(r"\bसीआरएस\b|\bसी\.?आर\.?एस\.?\b", re.IGNORECASE), r"CRS"),
        (re.compile(r"\bएफएमसीएस\b", re.IGNORECASE), r"FMCS"),
        # BIS / ISI Mark / QCO
        (re.compile(r"\bबीआईएस\b|\bबी\.?आई\.?एस\.?\b", re.IGNORECASE), r"BIS"),
        (re.compile(r"\bआईएसआई\s*मार्क\b|\bआई\.?एस\.?आई\.?\s*मार्क\b", re.IGNORECASE), r"ISI Mark"),
        (re.compile(r"\bक्यूसीओ\b|\bक्यू\.?सी\.?ओ\.?\b", re.IGNORECASE), r"QCO"),
    ]

    # Devanagari digits to ASCII digits
    DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")

    @classmethod
    def normalize_devanagari_digits(cls, text: str) -> str:
        """Converts any Devanagari numerals (०-९) to standard Arabic numerals (0-9)."""
        return text.translate(cls.DEVANAGARI_DIGITS)

    @classmethod
    def ensure_canonical_terms(cls, text: str) -> str:
        """
        Post-processes generated text to ensure all transliterated or mistranslated
        standards, clauses, schemes, and acronyms are restored to their canonical English forms.
        """
        # Step 1: Normalize any Devanagari digits
        result = cls.normalize_devanagari_digits(text)

        # Step 2: Apply canonical regex replacements
        for pattern, replacement in cls.DEVANAGARI_REPLACEMENTS:
            result = pattern.sub(replacement, result)

        return result

    @classmethod
    def verify_preservation(cls, response_text: str, expected_standards: List[str]) -> Tuple[bool, List[str]]:
        """
        Verifies that expected standard numbers appear intact in the response.
        Returns (is_preserved, missing_standards).
        """
        missing: List[str] = []
        normalized_text = cls.ensure_canonical_terms(response_text)

        for std in expected_standards:
            std_clean = std.strip()
            if not std_clean:
                continue
            # Pattern matching standard code e.g. "IS 14543" or "IS 302-2-3"
            escaped = re.escape(std_clean)
            if not re.search(escaped, normalized_text, re.IGNORECASE):
                missing.append(std_clean)

        return (len(missing) == 0, missing)
