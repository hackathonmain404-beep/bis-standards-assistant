"""
Hybrid Retrieval Engine — BIS Intelligent Assistant Retrieval Engine
Fuses BM25 Lexical Search and Dense Vector Semantic Search with Metadata Filtering.
Follows docs/ai/AI_PIPELINE.md Stage 5 and docs/ai/RAG_DATA_SCHEMA.md Section 5.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from ai.src.models.knowledge import BISChunk
from ai.src.retrieval.bm25 import BM25Index
from ai.src.retrieval.embeddings import BaseEmbeddingProvider, DeterministicEmbeddingProvider
from ai.src.retrieval.vector_store import VectorIndex


class RetrievalResult(BaseModel):
    """
    Search candidate output representing a matched chunk with provenance and score.
    Follows docs/ai/RAG_DATA_SCHEMA.md Section 5.
    """
    model_config = ConfigDict(frozen=True, extra="forbid")

    chunk_id: str = Field(..., description="Unique chunk identifier")
    score: float = Field(..., ge=0.0, le=1.0, description="Normalized relevance score")
    content: str = Field(..., description="Verbatim chunk text")
    standard_number: Optional[str] = Field(None, description="Standard ID (e.g., 'IS 14543:2016')")
    clause: Optional[str] = Field(None, description="Clause number (e.g., '4.2')")
    section_title: Optional[str] = Field(None, description="Section heading")
    document_title: Optional[str] = Field(None, description="Standard title")
    product_categories: List[str] = Field(default_factory=list, description="Associated product categories")

    def to_citation_dict(self, index: int, max_snippet_length: int = 300) -> Dict[str, Any]:
        """Converts this retrieval candidate into a backend CitationItem dictionary."""
        snippet = self.content.strip()
        if len(snippet) > max_snippet_length:
            snippet = f"{snippet[:max_snippet_length - 3]}..."

        return {
            "index": index,
            "standard_id": self.standard_number,
            "document_title": self.document_title,
            "section": self.section_title,
            "clause": self.clause,
            "snippet": snippet,
            "source_document_id": self.chunk_id,
        }


class HybridRetriever:
    """
    Hybrid Search Engine combining:
      1. BM25 Lexical Keyword Search
      2. Dense Vector Semantic Cosine Similarity
      3. Calibrated Score Normalization & Weighted Fusion (default: 60% BM25, 40% Vector)
      4. Strict Metadata Filtering
    """

    def __init__(self, embedding_provider: Optional[BaseEmbeddingProvider] = None, alpha: float = 0.6):
        self.embedding_provider = embedding_provider or DeterministicEmbeddingProvider()
        self.alpha = alpha  # Weight assigned to BM25 lexical score vs dense vector score
        self.bm25 = BM25Index()
        self.vector_store = VectorIndex(dimension=self.embedding_provider.dimension)
        self._chunks_by_id: Dict[str, BISChunk] = {}

    def index_chunks(self, chunks: List[BISChunk]) -> None:
        """
        Indexes an incoming collection of BISChunks into both BM25 and Vector indices.
        Enriches both indices with parent standard number and section title for optimal retrieval.
        """
        self._chunks_by_id = {c.chunk_id: c for c in chunks}

        # 1. Build BM25 Index
        bm25_docs = []
        for c in chunks:
            enriched_text = f"{c.standard_number or ''} {c.clause or ''} {c.section_title or ''} {c.content}"
            bm25_docs.append((c.chunk_id, enriched_text))
        self.bm25.add_documents(bm25_docs)

        # 2. Build Vector Index
        chunk_texts = [f"{c.standard_number or ''} {c.section_title or ''} {c.content}" for c in chunks]
        chunk_ids = [c.chunk_id for c in chunks]
        embeddings = self.embedding_provider.embed_batch(chunk_texts)
        self.vector_store.add_chunks(chunk_ids, embeddings)

    def search(
        self,
        query: str,
        top_k: int = 5,
        filter_standard: Optional[str] = None,
        filter_category: Optional[str] = None,
        use_rrf: bool = False,
        rrf_constant: int = 60,
    ) -> List[RetrievalResult]:
        """
        Performs hybrid retrieval.
        Uses normalized linear combination by default (alpha * BM25 + (1 - alpha) * Vector),
        or Reciprocal Rank Fusion if use_rrf is True.
        """
        if not self._chunks_by_id or not query.strip():
            return []

        # 1. Run Lexical (BM25) Search
        bm25_hits = dict(self.bm25.search(query, top_k=len(self._chunks_by_id)))

        # 2. Run Semantic (Vector) Search
        query_vec = self.embedding_provider.embed_text(query)
        vector_hits = dict(self.vector_store.search(query_vec, top_k=len(self._chunks_by_id)))

        all_candidate_ids = set(bm25_hits.keys()) | set(vector_hits.keys())
        scored_candidates: Dict[str, float] = {}

        if use_rrf:
            # Reciprocal Rank Fusion mode
            sorted_bm25 = sorted(bm25_hits.items(), key=lambda x: x[1], reverse=True)
            sorted_vec = sorted(vector_hits.items(), key=lambda x: x[1], reverse=True)
            bm25_ranks = {doc_id: rank + 1 for rank, (doc_id, _) in enumerate(sorted_bm25)}
            vec_ranks = {doc_id: rank + 1 for rank, (doc_id, _) in enumerate(sorted_vec)}

            for doc_id in all_candidate_ids:
                if not self._passes_filter(doc_id, filter_standard, filter_category):
                    continue
                score = 0.0
                if doc_id in bm25_ranks:
                    score += 1.0 / (rrf_constant + bm25_ranks[doc_id])
                if doc_id in vec_ranks:
                    score += 1.0 / (rrf_constant + vec_ranks[doc_id])
                scored_candidates[doc_id] = score
        else:
            # Normalized Weighted Fusion mode
            max_bm25 = max(bm25_hits.values()) if bm25_hits else 1.0
            max_vec = max(vector_hits.values()) if vector_hits else 1.0

            for doc_id in all_candidate_ids:
                if not self._passes_filter(doc_id, filter_standard, filter_category):
                    continue

                norm_b = (bm25_hits.get(doc_id, 0.0) / max_bm25) if max_bm25 > 0 else 0.0
                raw_v = vector_hits.get(doc_id, 0.0)
                norm_v = (raw_v / max_vec) if max_vec > 0 else 0.0

                combined = self.alpha * norm_b + (1.0 - self.alpha) * norm_v
                scored_candidates[doc_id] = combined

        # Sort candidate IDs by score descending
        sorted_candidates = sorted(scored_candidates.items(), key=lambda x: x[1], reverse=True)[:top_k]

        if not sorted_candidates:
            return []

        # Final normalization to ensure top result is scaled appropriately
        max_final = sorted_candidates[0][1] if sorted_candidates else 1.0

        results: List[RetrievalResult] = []
        for doc_id, raw_score in sorted_candidates:
            chunk = self._chunks_by_id[doc_id]
            norm_score = min(1.0, max(0.0, raw_score / max_final if max_final > 0 else 0.0))

            results.append(
                RetrievalResult(
                    chunk_id=chunk.chunk_id,
                    score=round(norm_score, 4),
                    content=chunk.content,
                    standard_number=chunk.standard_number,
                    clause=chunk.clause,
                    section_title=chunk.section_title,
                    document_title=chunk.document_title,
                    product_categories=chunk.product_categories,
                )
            )

        return results

    def _passes_filter(
        self,
        doc_id: str,
        filter_standard: Optional[str],
        filter_category: Optional[str]
    ) -> bool:
        """Evaluates whether a chunk satisfies active metadata filters."""
        chunk = self._chunks_by_id.get(doc_id)
        if not chunk:
            return False

        if filter_standard and chunk.standard_number:
            if filter_standard.lower() not in chunk.standard_number.lower():
                return False

        if filter_category:
            matched = any(filter_category.lower() in cat.lower() for cat in chunk.product_categories)
            if not matched:
                return False

        return True

    # Alias for search method
    retrieve = search
