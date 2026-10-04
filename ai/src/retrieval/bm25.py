"""
BM25 Lexical Search Index — BIS Intelligent Assistant Retrieval Engine
Implements Okapi BM25 for precise keyword matching of standard codes, clause numbers, and technical terms.
Follows docs/ai/AI_PIPELINE.md Stage 5.
"""

from __future__ import annotations

import math
import re
from collections import Counter
from typing import Dict, List, Tuple


class BM25Index:
    """
    Pure-Python Okapi BM25 implementation.
    Parameters:
      k1: Calibrates term frequency saturation (standard default: 1.5).
      b: Calibrates document length penalty (standard default: 0.75).
    """

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self._token_pattern = re.compile(r"\b\w+(?:[-/]\w+)*\b")

        # Document storage
        self.doc_ids: List[str] = []
        self.doc_lengths: List[int] = []
        self.avg_doc_length: float = 0.0

        # Term statistics
        self.doc_term_freqs: List[Dict[str, int]] = []
        self.doc_freqs: Dict[str, int] = Counter()
        self.idf: Dict[str, float] = {}
        self.num_docs: int = 0

    def tokenize(self, text: str) -> List[str]:
        """Extracts lowercased alphanumeric and hyphenated tokens."""
        if not text:
            return []
        return [match.group(0).lower() for match in self._token_pattern.finditer(text)]

    def add_documents(self, documents: List[Tuple[str, str]]) -> None:
        """
        Indexes a list of documents where each entry is (doc_id, text_content).
        Computes IDF and document lengths.
        """
        self.doc_ids = []
        self.doc_lengths = []
        self.doc_term_freqs = []
        self.doc_freqs = Counter()

        total_length = 0

        for doc_id, text in documents:
            tokens = self.tokenize(text)
            doc_len = len(tokens)

            self.doc_ids.append(doc_id)
            self.doc_lengths.append(doc_len)
            total_length += doc_len

            term_counts = Counter(tokens)
            self.doc_term_freqs.append(term_counts)

            for term in term_counts.keys():
                self.doc_freqs[term] += 1

        self.num_docs = len(self.doc_ids)
        self.avg_doc_length = (total_length / self.num_docs) if self.num_docs > 0 else 0.0

        # Precompute Robertson-Spärck Jones IDF
        self.idf = {}
        for term, df in self.doc_freqs.items():
            # Standard BM25 IDF formula with +1 smoothing to avoid negative scores
            self.idf[term] = math.log(((self.num_docs - df + 0.5) / (df + 0.5)) + 1.0)

    def search(self, query: str, top_k: int = 10) -> List[Tuple[str, float]]:
        """
        Scores all indexed documents against the query.
        Returns list of (doc_id, bm25_score) ordered descending.
        """
        if self.num_docs == 0:
            return []

        query_tokens = self.tokenize(query)
        if not query_tokens:
            return []

        scores: List[float] = [0.0] * self.num_docs

        for token in query_tokens:
            idf_val = self.idf.get(token)
            if idf_val is None:
                continue

            for doc_idx, term_freqs in enumerate(self.doc_term_freqs):
                tf = term_freqs.get(token, 0)
                if tf == 0:
                    continue

                doc_len = self.doc_lengths[doc_idx]
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avg_doc_length))
                scores[doc_idx] += idf_val * (numerator / denominator)

        # Pair scores with document IDs and filter out zero scores
        scored_pairs = [(self.doc_ids[idx], score) for idx, score in enumerate(scores) if score > 0]
        scored_pairs.sort(key=lambda x: x[1], reverse=True)

        return scored_pairs[:top_k]
