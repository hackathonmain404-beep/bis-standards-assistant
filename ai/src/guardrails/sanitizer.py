"""
Input Sanitizer & Prompt Injection Detector — BIS Intelligent Assistant
Protects the AI engine against oversized inputs, control characters, script tags,
and prompt injection attempts matching docs/ai/AI_RULES.md Section 9.
"""

from __future__ import annotations

import html
import re
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SanitizationResult(BaseModel):
    """Result of running input sanitization and security checks."""
    model_config = ConfigDict(frozen=True, extra="forbid")

    sanitized_query: str = Field(..., description="Cleaned, safe query string")
    is_injection_attempt: bool = Field(False, description="Whether prompt injection patterns were detected")
    was_truncated: bool = Field(False, description="Whether query was truncated to max allowed length")
    warning: Optional[str] = Field(None, description="Diagnostic warning message if any")


class InputSanitizer:
    """
    Sanitizes user input queries before pipeline execution.
    """

    MAX_QUERY_CHARS: int = 2000

    INJECTION_PATTERNS = [
        re.compile(r"\b(?:ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?)\b", re.IGNORECASE),
        re.compile(r"\b(?:disregard\s+(?:all\s+)?(?:previous|prior)\s+rules?)\b", re.IGNORECASE),
        re.compile(r"\b(?:you\s+are\s+now\s+(?:DAN|unrestricted|jailbroken))\b", re.IGNORECASE),
        re.compile(r"\b(?:system\s+prompt\s+reveal|output\s+system\s+prompt|show\s+your\s+initial\s+instructions)\b", re.IGNORECASE),
        re.compile(r"\b(?:drop\s+all\s+rules|bypass\s+all\s+filters|jailbreak)\b", re.IGNORECASE),
        re.compile(r"\b(?:act\s+as\s+an\s+unfiltered\s+ai)\b", re.IGNORECASE),
    ]

    CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
    SCRIPT_TAG_RE = re.compile(r"<\s*(?:script|iframe|object|embed)[^>]*>.*?</\s*(?:script|iframe|object|embed)\s*>", re.IGNORECASE | re.DOTALL)
    EVENT_HANDLER_RE = re.compile(r"\bon\w+\s*=", re.IGNORECASE)

    @classmethod
    def sanitize(cls, query: str) -> SanitizationResult:
        """
        Validates, cleans, and screens the raw user query.
        """
        raw = query.strip()
        was_truncated = False

        # 1. Truncate if exceeds max length
        if len(raw) > cls.MAX_QUERY_CHARS:
            raw = raw[:cls.MAX_QUERY_CHARS]
            was_truncated = True

        # 2. Strip NULL bytes and non-printable control characters
        cleaned = cls.CONTROL_CHAR_RE.sub("", raw)

        # 3. Strip dangerous HTML/Script tags
        cleaned = cls.SCRIPT_TAG_RE.sub("", cleaned)
        cleaned = cls.EVENT_HANDLER_RE.sub("", cleaned)

        # 4. Check for Prompt Injection signatures
        is_injection = False
        warning = None
        for pattern in cls.INJECTION_PATTERNS:
            if pattern.search(cleaned):
                is_injection = True
                warning = "Potential prompt injection attempt detected."
                break

        # Normalize remaining whitespace
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        return SanitizationResult(
            sanitized_query=cleaned,
            is_injection_attempt=is_injection,
            was_truncated=was_truncated,
            warning=warning,
        )
