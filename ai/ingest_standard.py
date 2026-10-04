"""
Standard Document Ingestion Tool — BIS Intelligent Assistant AI/RAG Engine
Allows administrators and developers to easily feed new Indian Standards,
Quality Control Orders (QCOs), and technical manuals into the AI knowledge base.

Usage:
  python ai/ingest_standard.py \
    --file ai/data/raw/my_standard.txt \
    --id doc-is-269-2015 \
    --standard "IS 269:2015" \
    --title "Ordinary Portland Cement — Specification" \
    --year 2015 \
    --categories "Cement, Construction Materials"
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.src.ingestion.pipeline import IngestionPipeline
from ai.src.models.knowledge import DocumentType, DocumentStatus


def ingest_document(
    filepath: Path,
    document_id: str,
    standard_number: str,
    title: str,
    year: str = "",
    categories: str = "",
    output_dir: Path | None = None,
) -> None:
    if not filepath.is_file():
        print(f"Error: File not found at '{filepath}'")
        sys.exit(1)

    processed_dir = output_dir or (Path(__file__).resolve().parent / "data" / "processed")
    category_list = [c.strip() for c in categories.split(",") if c.strip()]

    print("\n" + "=" * 70)
    print("  BIS INTELLIGENT ASSISTANT — DOCUMENT INGESTION")
    print("=" * 70)
    print(f"  Source File:     {filepath}")
    print(f"  Standard Number: {standard_number}")
    print(f"  Document Title:  {title}")
    print(f"  Document ID:     {document_id}")
    print(f"  Categories:      {', '.join(category_list) if category_list else 'General'}")
    print(f"  Target Output:   {processed_dir}")
    print("-" * 70)

    pipeline = IngestionPipeline()
    doc, chunks = pipeline.process_file_and_save(
        input_filepath=filepath,
        output_dir=processed_dir,
        document_id=document_id,
        title=title,
        standard_number=standard_number,
        year=year or None,
        product_categories=category_list,
        document_type=DocumentType.INDIAN_STANDARD,
    )

    print(f"[SUCCESS] Ingested document: {doc.title}")
    print(f"          Total Chunks Generated: {len(chunks)}")
    print(f"          Artifact Saved: {processed_dir / f'{document_id}_chunks.json'}")
    print("\nChunk Breakdown:")
    for idx, chk in enumerate(chunks[:5], start=1):
        clause_str = f"Clause {chk.clause}" if chk.clause else (chk.section_title or "General")
        preview = chk.content.replace('\n', ' ')[:90]
        print(f"  [{idx}] {clause_str} ({chk.char_count} chars): \"{preview}...\"")

    if len(chunks) > 5:
        print(f"  ... and {len(chunks) - 5} more chunks indexed.")

    print("\n" + "=" * 70)
    print("The new standard is now indexed and will be searched automatically by the AI!")
    print("=" * 70 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest an Indian Standard into BIS AI knowledge base")
    parser.add_argument("--file", "-f", required=True, help="Path to raw standard text file")
    parser.add_argument("--id", "-i", required=True, help="Unique document identifier (e.g., doc-is-269-2015)")
    parser.add_argument("--standard", "-s", required=True, help="Indian Standard number (e.g., IS 269:2015)")
    parser.add_argument("--title", "-t", required=True, help="Document title")
    parser.add_argument("--year", "-y", default="", help="Publication year")
    parser.add_argument("--categories", "-c", default="", help="Comma-separated product categories")
    parser.add_argument("--outdir", "-o", default=None, help="Processed artifacts directory")

    args = parser.parse_args()
    ingest_document(
        filepath=Path(args.file),
        document_id=args.id,
        standard_number=args.standard,
        title=args.title,
        year=args.year,
        categories=args.categories,
        output_dir=Path(args.outdir) if args.outdir else None,
    )


if __name__ == "__main__":
    main()
