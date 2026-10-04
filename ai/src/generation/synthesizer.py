"""
Response Synthesizer — BIS Intelligent Assistant Generation Pipeline
Coordinates query analysis, prompt construction, LLM generation, citation validation,
and follow-up suggestion generation to produce responses strictly adhering to the Backend API Contract.
Follows docs/ai/AI_PIPELINE.md Stages 6-10 and docs/api/API_CONTRACT.md.
"""

from __future__ import annotations

import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from ai.src.models.knowledge import BISChunk
from ai.src.reranking.selector import EvidenceContext
from ai.src.understanding.intent import QueryIntent
from ai.src.understanding.analyzer import QueryAnalysisResult, QueryAnalyzer
from ai.src.generation.prompts import PromptBuilder
from ai.src.generation.citations import CitationValidator
from ai.src.generation.llm import BaseLLMClient, DeterministicLLMClient, GeminiLLMClient


class AIResponsePayload(BaseModel):
    """
    Contract-compliant response payload returned by the AI Layer to the Backend.
    Guarantees 'response_text' (not 'text') and 1-based sequential citations.
    """
    model_config = ConfigDict(frozen=True, extra="forbid")

    response_text: str = Field(..., min_length=1, description="AI answer text with [N] inline citations")
    intent: str = Field(..., description="Detected query intent string")
    citations: List[Dict[str, Any]] = Field(default_factory=list, description="Authoritative citations list")
    needs_clarification: bool = Field(False, description="Flag indicating if user clarification is required")
    clarification_questions: List[str] = Field(default_factory=list, description="Targeted clarification questions")
    follow_up_suggestions: List[str] = Field(default_factory=list, description="Contextual follow-up suggestions")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Operational performance and trace metadata")


# Intent-based dynamic follow-up suggestion templates
_SUGGESTION_TEMPLATES: Dict[QueryIntent, List[str]] = {
    QueryIntent.PRODUCT_DISCOVERY: [
        "What are the mandatory testing requirements under this Indian Standard?",
        "How can I apply for a BIS Licence under Scheme-I (ISI Mark)?",
        "What Quality Control Order (QCO) mandates certification for this product?",
    ],
    QueryIntent.STANDARD_QUERY: [
        "What is the exact scope and field of application of this standard?",
        "What safety clauses and limits are prescribed in this standard?",
        "Which companion or reference standards must be used with it?",
    ],
    QueryIntent.TESTING_REQUIREMENTS: [
        "Where can I find BIS-recognized laboratories for these tests?",
        "What are the microbiological vs chemical test limits?",
        "What sampling methods are prescribed for factory in-house testing?",
    ],
    QueryIntent.CERTIFICATION_GUIDANCE: [
        "What documents are required to apply on the Manakonline portal?",
        "What are the factory inspection and sample testing procedures?",
        "What are the typical timelines and validity for a BIS Licence?",
    ],
    QueryIntent.HALLMARKING: [
        "How can I verify a 6-digit alphanumeric HUID code?",
        "What are the permissible gold purity grades for hallmarking in India?",
        "What are the testing charges and recognized assaying centres?",
    ],
    QueryIntent.CONSUMER_QUERY: [
        "How can I verify an ISI mark or licence using the BIS Care App?",
        "How do I file a complaint against substandard certified products?",
        "What does the ISI mark guarantee for consumer safety?",
    ],
    QueryIntent.CLAUSE_EXPLANATION: [
        "What specific test methods verify compliance with this clause?",
        "Are there related clauses in companion safety standards?",
    ],
    QueryIntent.LAB_DISCOVERY: [
        "Which BIS branch office oversees testing in my state?",
        "What is the procedure for laboratory recognition under BIS?",
    ],
}


class ResponseSynthesizer:
    """
    Main orchestrator for generating grounded, citation-backed responses.
    """

    def __init__(
        self,
        llm_client: Optional[BaseLLMClient] = None,
        query_analyzer: Optional[QueryAnalyzer] = None,
    ) -> None:
        self.llm_client = llm_client or GeminiLLMClient()
        self.query_analyzer = query_analyzer or QueryAnalyzer()

    def synthesize(
        self,
        query: str,
        evidence: Optional[EvidenceContext] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en",
        analysis_result: Optional[QueryAnalysisResult] = None,
        start_time: Optional[float] = None,
    ) -> AIResponsePayload:
        """
        Synthesizes a response strictly adhering to the Backend API contract.
        """
        t0 = start_time or time.perf_counter()

        # 1. Analyze query intent and clarity if not pre-computed
        if analysis_result is None:
            analysis_result = self.query_analyzer.analyze(query)

        # 2. Check for Ambiguity / Clarification Needed
        if analysis_result.needs_clarification:
            proc_time_ms = int((time.perf_counter() - t0) * 1000)
            return AIResponsePayload(
                response_text=(
                    analysis_result.response_preview or (
                        "To provide accurate Indian Standards and regulatory guidance, I need a few more details "
                        "about your product or requirements."
                    )
                ),
                intent=analysis_result.intent.value,
                citations=[],
                needs_clarification=True,
                clarification_questions=analysis_result.clarification_questions,
                follow_up_suggestions=[],
                metadata={
                    "processing_time_ms": proc_time_ms,
                },
            )

        # 3. Check for Out-of-Scope Queries
        if analysis_result.intent == QueryIntent.OUT_OF_SCOPE:
            proc_time_ms = int((time.perf_counter() - t0) * 1000)
            return AIResponsePayload(
                response_text=(
                    analysis_result.response_preview or (
                        "I am the BIS Intelligent Assistant, specialized in Indian Standards, product certification, "
                        "testing procedures, hallmarking, and Quality Control Orders (QCOs). "
                        "I cannot assist with queries outside the domain of the Bureau of Indian Standards."
                    )
                ),
                intent=analysis_result.intent.value,
                citations=[],
                needs_clarification=False,
                clarification_questions=[],
                follow_up_suggestions=[
                    "What Indian Standards apply to electrical appliances?",
                    "How does the BIS ISI Mark certification process work?",
                    "What products are covered under mandatory Quality Control Orders (QCOs)?",
                ],
                metadata={
                    "processing_time_ms": proc_time_ms,
                },
            )

        # 4. Handle Stage 6a: Insufficient Evidence Path
        chunks: List[Any] = list(evidence.selected_chunks) if (evidence and evidence.selected_chunks) else []
        is_hindi = (language.strip().lower() in ("hi", "hindi"))

        if not evidence or not evidence.is_sufficient or not chunks:
            from ai.src.multilingual.localization import HindiLocalization
            proc_time_ms = int((time.perf_counter() - t0) * 1000)
            if is_hindi:
                fallback_text = HindiLocalization.INSUFFICIENT_EVIDENCE_MESSAGE
                fallback_suggestions = HindiLocalization.INSUFFICIENT_EVIDENCE_FOLLOW_UPS
            else:
                fallback_text = (
                    evidence.fallback_message if (evidence and evidence.fallback_message) else (
                        "I could not find verified BIS information on this topic in the knowledge base. "
                        "Please verify your query details or consult the official BIS portal at https://manakonline.in."
                    )
                )
                fallback_suggestions = [
                    "Which Indian standard applies to packaged drinking water (IS 14543)?",
                    "Which Indian standard applies to electric irons (IS 302-2-3)?",
                    "Where can I find official BIS Product Manuals?",
                ]
            return AIResponsePayload(
                response_text=fallback_text,
                intent=analysis_result.intent.value,
                citations=[],
                needs_clarification=False,
                clarification_questions=[],
                follow_up_suggestions=fallback_suggestions,
                metadata={
                    "processing_time_ms": proc_time_ms,
                    "chunks_retrieved": 0,
                    "chunks_used": 0,
                    "model": getattr(self.llm_client, "model_name", "deterministic"),
                },
            )

        # 5. Build Grounded Prompt
        prompt = PromptBuilder.build_full_prompt(
            query=query,
            chunks=chunks,
            conversation_history=conversation_history,
            language=language,
        )

        # 6. Generate Response via LLM Client
        raw_response = self.llm_client.generate(
            prompt=prompt,
            query=query,
            chunks=chunks,
            language=language,
        )

        # 7. Extract, Validate and Renumber Citations
        cleaned_text, validated_citations = CitationValidator.renumber_citations(
            text=raw_response,
            chunks=chunks,
        )

        # 7b. Technical Term Preservation: restore any transliterated standard designations
        from ai.src.multilingual.preserver import TermPreserver
        cleaned_text = TermPreserver.ensure_canonical_terms(cleaned_text)

        # 8. Generate Contextual Follow-Up Suggestions
        if is_hindi:
            from ai.src.multilingual.localization import HindiLocalization
            suggestions = HindiLocalization.DEFAULT_GROUNDED_FOLLOW_UPS
        else:
            suggestions = _SUGGESTION_TEMPLATES.get(
                analysis_result.intent,
                [
                    "What are the testing requirements for this standard?",
                    "What certification scheme applies to this product?",
                ],
            )

        proc_time_ms = int((time.perf_counter() - t0) * 1000)

        return AIResponsePayload(
            response_text=cleaned_text,
            intent=analysis_result.intent.value,
            citations=validated_citations,
            needs_clarification=False,
            clarification_questions=[],
            follow_up_suggestions=suggestions[:3],
            metadata={
                "processing_time_ms": proc_time_ms,
                "chunks_retrieved": len(chunks),
                "chunks_used": len(validated_citations),
                "model": getattr(self.llm_client, "model_name", "deterministic"),
            },
        )
