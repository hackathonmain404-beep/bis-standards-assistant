"""
PDF Document Extractor — BIS Intelligent Assistant AI/RAG Engine
Extracts textual content, page structures, and metadata from Indian Standard PDF publications.
"""

from __future__ import annotations

import re
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pypdf

from ai.src.ingestion.cleaner import TextCleaner
from ai.src.models.knowledge import DocumentType

logger = logging.getLogger(__name__)


class PDFExtractor:
    """
    Extracts text and metadata from PDF files using pypdf.
    Cleans extraction artifacts, stitches broken lines, and infers Indian Standard metadata.
    """

    # Matches Indian Standard numbers: IS 10500:2012, IS 269:2015, IS 302-2-3:2007, IS/IEC 60335-1:2001
    STANDARD_NUM_PATTERN = re.compile(
        r"\b(IS(?:/IEC)?\s+\d+(?:[\s\-\(]+(?:Part\s*\d+|Sec\s*\d+|[A-Z0-9\/\-]+)\)?)?(?::\d{4})?)\b",
        re.IGNORECASE,
    )

    # Common year pattern
    YEAR_PATTERN = re.compile(r":\s*(\d{4})\b|\b(?:19[5-9]\d|20[0-2]\d)\b")

    # Product category keywords mapping
    CATEGORY_KEYWORDS = {
        "water": ["Packaged Water", "Food and Agriculture"],
        "beverage": ["Food and Agriculture"],
        "food": ["Food and Agriculture"],
        "cement": ["Civil and Construction", "Cement and Concrete"],
        "concrete": ["Civil and Construction"],
        "steel": ["Civil and Construction", "Metals and Alloys"],
        "iron": ["Electrical Appliances", "Consumer Electronics"],
        "electrical": ["Electrical Appliances", "Safety"],
        "electronic": ["Electronics and IT"],
        "battery": ["Electronics and IT", "Chemicals"],
        "chemical": ["Chemicals and Allied"],
        "gold": ["Gold and Precious Metals", "Hallmarking"],
        "silver": ["Gold and Precious Metals", "Hallmarking"],
        "textile": ["Textiles and Clothing"],
        "toy": ["Consumer Goods", "Safety"],
        "helmet": ["Automotive and Safety"],
    }

    @classmethod
    def extract_text(cls, pdf_path: str | Path) -> str:
        """
        Extracts all textual content from a PDF file.
        Stitches pages and removes common hyphenation across linebreaks.
        """
        path = Path(pdf_path)
        if not path.is_file():
            raise FileNotFoundError(f"PDF file not found at: {path}")

        reader = pypdf.PdfReader(str(path))
        num_pages = len(reader.pages)
        if num_pages == 0:
            return ""

        page_texts: List[str] = []
        for page_idx, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text() or ""
                # Strip recurring standalone page number lines like "Page 1"
                page_text = re.sub(r"^\s*Page\s+\d+(?:\s+of\s+\d+)?\s*$", "", page_text, flags=re.MULTILINE | re.IGNORECASE)
                if page_text.strip():
                    page_texts.append(page_text.strip())
            except Exception as exc:
                logger.warning("Error extracting page %d of %s: %s", page_idx + 1, path.name, exc)

        full_raw_text = "\n\n".join(page_texts)

        # Fix hyphenated words broken across linebreaks: e.g. "require-\nment" -> "requirement"
        dehyphenated = re.sub(r"(\b[a-zA-Z]{3,})-\s*\n\s*([a-zA-Z]{3,}\b)", r"\1\2", full_raw_text)

        # Normalize via TextCleaner
        cleaned = TextCleaner.clean(dehyphenated)
        return cleaned

    @classmethod
    def infer_metadata(cls, text: str, filename: str) -> Dict[str, Any]:
        """
        Heuristically deduces Indian Standard metadata from extracted text and filename.
        """
        metadata: Dict[str, Any] = {
            "standard_number": None,
            "title": None,
            "year": None,
            "document_id": None,
            "product_categories": [],
            "document_type": DocumentType.INDIAN_STANDARD,
        }

        # 1. Search for Standard Number in first 3000 characters
        first_segment = text[:3000] if text else ""
        match_std = cls.STANDARD_NUM_PATTERN.search(first_segment)
        if not match_std:
            # Fallback: check filename
            match_std = cls.STANDARD_NUM_PATTERN.search(filename.replace("_", " ").replace("-", " "))

        if match_std:
            raw_std = match_std.group(1).strip()
            # Normalize spacing in standard number: e.g. "IS   10500" -> "IS 10500"
            norm_std = re.sub(r"\s+", " ", raw_std).upper()
            metadata["standard_number"] = norm_std

            # Look for year in the standard number or immediately after
            year_match = re.search(r":(\d{4})", norm_std)
            if year_match:
                metadata["year"] = year_match.group(1)
        else:
            # Clean filename base as fallback standard name
            clean_base = Path(filename).stem.replace("_", " ").replace("-", " ").strip()
            metadata["standard_number"] = clean_base

        # 2. Year deduction if not found yet
        if not metadata["year"] and first_segment:
            year_match = cls.YEAR_PATTERN.search(first_segment)
            if year_match:
                metadata["year"] = year_match.group(1) or year_match.group(0)

        # 3. Document Title deduction
        title_found = cls._extract_title_from_text(first_segment)
        if title_found:
            metadata["title"] = title_found
        else:
            # Derive from filename
            name_clean = Path(filename).stem.replace("_", " ").replace("-", " ")
            metadata["title"] = f"{name_clean.title()} Specification"

        # 4. Document ID slug
        std_num = metadata["standard_number"] or Path(filename).stem
        slug = re.sub(r"[^a-zA-Z0-9]+", "-", std_num.lower()).strip("-")
        metadata["document_id"] = f"doc-{slug}"

        # 5. Product Categories inference
        combined_text = f"{metadata['title']} {first_segment[:1000]}".lower()
        cats: List[str] = []
        for keyword, mapped_cats in cls.CATEGORY_KEYWORDS.items():
            if keyword in combined_text:
                for c in mapped_cats:
                    if c not in cats:
                        cats.append(c)

        metadata["product_categories"] = cats or ["General Regulatory"]

        return metadata

    @classmethod
    def _extract_title_from_text(cls, text: str) -> Optional[str]:
        """
        Attempts to isolate the title of the Indian Standard.
        Typically appears in all-caps after 'Indian Standard' or the standard number,
        e.g., 'ORDINARY PORTLAND CEMENT — SPECIFICATION'.
        """
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        for idx, line in enumerate(lines[:20]):
            # If line has SPECIFICATION or REQUIREMENTS or is uppercase > 12 chars
            upper_ratio = sum(1 for c in line if c.isupper()) / max(len(line), 1)
            has_spec = "SPECIFICATION" in line.upper() or "CODE OF PRACTICE" in line.upper() or "REQUIREMENTS" in line.upper()
            if has_spec and len(line) >= 10:
                return line.title()
            if upper_ratio > 0.75 and 15 <= len(line) <= 120:
                if not line.startswith("IS ") and not line.startswith("BUREAU") and not line.startswith("MANAK"):
                    return line.title()
        return None

