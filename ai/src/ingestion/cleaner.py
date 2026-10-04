"""
Text Cleaner — BIS Intelligent Assistant Ingestion Engine
Normalizes raw textual documents extracted from Indian Standards and BIS publications.
Follows docs/ai/AI_PIPELINE.md Stage 1 and docs/ai/RAG_DATA_SCHEMA.md.
"""

from __future__ import annotations

import re
import unicodedata


class TextCleaner:
    """
    Cleans and normalizes raw text extracted from PDFs or text sources.
    Preserves section, clause, and paragraph boundaries while stripping noise.
    """

    # Regex patterns for common OCR / PDF extraction artifacts
    PAGE_NUMBER_PATTERN = re.compile(r"^\s*(?:Page|PAGE)\s+\d+(?:\s+of\s+\d+)?\s*$", re.IGNORECASE | re.MULTILINE)
    STANDARDS_HEADER_PATTERN = re.compile(r"^\s*IS\s+\d+.*?(?:Bureau of Indian Standards|MANAK BHAVAN).*?$", re.IGNORECASE | re.MULTILINE)
    MULTIPLE_SPACES_PATTERN = re.compile(r"[ \t]+")
    MULTIPLE_NEWLINES_PATTERN = re.compile(r"\n{3,}")

    # Standard Unicode character normalizations
    UNICODE_REPLACEMENTS = {
        "\u2018": "'",   # Left single quote
        "\u2019": "'",   # Right single quote
        "\u201c": '"',   # Left double quote
        "\u201d": '"',   # Right double quote
        "\u2013": "-",   # En dash
        "\u2014": "-",   # Em dash
        "\u2022": "*",   # Bullet point
        "\u00a0": " ",   # Non-breaking space
        "\ufeff": "",    # Byte order mark
    }

    @classmethod
    def clean(cls, text: str) -> str:
        """
        Executes complete text normalization pipeline:
        1. Unicode normalization (NFKC)
        2. Known symbol replacement
        3. Stripping recurring header/page artifacts
        4. Whitespace and newline consolidation
        """
        if not text:
            return ""

        # Step 1: Unicode NFKC normalization
        normalized = unicodedata.normalize("NFKC", text)

        # Step 2: Replace curly quotes, long dashes, and odd spaces
        for char, replacement in cls.UNICODE_REPLACEMENTS.items():
            normalized = normalized.replace(char, replacement)

        # Step 3: Strip recurring header / page artifacts
        normalized = cls.PAGE_NUMBER_PATTERN.sub("", normalized)
        normalized = cls.STANDARDS_HEADER_PATTERN.sub("", normalized)

        # Step 4: Line-by-line whitespace cleanup
        lines = [cls.MULTIPLE_SPACES_PATTERN.sub(" ", line).strip() for line in normalized.splitlines()]

        # Recombine lines
        recombined = "\n".join(lines)

        # Step 5: Collapse 3+ consecutive newlines into 2 (preserves paragraph breaks)
        cleaned = cls.MULTIPLE_NEWLINES_PATTERN.sub("\n\n", recombined).strip()

        return cleaned
