"""
Unit & Integration Tests for PDF Ingestion — BIS Intelligent Assistant
Verifies text extraction, metadata inference, clause chunking, and search indexing for PDF documents.
"""

from __future__ import annotations

import io
import sys
from pathlib import Path
import pytest
import pypdf

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.src.ingestion.pdf_extractor import PDFExtractor
from ai.src.ingestion.pipeline import IngestionPipeline
from ai.src.service.pipeline import BISPipeline
from ai.ingest_standard import ingest_single_file, ingest_batch_directory



def create_sample_pdf_bytes() -> bytes:
    """Creates a valid PDF binary stream containing an Indian Standard."""
    raw_pdf = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 230 >>
stream
BT
/F1 12 Tf
50 720 Td
(IS 10500:2012) Tj
0 -25 Td
(DRINKING WATER - SPECIFICATION) Tj
0 -30 Td
(1. SCOPE) Tj
0 -18 Td
(1.1 This standard prescribes requirements for drinking water.) Tj
0 -30 Td
(4. REQUIREMENTS) Tj
0 -18 Td
(4.1 Total dissolved solids TDS shall not exceed 500 mg per litre.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
trailer
<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF
"""
    # Clean up through pypdf to ensure perfect xref table
    reader = pypdf.PdfReader(io.BytesIO(raw_pdf))
    writer = pypdf.PdfWriter()
    writer.append(reader)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


@pytest.fixture
def sample_pdf_path(tmp_path: Path) -> Path:
    """Fixture providing a temporary sample standard PDF."""
    pdf_file = tmp_path / "IS_10500_2012.pdf"
    pdf_file.write_bytes(create_sample_pdf_bytes())
    return pdf_file


def test_pdf_extractor_text(sample_pdf_path: Path):
    """Test extracting clean text from a PDF file."""
    text = PDFExtractor.extract_text(sample_pdf_path)
    assert "IS 10500:2012" in text
    assert "DRINKING WATER" in text
    assert "4. REQUIREMENTS" in text
    assert "500 mg per litre" in text


def test_pdf_extractor_metadata():
    """Test heuristic metadata deduction from standard text and filename."""
    text = (
        "IS 10500:2012\n"
        "DRINKING WATER — SPECIFICATION\n"
        "(Second Revision)\n"
        "1. SCOPE\n"
        "4. REQUIREMENTS\n"
    )
    meta = PDFExtractor.infer_metadata(text, "IS_10500_2012.pdf")

    assert meta["standard_number"] == "IS 10500:2012"
    assert "drinking water" in meta["title"].lower()
    assert meta["year"] == "2012"
    assert "doc-is-10500-2012" in meta["document_id"]
    assert any("Water" in cat for cat in meta["product_categories"])


def test_pdf_ingestion_pipeline(sample_pdf_path: Path, tmp_path: Path):
    """Test running IngestionPipeline on a PDF file."""
    output_dir = tmp_path / "processed"
    pipeline = IngestionPipeline()

    doc, chunks = pipeline.process_file_and_save(
        input_filepath=sample_pdf_path,
        output_dir=output_dir,
    )

    assert doc.standard_number == "IS 10500:2012"
    assert len(chunks) >= 1
    assert (output_dir / f"{doc.document_id}_chunks.json").is_file()

    # Verify chunk contents
    chunk_texts = " ".join(c.content for c in chunks)
    assert "500 mg per litre" in chunk_texts


def test_pdf_cli_single_ingest(sample_pdf_path: Path, tmp_path: Path):
    """Test single file ingestion function used by ingest_standard.py CLI."""
    out_dir = tmp_path / "cli_processed"
    title, count = ingest_single_file(
        filepath=sample_pdf_path,
        output_dir=out_dir,
        verbose=False,
    )
    assert count >= 1
    assert "drinking water" in title.lower()


def test_pdf_cli_batch_ingest(tmp_path: Path):
    """Test batch ingestion on a folder containing multiple PDFs."""
    pdf_dir = tmp_path / "pdfs"
    pdf_dir.mkdir()
    (pdf_dir / "IS_10500_2012.pdf").write_bytes(create_sample_pdf_bytes())
    (pdf_dir / "sample_doc.txt").write_text("IS 999:2020\nSAMPLE SPECIFICATION\n4. REQUIREMENTS\n4.1 Test line.", encoding="utf-8")

    out_dir = tmp_path / "batch_processed"
    ingest_batch_directory(directory=pdf_dir, output_dir=out_dir)

    processed_files = list(out_dir.glob("*_chunks.json"))
    assert len(processed_files) == 2


def test_pdf_end_to_end_search(sample_pdf_path: Path, tmp_path: Path):
    """Test that chunks from ingested PDF are immediately discoverable and retrievable in BISPipeline."""
    data_dir = tmp_path / "ai_data"
    proc_dir = data_dir / "processed"
    proc_dir.mkdir(parents=True)

    # Ingest PDF into the custom data directory
    pipeline = IngestionPipeline()
    pipeline.process_file_and_save(
        input_filepath=sample_pdf_path,
        output_dir=proc_dir,
    )

    # Initialize BISPipeline with this custom directory
    bis_engine = BISPipeline(data_dir=data_dir)
    assert bis_engine.get_chunks_count() >= 1

    # Execute search query
    results = bis_engine.retriever.retrieve("total dissolved solids TDS limit drinking water", top_k=2)
    assert len(results) > 0
    top_content = results[0].content
    assert "500 mg" in top_content or "dissolved solids" in top_content

