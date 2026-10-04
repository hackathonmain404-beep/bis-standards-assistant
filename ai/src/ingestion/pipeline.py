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
from ai.src.ingestion.pdf_extractor import PDFExtractor
from ai.src.models.knowledge import BISDocument, BISChunk, DocumentType, DocumentStatus


class IngestionPipeline:
    """
    Orchestrates the ingestion of an Indian Standard or BIS regulatory publication.
    Produces validated BISDocument metadata and a collection of searchable BISChunks.
    Supports both raw text/markdown documents and native PDF standards.
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
        document_id: Optional[str] = None,
        title: Optional[str] = None,
        standard_number: Optional[str] = None,
        document_type: DocumentType = DocumentType.INDIAN_STANDARD,
        year: Optional[str] = None,
        product_categories: Optional[List[str]] = None,
        source: str = "Bureau of Indian Standards",
    ) -> Tuple[BISDocument, List[BISChunk]]:
        """
        Reads a raw text or PDF file, processes it, and writes the resulting chunks
        to a deterministic JSON file for the downstream retrieval store.
        If metadata (document_id, standard_number, title) is omitted, it is inferred automatically.
        """
        in_path = Path(input_filepath)
        out_dir = Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)

        if not in_path.is_file():
            raise FileNotFoundError(f"Input file not found: {in_path}")

        # Extract text based on file format
        if in_path.suffix.lower() == ".pdf":
            raw_text = PDFExtractor.extract_text(in_path)
            inferred = PDFExtractor.infer_metadata(raw_text, in_path.name)
        else:
            try:
                raw_text = in_path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                raw_text = in_path.read_text(encoding="latin-1", errors="replace")
            inferred = PDFExtractor.infer_metadata(raw_text, in_path.name)

        # Apply inferences where arguments were not provided
        effective_standard = standard_number or inferred.get("standard_number") or in_path.stem
        effective_title = title or inferred.get("title") or f"{in_path.stem} Standard"
        effective_year = year or inferred.get("year")
        effective_id = document_id or inferred.get("document_id") or f"doc-{in_path.stem.lower()}"
        effective_categories = product_categories or inferred.get("product_categories") or []

        doc, chunks = self.process_text(
            raw_text=raw_text,
            document_id=effective_id,
            title=effective_title,
            standard_number=effective_standard,
            document_type=document_type,
            year=effective_year,
            product_categories=effective_categories,
            source=source,
        )

        # Serialize document metadata and chunks into processed artifact
        output_payload: Dict[str, Any] = {
            "document": doc.model_dump(mode="json"),
            "chunks": [c.model_dump(mode="json") for c in chunks],
        }

        output_file = out_dir / f"{effective_id}_chunks.json"
        output_file.write_text(json.dumps(output_payload, indent=2, ensure_ascii=False), encoding="utf-8")

        return doc, chunks

