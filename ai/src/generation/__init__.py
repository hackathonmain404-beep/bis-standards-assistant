"""
Response Generation & Synthesis Engine — BIS Intelligent Assistant
Orchestrates prompt construction, grounded response generation, citation validation,
and compliance with the backend API contract.
"""

from ai.src.generation.prompts import PromptBuilder
from ai.src.generation.citations import CitationValidator
from ai.src.generation.llm import (
    BaseLLMClient,
    DeterministicLLMClient,
    GeminiLLMClient,
)
from ai.src.generation.synthesizer import (
    ResponseSynthesizer,
    AIResponsePayload,
)

__all__ = [
    "PromptBuilder",
    "CitationValidator",
    "BaseLLMClient",
    "DeterministicLLMClient",
    "GeminiLLMClient",
    "ResponseSynthesizer",
    "AIResponsePayload",
]
