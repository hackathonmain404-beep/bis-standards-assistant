"""
Evidence Selector — BIS Intelligent Assistant Reranking Engine
Handles confidence thresholding, deduplication, budget fitting, and prompt formatting.
Follows docs/ai/AI_PIPELINE.md Stage 6 & 6a and docs/ai/PROMPT_INTEGRATION.md.
"""

from __future__ import annotations

from typing import List, Optional, Set
from pydantic import BaseModel, ConfigDict, Field

from ai.src.retrieval.hybrid import RetrievalResult
from ai.src.reranking.scorer import RelevanceScorer


class EvidenceContext(BaseModel):
    """
    Finalized evidence bundle prepared for LLM generation.
    Carries sufficiency signal to trigger Stage 6a fallback when evidence is lacking.
    """
    model_config = ConfigDict(frozen=True, extra="forbid")

    is_sufficient: bool = Field(..., description="True if evidence passes relevance thresholds; False triggers Stage 6a")
    query: str = Field(..., description="Original user prompt")
    selected_chunks: List[RetrievalResult] = Field(default_factory=list, description="Ordered, deduplicated evidence chunks")
    dropped_chunks_count: int = Field(default=0, ge=0, description="Count of candidate chunks discarded by filters")
    formatted_prompt_block: str = Field(default="", description="Ready-to-inject === EVIDENCE === text block")
    fallback_message: Optional[str] = Field(None, description="Uncertainty message if evidence is insufficient")


class EvidenceSelector:
    """
    Selects, deduplicates, and formats the best evidence chunks for prompt construction.
    Enforces zero-hallucination guardrails and budget constraints.
    """

    DEFAULT_FALLBACK = (
        "I could not find verified BIS information for your query in my current knowledge base. "
        "This may be because no specific standard exists for this topic, or the relevant information "
        "is not yet indexed. You may want to contact the Bureau of Indian Standards (BIS) directly for authoritative guidance."
    )

    def __init__(
        self,
        min_threshold: float = 0.35,
        max_chunks: int = 4,
        max_total_chars: int = 2500,
        scorer: Optional[RelevanceScorer] = None,
    ):
        self.min_threshold = min_threshold
        self.max_chunks = max_chunks
        self.max_total_chars = max_total_chars
        self.scorer = scorer or RelevanceScorer()

    def select_evidence(self, query: str, candidates: List[RetrievalResult]) -> EvidenceContext:
        """
        Executes complete Stage 6 Evidence Selection pipeline:
        1. Rescores candidates with fine-grained cross-scoring.
        2. Filters out candidates below min_threshold.
        3. Deduplicates near-identical passages.
        4. Sorts by score descending.
        5. Fits within chunk count and character limits.
        6. Constructs formatted prompt block or Stage 6a fallback.
        """
        if not candidates or not query.strip():
            return EvidenceContext(
                is_sufficient=False,
                query=query,
                selected_chunks=[],
                dropped_chunks_count=len(candidates),
                formatted_prompt_block="",
                fallback_message=self.DEFAULT_FALLBACK,
            )

        # 1. Rescore candidates
        scored_candidates: List[RetrievalResult] = []
        for c in candidates:
            new_score = self.scorer.score_candidate(query, c)
            # Create updated RetrievalResult with the reranked score
            scored_candidates.append(
                RetrievalResult(
                    chunk_id=c.chunk_id,
                    score=new_score,
                    content=c.content,
                    standard_number=c.standard_number,
                    clause=c.clause,
                    section_title=c.section_title,
                    document_title=c.document_title,
                    product_categories=c.product_categories,
                )
            )

        # 2. Threshold Filtering
        qualified: List[RetrievalResult] = [
            c for c in scored_candidates if c.score >= self.min_threshold
        ]

        if not qualified:
            # Stage 6a: Insufficient Evidence Path triggered
            return EvidenceContext(
                is_sufficient=False,
                query=query,
                selected_chunks=[],
                dropped_chunks_count=len(candidates),
                formatted_prompt_block="",
                fallback_message=self.DEFAULT_FALLBACK,
            )

        # 3. Sort by score descending
        qualified.sort(key=lambda x: x.score, reverse=True)

        # 4. Deduplication
        deduplicated = self._deduplicate_chunks(qualified)

        # 5. Budget Fitting (max_chunks & max_total_chars)
        selected: List[RetrievalResult] = []
        total_chars = 0

        for chunk in deduplicated:
            if len(selected) >= self.max_chunks:
                break
            chunk_len = len(chunk.content)
            if total_chars + chunk_len > self.max_total_chars and len(selected) >= 1:
                # Stop if adding this chunk exceeds budget (unless we haven't added any yet)
                break
            selected.append(chunk)
            total_chars += chunk_len

        dropped_count = len(candidates) - len(selected)

        # 6. Format prompt block
        prompt_block = self.format_prompt_block(selected)

        return EvidenceContext(
            is_sufficient=True,
            query=query,
            selected_chunks=selected,
            dropped_chunks_count=dropped_count,
            formatted_prompt_block=prompt_block,
            fallback_message=None,
        )

    def _deduplicate_chunks(self, chunks: List[RetrievalResult]) -> List[RetrievalResult]:
        """
        Removes near-duplicate text chunks while protecting distinct clause numbers.
        """
        unique_chunks: List[RetrievalResult] = []

        for candidate in chunks:
            is_dup = False
            for existing in unique_chunks:
                # If clause numbers exist and differ, never treat as duplicate
                if candidate.clause and existing.clause and candidate.clause != existing.clause:
                    continue

                # Compute lexical Jaccard overlap
                overlap = self._compute_token_overlap(candidate.content, existing.content)
                if overlap > 0.85:
                    is_dup = True
                    break

            if not is_dup:
                unique_chunks.append(candidate)

        return unique_chunks

    @staticmethod
    def _compute_token_overlap(text1: str, text2: str) -> float:
        """Computes word-level Jaccard similarity."""
        set1 = set(text1.lower().split())
        set2 = set(text2.lower().split())
        if not set1 or not set2:
            return 0.0
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        return intersection / union if union > 0 else 0.0

    @staticmethod
    def format_prompt_block(chunks: List[RetrievalResult]) -> str:
        """
        Formats selected evidence into the standard structured block required by
        docs/ai/PROMPT_INTEGRATION.md lines 123-153.
        """
        if not chunks:
            return ""

        blocks = ["=== EVIDENCE ==="]

        for idx, chunk in enumerate(chunks, start=1):
            source_parts = []
            if chunk.standard_number:
                source_parts.append(chunk.standard_number)
            if chunk.document_title:
                source_parts.append(chunk.document_title)
            source_line = " — ".join(source_parts) or "Official BIS Document"

            section_line = chunk.section_title or "Requirements"
            clause_line = chunk.clause or "General"

            blocks.append(
                f"\nEVIDENCE [{idx}]:\n"
                f"Source: {source_line}\n"
                f"Section: {section_line}\n"
                f"Clause: {clause_line}\n"
                f'Content: "{chunk.content.strip()}"'
            )

        blocks.append(
            "\n=== END EVIDENCE ===\n\n"
            "INSTRUCTION: Base your answer ONLY on the evidence above. Do not use any information "
            "not present in the evidence. For every factual claim, cite the source using [1], [2] matching "
            "the evidence numbers above. If the evidence does not contain information to answer the question, "
            "state that you could not find verified BIS information."
        )

        return "\n".join(blocks)
