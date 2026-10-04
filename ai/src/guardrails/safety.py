"""
Safety Guardrails & Compliance Disclaimers — BIS Intelligent Assistant
Enforces Rule 10 (Safety and Trust Rules) from docs/ai/AI_RULES.md.
Ensures the AI never makes legally binding compliance declarations.
"""

from __future__ import annotations

import re
from typing import Tuple


STATUTORY_DISCLAIMER = (
    "*Disclaimer: Guidance provided by this assistant is for informational purposes based on available BIS standards. "
    "It does not constitute a statutory compliance certificate, legal declaration, or official BIS clearance. "
    "Manufacturers must verify requirements with the Bureau of Indian Standards on https://manakonline.in.*"
)


class SafetyFilter:
    """
    Screens response text to prevent unauthorized compliance declarations and attaches statutory notices.
    """

    COMPLIANCE_DECLARATION_PATTERNS = [
        re.compile(r"\b(?:your\s+product\s+is\s+(?:fully\s+)?compliant)\b", re.IGNORECASE),
        re.compile(r"\b(?:this\s+(?:guarantees|certifies)\s+legal\s+compliance)\b", re.IGNORECASE),
        re.compile(r"\b(?:you\s+are\s+legally\s+cleared\s+to\s+sell)\b", re.IGNORECASE),
    ]

    @classmethod
    def sanitize_response(cls, text: str) -> Tuple[str, bool]:
        """
        Scans response text. If a strict compliance claim was made, softens it and appends statutory disclaimer.
        Returns (modified_text, was_modified).
        """
        was_modified = False
        cleaned = text

        for pattern in cls.COMPLIANCE_DECLARATION_PATTERNS:
            if pattern.search(cleaned):
                cleaned = pattern.sub(
                    "your product specifications appear aligned with the cited standard parameters (subject to BIS testing and inspection)",
                    cleaned,
                )
                was_modified = True

        # Ensure statutory disclaimer is present if not already appended
        if "Disclaimer:" not in cleaned and "disclaimer:" not in cleaned.lower():
            cleaned = f"{cleaned.rstrip()}\n\n{STATUTORY_DISCLAIMER}"
            was_modified = True

        return cleaned, was_modified
