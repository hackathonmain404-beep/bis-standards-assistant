"""
Ingestion Pipeline Orchestrator — BIS Intelligent Assistant AI/RAG Engine
Combines TextCleaner, HierarchicalChunker, and BISDocument creation.
Follows docs/ai/AI_PIPELINE.md Stage 1-4 and docs/bis/BIS_KNOWLEDGE_SPEC.md.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from ai.src.ingestion.cleaner import TextCleaner
from ai.src.ingestion.chunker import HierarchicalChunker
from ai.src.models.knowledge import BISDocument, BISChunk, DocumentType, DocumentStatus


class IngestionPipeline:
    """
    Orchestrates the ingestion of an Indian Standard or BIS regulatory publication.
    Produces validated BISDocument metadata and a collection of searchable BISChunks.
    """

    def __init__(self, chunker: Optional[HierarchicalChunker] = None):
        self.cleaner = TextCleaner
        self.chunker = chunker or HierarchicalChunker()

    def process_text(
        self,
        raw_text: str,
        document_id: str,
        title: str,
        standard_number: Optional[str] = None,
        document_type: DocumentType = DocumentType.INDIAN_STANDARD,
        year: Optional[str] = None,
        status: DocumentStatus = DocumentStatus.CURRENT,
        product_categories: Optional[List[str]] = None,
        source: str = "Bureau of Indian Standards",
        source_url: Optional[str] = None,
        subject_area: Optional[str] = None,
    ) -> Tuple[BISDocument, List[BISChunk]]:
        """
        Cleans text, creates the BISDocument record, chunks the text, and
        updates the document record with chunk statistics.
        """
        cleaned_text = self.cleaner.clean(raw_text)

        chunks = self.chunker.chunk_document(
            text=cleaned_text,
            document_id=document_id,
            standard_number=standard_number,
            document_title=title,
            document_type=document_type.value,
            product_categories=product_categories or [],
        )

        doc = BISDocument(
            document_id=document_id,
            title=title,
            standard_number=standard_number,
            document_type=document_type,
            year=year,
            status=status,
            product_categories=product_categories or [],
            source=source,
            source_url=source_url,
            subject_area=subject_area,
            total_chunks=len(chunks),
        )

        return doc, chunks

    def process_file_and_save(
        self,
        input_filepath: str | Path,
        output_dir: str | Path,
        document_id: str,
        title: str,
        standard_number: Optional[str] = None,
        document_type: DocumentType = DocumentType.INDIAN_STANDARD,
        year: Optional[str] = None,
        product_categories: Optional[List[str]] = None,
        source: str = "Bureau of Indian Standards",
    ) -> Tuple[BISDocument, List[BISChunk]]:
        """
        Reads a raw file, processes it, and writes the resulting chunks
        to a deterministic JSON file for the downstream retrieval store.
        """
        in_path = Path(input_filepath)
        out_dir = Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)

        raw_text = in_path.read_text(encoding="utf-8")

        doc, chunks = self.process_text(
            raw_text=raw_text,
            document_id=document_id,
            title=title,
            standard_number=standard_number,
            document_type=document_type,
            year=year,
            product_categories=product_categories,
            source=source,
        )

        # Serialize document metadata and chunks into processed artifact
        output_payload: Dict[str, Any] = {
            "document": doc.model_dump(mode="json"),
            "chunks": [c.model_dump(mode="json") for c in chunks],
        }

        output_file = out_dir / f"{document_id}_chunks.json"
        output_file.write_text(json.dumps(output_payload, indent=2, ensure_ascii=False), encoding="utf-8")

        return doc, chunks
