"""
Unified BIS AI/RAG Pipeline Orchestrator — BIS Intelligent Assistant
Coordinates Query Understanding, Product Recommendation, Hybrid Search, Reranking,
and Grounded LLM Response Synthesis into a single end-to-end service interface.
Follows docs/ai/AI_PIPELINE.md Stages 1 through 10.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import time

from ai.src.models.knowledge import BISChunk, BISDocument, DocumentType, DocumentStatus
from ai.src.ingestion.pipeline import IngestionPipeline
from ai.src.retrieval.hybrid import HybridRetriever
from ai.src.reranking.selector import EvidenceSelector, EvidenceContext
from ai.src.understanding.analyzer import QueryAnalyzer, QueryAnalysisResult
from ai.src.understanding.entities import EntityExtractor
from ai.src.understanding.intent import QueryIntent
from ai.src.recommendation.engine import ProductRecommendationEngine, ProductRecommendationResult
from ai.src.generation.synthesizer import ResponseSynthesizer, AIResponsePayload
from ai.src.guardrails.sanitizer import InputSanitizer
from ai.src.guardrails.safety import SafetyFilter
from ai.src.multilingual.detector import LanguageDetector
from ai.src.multilingual.translator import QueryTranslator
from ai.src.multilingual.preserver import TermPreserver

logger = logging.getLogger(__name__)


class BISPipeline:
    """
    Master pipeline orchestrating all BIS AI sub-systems.
    Singleton-ready and thread-safe for FastAPI server workers.
    """

    def __init__(
        self,
        data_dir: Optional[str | Path] = None,
        retriever: Optional[HybridRetriever] = None,
        synthesizer: Optional[ResponseSynthesizer] = None,
    ) -> None:
        self.data_dir = Path(data_dir or (Path(__file__).resolve().parent.parent.parent / "data"))
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"

        # 1. Load or Ingest Corpus Chunks
        self.chunks: List[BISChunk] = []
        self.documents: Dict[str, BISDocument] = {}

        if retriever is not None:
            self.retriever = retriever
            self.chunks = list(retriever._chunks_by_id.values())
        else:
            self._initialize_corpus()
            self.retriever = HybridRetriever()
            self.retriever.index_chunks(self.chunks)

        # 2. Initialize Subsystems
        self.analyzer = QueryAnalyzer()
        self.recommendation_engine = ProductRecommendationEngine(retriever=self.retriever)
        self.selector = EvidenceSelector(min_threshold=0.35, max_chunks=4)
        self.synthesizer = synthesizer or ResponseSynthesizer(query_analyzer=self.analyzer)

    def _initialize_corpus(self) -> None:
        """
        Loads pre-processed chunk artifacts or triggers ingestion from raw text files.
        """
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        chunk_files = list(self.processed_dir.glob("*_chunks.json"))

        if chunk_files:
            for c_file in chunk_files:
                try:
                    data = json.loads(c_file.read_text(encoding="utf-8"))
                    doc_dict = data.get("document", {})
                    if doc_dict:
                        self.documents[doc_dict.get("document_id", "")] = BISDocument(**doc_dict)
                    for c_dict in data.get("chunks", []):
                        self.chunks.append(BISChunk(**c_dict))
                except Exception as exc:
                    logger.warning("Failed loading chunk file %s: %s", c_file, exc)

        # If no chunks were loaded, ingest seed standards from raw/
        if not self.chunks and self.raw_dir.is_dir():
            pipeline = IngestionPipeline()

            is_14543_file = self.raw_dir / "IS_14543_2016.txt"
            if is_14543_file.is_file():
                doc, chks = pipeline.process_file_and_save(
                    input_filepath=is_14543_file,
                    output_dir=self.processed_dir,
                    document_id="doc-is-14543-2016",
                    title="Packaged Drinking Water (Other Than Packaged Natural Mineral Water) — Specification",
                    standard_number="IS 14543:2016",
                    year="2016",
                    product_categories=["Packaged Water", "Food and Agriculture"],
                )
                self.documents[doc.document_id] = doc
                self.chunks.extend(chks)

            is_302_file = self.raw_dir / "IS_302_2_3_2007.txt"
            if is_302_file.is_file():
                doc, chks = pipeline.process_file_and_save(
                    input_filepath=is_302_file,
                    output_dir=self.processed_dir,
                    document_id="doc-is-302-2-3-2007",
                    title="Safety of Household and Similar Electrical Appliances - Particular Requirements - Electric Irons",
                    standard_number="IS 302 (Part 2/Sec 3):2007",
                    year="2007",
                    product_categories=["Domestic Electrical Appliances", "Electronics and IT"],
                )
                self.documents[doc.document_id] = doc
                self.chunks.extend(chks)

    def query(
        self,
        query: str,
        session_id: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en",
    ) -> AIResponsePayload:
        """
        Executes the full AI/RAG query lifecycle:
        1. Query Analysis (Intent & Entities)
        2. Vagueness & Clarification check
        3. Domain boundary check (Out of scope)
        4. Product Recommendation check (if applicable)
        5. Hybrid Retrieval (BM25 + Semantic Vector)
        6. Reranking and Budget Fitting
        7. LLM Response Generation & Citation Validation
        """
        t0 = time.perf_counter()
        
        # Step 0: Input Sanitization & Guardrails
        sanitization = InputSanitizer.sanitize(query)
        if sanitization.is_injection_attempt:
            return AIResponsePayload(
                response_text=(
                    "I am the BIS Intelligent Assistant, specialized strictly in Indian Standards, certification, "
                    "and Quality Control Orders. I cannot execute instructions that attempt to bypass system rules."
                ),
                intent="OUT_OF_SCOPE",
                citations=[],
                needs_clarification=False,
                clarification_questions=[],
                follow_up_suggestions=[
                    "What Indian Standards apply to electrical appliances?",
                    "What is the scope of IS 14543 for packaged drinking water?",
                ],
                metadata={"processing_time_ms": int((time.perf_counter() - t0) * 1000), "sanitized": True},
            )

        clean_query = sanitization.sanitized_query

        # Step 0b: Language Detection & Resolution
        effective_lang = LanguageDetector.detect_language(clean_query, language)
        is_hindi = (effective_lang == "hi")

        # Step 1: Query Understanding with multilingual awareness
        analysis: QueryAnalysisResult = self.analyzer.analyze(clean_query, language=effective_lang)

        # Step 2: Handle Clarification or Out-of-Scope directly
        if analysis.needs_clarification or analysis.intent == QueryIntent.OUT_OF_SCOPE:
            return self.synthesizer.synthesize(
                query=clean_query,
                analysis_result=analysis,
                start_time=t0,
                language=effective_lang,
            )

        # Step 3: Handle Product Recommendation Intent & Multilingual Search Transformation
        if is_hindi:
            # Map Hindi concepts and transliterated standard designations to English retrieval terms
            base_retrieval_query = QueryTranslator.to_retrieval_query(clean_query)
        else:
            base_retrieval_query = clean_query

        # Contextual turn enrichment from conversation history for follow-up queries
        if conversation_history and not analysis.entities.standard_numbers:
            for turn in reversed(conversation_history[-4:]):
                turn_text = turn.get("content", "")
                turn_entities = EntityExtractor.extract(turn_text)
                if turn_entities.standard_numbers:
                    base_retrieval_query = f"{turn_entities.standard_numbers[0]} {base_retrieval_query}"
                    break

        if analysis.intent == QueryIntent.PRODUCT_DISCOVERY or analysis.entities.product_mentions:
            rec_result: ProductRecommendationResult = self.recommendation_engine.recommend(
                base_retrieval_query,
                entities=analysis.entities,
            )
            # If product recommendation identified a primary standard, formulate a product guidance query
            if rec_result.found and rec_result.recommendations:
                primary = rec_result.recommendations[0]
                # Enriched query targeting the recommended standard scope & requirements
                retrieval_query = f"{primary.standard_number} {base_retrieval_query}"
            else:
                retrieval_query = base_retrieval_query
        else:
            retrieval_query = base_retrieval_query

        # Step 4: Hybrid Search Retrieval
        candidates = self.retriever.retrieve(retrieval_query, top_k=6)

        # Step 5: Evidence Selection & Reranking
        evidence_context: EvidenceContext = self.selector.select_evidence(base_retrieval_query, candidates)

        # Step 6: Response Synthesis via LLM
        payload: AIResponsePayload = self.synthesizer.synthesize(
            query=clean_query,
            evidence=evidence_context,
            conversation_history=conversation_history,
            language=effective_lang,
            analysis_result=analysis,
            start_time=t0,
        )

        # Step 7: Safety & Trust Guardrails Filter + Canonical Term Preservation
        safe_text, _ = SafetyFilter.sanitize_response(payload.response_text)
        final_text = TermPreserver.ensure_canonical_terms(safe_text)
        meta = dict(payload.metadata)
        meta["query_language"] = effective_lang
        return payload.model_copy(update={"response_text": final_text, "metadata": meta})

    run = query

    def get_indexed_standards_count(self) -> int:
        """Returns the number of distinct standards loaded in index."""
        standards = {c.standard_number for c in self.chunks if c.standard_number}
        return len(standards)

    def get_chunks_count(self) -> int:
        """Returns the total number of retrieval chunks indexed."""
        return len(self.chunks)
