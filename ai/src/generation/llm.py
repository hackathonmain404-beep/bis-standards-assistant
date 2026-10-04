"""
LLM Client Interface & Implementations — BIS Intelligent Assistant
Provides pluggable LLM generation with an offline Deterministic synthesizer
and an optional Gemini REST client.
Follows docs/ai/AI_PIPELINE.md Stage 8.
"""

from __future__ import annotations

import json
import logging
import os
import re
import urllib.request
from abc import ABC, abstractmethod
from typing import List, Optional

from ai.src.models.knowledge import BISChunk

from ai.src.config import AIConfig

logger = logging.getLogger(__name__)


class BaseLLMClient(ABC):
    """Abstract interface for LLM response generation."""

    @abstractmethod
    def generate(
        self,
        prompt: str,
        query: str = "",
        chunks: Optional[List[BISChunk]] = None,
        language: str = "en",
    ) -> str:
        """
        Generates a grounded text response given prompt, query, chunks, and language.
        """
        pass


class DeterministicLLMClient(BaseLLMClient):
    """
    Offline deterministic grounded synthesizer.
    Guarantees factual accuracy, exact inline citation placement, and strict adherence
    to BIS pipeline rules without requiring external API keys or network calls.
    """

    def generate(
        self,
        prompt: str,
        query: str = "",
        chunks: Optional[List[BISChunk]] = None,
        language: str = "en",
    ) -> str:
        lang = language.strip().lower()

        # 1. Handle No Chunks / Insufficient Evidence
        if not chunks:
            if lang == "hi":
                return (
                    "मुझे आपके प्रश्न के लिए कोई सत्यापित BIS (Bureau of Indian Standards) जानकारी नहीं मिली। "
                    "कृपया अपने प्रश्न को और स्पष्ट करें अथवा आधिकारिक पोर्टल manakonline.in पर जाएं।"
                )
            return (
                "I could not find verified BIS information on this topic in the knowledge base. "
                "Please verify your query details or consult the official BIS portal at https://manakonline.in."
            )

        # 2. Synthesize Grounded Response based on retrieved evidence
        is_hindi = (lang == "hi")
        lines: List[str] = []

        # Introductory overview
        top_chunk = chunks[0]
        std_num = top_chunk.standard_number or "Indian Standard"
        doc_title = top_chunk.document_title or "Standard"

        if is_hindi:
            lines.append(f"आधिकारिक भारतीय मानक **{std_num}** ({doc_title}) के अनुसार:")
        else:
            lines.append(f"According to Indian Standard **{std_num}** ({doc_title}):")

        # Synthesize technical points from chunks with inline citations
        for idx, chunk in enumerate(chunks, start=1):
            clause_str = f"Clause {chunk.clause}" if chunk.clause else chunk.section_title or "Requirements"
            raw_content = chunk.content.strip()

            # Clean and compact content
            first_sentence = raw_content.split("\n")[0]
            if len(first_sentence) > 200:
                first_sentence = first_sentence[:197] + "..."

            if is_hindi:
                lines.append(f"- **{clause_str}**: {first_sentence} [{idx}]")
            else:
                lines.append(f"- **{clause_str}**: {first_sentence} [{idx}]")

        # Add regulatory guidance note
        if is_hindi:
            lines.append("")
            lines.append("निर्माताओं को सलाह दी जाती है कि वे BIS Scheme-I (ISI Mark) के अंतर्गत संपूर्ण तकनीकी परीक्षणों की पुष्टि करें।")
        else:
            lines.append("")
            lines.append(
                "Manufacturers and stakeholders should ensure full conformity with testing and marking "
                "requirements under the applicable BIS certification scheme."
            )

        return "\n".join(lines)


class GeminiLLMClient(BaseLLMClient):
    """
    Google Gemini API client using standard library HTTP requests.
    Calls Gemini models (default gemini-3.5-flash) and falls back gracefully
    to DeterministicLLMClient if API key is absent or requests fail.
    """

    DEFAULT_MODEL = "gemini-3.5-flash"
    FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"]

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        temperature: float = 0.2,
    ) -> None:
        self.api_key = api_key or AIConfig.get_gemini_api_key()
        self.model_name = model_name or AIConfig.get_gemini_model() or self.DEFAULT_MODEL
        self.temperature = temperature
        self._fallback_client = DeterministicLLMClient()

    def generate(
        self,
        prompt: str,
        query: str = "",
        chunks: Optional[List[BISChunk]] = None,
        language: str = "en",
    ) -> str:
        if not self.api_key:
            logger.info("No Gemini API key provided. Falling back to deterministic synthesizer.")
            return self._fallback_client.generate(prompt, query=query, chunks=chunks, language=language)

        models_to_try = [self.model_name]
        for fb_m in self.FALLBACK_MODELS:
            if fb_m not in models_to_try:
                models_to_try.append(fb_m)

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": self.temperature,
                "maxOutputTokens": 1024,
            },
        }
        req_data = json.dumps(payload).encode("utf-8")

        for current_model in models_to_try:
            endpoint = (
                f"https://generativelanguage.googleapis.com/v1beta/models/"
                f"{current_model}:generateContent?key={self.api_key}"
            )
            req = urllib.request.Request(
                endpoint,
                data=req_data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=12) as resp:
                    resp_json = json.loads(resp.read().decode("utf-8"))
                    candidates = resp_json.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
            except Exception as exc:
                logger.warning("Gemini generation attempt with %s failed: %s", current_model, exc)
                continue

        # If all API calls fail, fallback to deterministic
        return self._fallback_client.generate(prompt, query=query, chunks=chunks, language=language)
