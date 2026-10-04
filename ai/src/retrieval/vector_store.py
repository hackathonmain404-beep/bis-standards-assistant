"""
Dense Vector Index — BIS Intelligent Assistant Retrieval Engine
Performs fast vector similarity search using L2-normalized cosine distance with numpy.
Follows docs/ai/AI_PIPELINE.md Stage 5.
"""

from __future__ import annotations

from typing import List, Tuple
import numpy as np


class VectorIndex:
    """
    In-memory dense vector index.
    Stores pre-normalized unit vectors so that dot products represent cosine similarity.
    """

    def __init__(self, dimension: int = 128):
        self.dimension = dimension
        self.doc_ids: List[str] = []
        self.matrix: np.ndarray = np.empty((0, dimension), dtype=np.float32)

    def add_chunks(self, doc_ids: List[str], embeddings: np.ndarray) -> None:
        """
        Loads embeddings into the index.
        Expects embeddings to be a 2D float32 numpy array with shape (N, dimension).
        """
        if len(doc_ids) != embeddings.shape[0]:
            raise ValueError(f"Length mismatch: {len(doc_ids)} IDs vs {embeddings.shape[0]} embeddings")

        self.doc_ids = list(doc_ids)
        self.matrix = embeddings.astype(np.float32)

    def search(self, query_vector: np.ndarray, top_k: int = 10) -> List[Tuple[str, float]]:
        """
        Computes cosine similarity between query_vector and all indexed embeddings.
        Returns ordered list of (chunk_id, similarity_score).
        """
        if self.matrix.shape[0] == 0:
            return []

        # Ensure query is 1D float32
        q = query_vector.astype(np.float32).reshape(-1)
        norm = np.linalg.norm(q)
        if norm > 0:
            q = q / norm

        # Matrix dot product calculates cosine similarity for all rows simultaneously
        similarities = np.dot(self.matrix, q)

        # Get top-k indices
        top_k = min(top_k, len(self.doc_ids))
        top_indices = np.argsort(similarities)[::-1][:top_k]

        return [(self.doc_ids[idx], float(similarities[idx])) for idx in top_indices]
