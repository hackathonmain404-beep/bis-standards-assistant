"""
Embedding Providers — BIS Intelligent Assistant Retrieval Engine
Follows docs/ai/AI_PIPELINE.md Stage 5 and docs/ai/RAG_DATA_SCHEMA.md Section 4.
Provides an abstract base interface and a fast, deterministic local embedding provider.
"""

from __future__ import annotations

import hashlib
import re
from abc import ABC, abstractmethod
from typing import List
import numpy as np


class BaseEmbeddingProvider(ABC):
    """Abstract interface that all embedding providers must implement."""

    @abstractmethod
    def embed_text(self, text: str) -> np.ndarray:
        """Converts a single text into a 1D normalized float32 numpy vector."""
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """Converts a list of texts into a 2D float32 numpy array of shape (N, D)."""
        pass

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Vector dimensionality."""
        pass


class DeterministicEmbeddingProvider(BaseEmbeddingProvider):
    """
    Deterministic, fast, zero-dependency embedding provider.
    Uses vocabulary filtering, light suffix normalization, and n-gram feature hashing with L2 unit normalization.
    Ensures:
      - 100% offline execution without network or API costs.
      - Fully reproducible, deterministic embeddings for testing.
      - Semantic proximity for texts with overlapping concepts and technical terminology.
    """

    STOPWORDS = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
        "any", "are", "as", "at", "be", "because", "been", "before", "being", "below",
        "between", "both", "by", "could", "did", "do", "does", "doing", "down", "during",
        "each", "few", "for", "from", "further", "had", "has", "have", "having", "he",
        "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if",
        "in", "into", "is", "it", "its", "itself", "me", "more", "most", "my", "myself",
        "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
        "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so",
        "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
        "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
        "until", "up", "very", "was", "we", "were", "what", "when", "where", "which",
        "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself",
    }

    def __init__(self, dimension: int = 128):
        self._dim = dimension
        self._word_re = re.compile(r"\b\w+(?:[-/]\w+)*\b")

    @property
    def dimension(self) -> int:
        return self._dim

    @staticmethod
    def _normalize_token(w: str) -> str:
        """Lightweight morphological suffix normalization (handles plurals and participle forms)."""
        w = w.lower()
        if w.endswith("ies") and len(w) > 4:
            return w[:-3] + "y"
        if w.endswith("ing") and len(w) > 5:
            return w[:-3]
        if w.endswith("ed") and len(w) > 4:
            return w[:-2]
        if w.endswith("s") and len(w) > 3 and not w.endswith("ss"):
            return w[:-1]
        return w

    def embed_text(self, text: str) -> np.ndarray:
        vec = np.zeros(self._dim, dtype=np.float32)
        if not text:
            return vec

        raw_tokens = self._word_re.findall(text.lower().strip())
        words = [self._normalize_token(w) for w in raw_tokens if w not in self.STOPWORDS]

        # 1. Word-level hashing (weight = 1.0)
        for word in words:
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx = h % self._dim
            sign = 1.0 if (h // self._dim) % 2 == 0 else -1.0
            vec[idx] += sign * 1.0

        # 2. Word bi-gram hashing (weight = 1.5 for preserving multi-word phrases)
        for i in range(len(words) - 1):
            bigram = f"{words[i]}_{words[i+1]}"
            h = int(hashlib.md5(bigram.encode("utf-8")).hexdigest(), 16)
            idx = h % self._dim
            sign = 1.0 if (h // self._dim) % 2 == 0 else -1.0
            vec[idx] += sign * 1.5

        # 3. Sub-word character 3-gram hashing for technical numbers & codes (e.g. "14543", "is-302")
        text_clean = text.lower().strip()
        for i in range(len(text_clean) - 2):
            trigram = text_clean[i : i + 3]
            h = int(hashlib.sha1(trigram.encode("utf-8")).hexdigest(), 16)
            idx = h % self._dim
            sign = 1.0 if (h // self._dim) % 2 == 0 else -1.0
            vec[idx] += sign * 0.25

        # L2 Normalization (unit length) so dot product equals cosine similarity
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm

        return vec

    def embed_batch(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, self._dim), dtype=np.float32)
        return np.vstack([self.embed_text(t) for t in texts])
