"""
Standard Document & PDF Ingestion Tool — BIS Intelligent Assistant AI/RAG Engine
Allows administrators and developers to easily feed new Indian Standards,
Quality Control Orders (QCOs), technical manuals, and PDF documents into the AI knowledge base.

Usage:
  # 1. Single PDF or text file with auto-detected metadata:
  python ai/ingest_standard.py --file path/to/IS_10500_2012.pdf

  # 2. Single file with explicit metadata override:
  python ai/ingest_standard.py \
    --file ai/data/raw/IS_269_sample.txt \
    --id doc-is-269-2015 \
    --standard "IS 269:2015" \
    --title "Ordinary Portland Cement — Specification" \
    --year 2015 \
    --categories "Cement, Construction Materials"

  # 3. Batch ingest an entire folder of PDFs:
  python ai/ingest_standard.py --dir ai/data/pdfs
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import List, Optional

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Safe Windows console encoding for terminal outputs
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from ai.src.ingestion.pipeline import IngestionPipeline
from ai.src.models.knowledge import DocumentType


def ingest_single_file(
    filepath: Path,
    document_id: Optional[str] = None,
    standard_number: Optional[str] = None,
    title: Optional[str] = None,
    year: Optional[str] = None,
    categories: Optional[str] = None,
    output_dir: Optional[Path] = None,
    verbose: bool = True,
) -> tuple[str, int]:
    """Ingests a single PDF or text file into the processed chunks store."""
    if not filepath.is_file():
        print(f"Error: File not found at '{filepath}'")
        return ("", 0)

    processed_dir = output_dir or (Path(__file__).resolve().parent / "data" / "processed")
    category_list = [c.strip() for c in (categories or "").split(",") if c.strip()] or None

    if verbose:
        print("\n" + "=" * 70)
        print("  BIS INTELLIGENT ASSISTANT — INGESTING DOCUMENT")
        print("=" * 70)
        print(f"  Source File:     {filepath.name} ({filepath.stat().st_size / 1024:.1f} KB)")
        print(f"  Format:          {filepath.suffix.upper()}")

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

    if verbose:
        print(f"  Standard Number: {doc.standard_number}")
        print(f"  Document Title:  {doc.title}")
        print(f"  Document ID:     {doc.document_id}")
        print(f"  Categories:      {', '.join(doc.product_categories) if doc.product_categories else 'General'}")
        print(f"  Target Output:   {processed_dir / f'{doc.document_id}_chunks.json'}")
        print("-" * 70)
        print(f"  [SUCCESS] Ingested: {doc.title}")
        print(f"            Total Chunks Generated: {len(chunks)}")
        if chunks:
            print("\n  Sample Indexed Chunks:")
            for idx, chk in enumerate(chunks[:3], start=1):
                clause_str = f"Clause {chk.clause}" if chk.clause else (chk.section_title or "General")
                preview = chk.content.replace('\n', ' ')[:85]
                print(f"    [{idx}] {clause_str} ({chk.char_count} chars): \"{preview}...\"")
            if len(chunks) > 3:
                print(f"    ... and {len(chunks) - 3} more chunks indexed.")
        else:
            print("  [WARNING] 0 chunks generated. If this is a PDF, ensure it contains selectable text, not scanned images.")
        print("=" * 70)

    return (doc.title, len(chunks))


def ingest_batch_directory(
    directory: Path,
    output_dir: Optional[Path] = None,
) -> None:
    """Recursively or flatly finds all PDFs and text files in directory and ingests them."""
    if not directory.is_dir():
        print(f"Error: Directory not found at '{directory}'")
        sys.exit(1)

    supported_exts = {".pdf", ".txt", ".md"}
    files: List[Path] = [p for p in directory.glob("*") if p.is_file() and p.suffix.lower() in supported_exts]

    if not files:
        print(f"\n[INFO] No PDF or text files found in '{directory}'.")
        print("Please place your PDF standards (e.g. IS_10500_2012.pdf) into that directory.")
        return

    print("\n" + "=" * 75)
    print(f"  BATCH INGESTION: Found {len(files)} document(s) in {directory}")
    print("=" * 75)

    successful = 0
    total_chunks = 0
    results = []

    for idx, f in enumerate(files, start=1):
        print(f"\n[{idx}/{len(files)}] Processing: {f.name}...")
        try:
            doc_title, chunk_count = ingest_single_file(
                filepath=f,
                output_dir=output_dir,
                verbose=False,
            )
            successful += 1
            total_chunks += chunk_count
            results.append((f.name, doc_title, chunk_count, "OK"))
            print(f"    -> OK: {chunk_count} chunks indexed ({doc_title})")
        except Exception as exc:
            results.append((f.name, "N/A", 0, f"Error: {exc}"))
            print(f"    -> FAILED: {exc}")

    print("\n" + "=" * 75)
    print("  BATCH INGESTION SUMMARY")
    print("=" * 75)
    print(f"  {'Filename':<30} | {'Chunks':<8} | {'Status'}")
    print("  " + "-" * 71)
    for fname, dtitle, ccount, status in results:
        fname_trunc = (fname[:27] + "...") if len(fname) > 30 else fname
        print(f"  {fname_trunc:<30} | {ccount:<8} | {status}")
    print("  " + "-" * 71)
    print(f"  Total Documents Ingested: {successful}/{len(files)}")
    print(f"  Total Chunks Generated:  {total_chunks}")
    print("=" * 75 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest Indian Standards (PDF or TXT) into BIS AI Knowledge Base")
    parser.add_argument("--file", "-f", default=None, help="Path to a single standard file (.pdf, .txt, .md)")
    parser.add_argument("--dir", "-d", "--batch", dest="directory", default=None, help="Path to directory of PDFs for batch ingestion")
    parser.add_argument("--id", "-i", default=None, help="Optional unique document identifier (e.g., doc-is-10500-2012)")
    parser.add_argument("--standard", "-s", default=None, help="Optional Indian Standard number (e.g., IS 10500:2012)")
    parser.add_argument("--title", "-t", default=None, help="Optional document title (e.g., Drinking Water — Specification)")
    parser.add_argument("--year", "-y", default="", help="Optional publication year")
    parser.add_argument("--categories", "-c", default="", help="Optional comma-separated product categories")
    parser.add_argument("--outdir", "-o", default=None, help="Processed artifacts directory (default: ai/data/processed)")

    args = parser.parse_args()

    if args.directory:
        ingest_batch_directory(
            directory=Path(args.directory),
            output_dir=Path(args.outdir) if args.outdir else None,
        )
    elif args.file:
        ingest_single_file(
            filepath=Path(args.file),
            document_id=args.id,
            standard_number=args.standard,
            title=args.title,
            year=args.year,
            categories=args.categories,
            output_dir=Path(args.outdir) if args.outdir else None,
            verbose=True,
        )
    else:
        # Default behavior if run with no args: check ai/data/pdfs
        default_pdf_dir = Path(__file__).resolve().parent / "data" / "pdfs"
        if default_pdf_dir.is_dir() and any(default_pdf_dir.glob("*.pdf")):
            print(f"[INFO] No arguments specified. Scanning default PDF folder: {default_pdf_dir}")
            ingest_batch_directory(directory=default_pdf_dir)
        else:
            parser.print_help()
            print("\nExamples:")
            print("  python ai/ingest_standard.py --file my_doc.pdf")
            print("  python ai/ingest_standard.py --dir ai/data/pdfs")


if __name__ == "__main__":
    main()
