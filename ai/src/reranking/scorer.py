"""
Relevance Scorer — BIS Intelligent Assistant Reranking Engine
Scores candidate chunks based on fine-grained query-document alignment.
Follows docs/ai/AI_PIPELINE.md Stage 6.
"""

from __future__ import annotations

import re
from typing import List, Set
from ai.src.retrieval.hybrid import RetrievalResult


class RelevanceScorer:
    """
    Evaluates fine-grained semantic and lexical alignment between a query and a candidate chunk.
    Enhances coarse retrieval scores by verifying keyword coverage and standard number alignment.
    """

    STOPWORDS: Set[str] = {
        "a", "about", "above", "after", "again", "all", "am", "an", "and", "any", "are",
        "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
        "by", "could", "did", "do", "does", "for", "from", "had", "has", "have", "how",
        "i", "if", "in", "into", "is", "it", "its", "me", "more", "most", "my", "no", "nor",
        "not", "of", "on", "once", "only", "or", "other", "our", "out", "over", "shall",
        "should", "so", "some", "such", "than", "that", "the", "their", "them", "then",
        "there", "these", "they", "this", "those", "through", "to", "too", "under", "was",
        "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with",
        "would", "you", "your",
    }

    def __init__(self):
        self._token_re = re.compile(r"\b\w+(?:[-/]\w+)*\b")

    def _extract_content_tokens(self, text: str) -> List[str]:
        tokens = [m.group(0).lower() for m in self._token_re.finditer(text)]
        return [t for t in tokens if t not in self.STOPWORDS and len(t) > 1]

    def score_candidate(self, query: str, candidate: RetrievalResult) -> float:
        """
        Computes a reranked alignment score between query and candidate (0.0 to 1.0).
        Blends:
          1. Base retrieval score (40%)
          2. Salient term overlap / recall (40%)
          3. Exact standard number / clause boost (20%)
        """
        q_tokens = self._extract_content_tokens(query)
        if not q_tokens:
            return candidate.score

        # Combine text fields from candidate
        doc_text = f"{candidate.standard_number or ''} {candidate.clause or ''} {candidate.section_title or ''} {candidate.content}".lower()
        doc_tokens = set(self._extract_content_tokens(doc_text))

        # 1. Term coverage (fraction of salient query words present in document)
        matched_tokens = [t for t in q_tokens if t in doc_tokens]
        term_coverage = len(matched_tokens) / len(q_tokens) if q_tokens else 0.0

        # 2. Specific standard code alignment boost
        standard_boost = 0.0
        if candidate.standard_number and candidate.standard_number.lower() in query.lower():
            standard_boost = 1.0

        # 3. Clause number exact match boost
        if candidate.clause and candidate.clause.lower() in query.lower():
            standard_boost = max(standard_boost, 0.8)

        # Weighted composition: 40% initial retrieval, 40% term coverage, 20% standard code match
        reranked_score = (
            0.40 * candidate.score +
            0.40 * term_coverage +
            0.20 * standard_boost
        )

        return round(min(1.0, max(0.0, reranked_score)), 4)
