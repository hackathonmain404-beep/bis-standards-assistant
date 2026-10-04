"""
Entity Extractor — BIS Intelligent Assistant Understanding Engine
Extracts standard numbers, products, electrical ratings, and operational context.
Follows docs/ai/AI_PIPELINE.md Stage 1 and Stage 2.
"""

from __future__ import annotations

import re
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ExtractedEntities(BaseModel):
    """Container for domain entities extracted from a user query."""
    model_config = ConfigDict(frozen=True, extra="forbid")

    standard_numbers: List[str] = Field(default_factory=list, description="Extracted Indian Standard identifiers")
    product_mentions: List[str] = Field(default_factory=list, description="Identified product types")
    attributes: Dict[str, str] = Field(default_factory=dict, description="Technical attributes (voltage, phase, use)")
    clause_references: List[str] = Field(default_factory=list, description="Specific clauses referenced")


class EntityExtractor:
    """
    Regex and dictionary-based entity extractor for Indian Standards and BIS products.
    """

    # Matches: "IS 14543", "IS 14543:2016", "IS 302-1", "IS 302 (Part 2/Sec 3):2007"
    STANDARD_RE = re.compile(
        r"\b(?:IS|is)\s+(\d+(?:[-\/]\d+)*(?:\s*(?:\(Part\s+\d+(?:\/Sec\s+\d+)?\)))?(?::\d{4})?)\b"
    )

    # Matches clause numbers: "Clause 4.2", "clause 8.1.1"
    CLAUSE_RE = re.compile(r"\b(?:clause|Clause|section|Section)\s+(\d+\.\d+(?:\.\d+)*)\b")

    # Matches voltage and electrical specifications: "230V", "250 V", "single-phase"
    VOLTAGE_RE = re.compile(r"\b(\d{2,3})\s*(?:V|v|volts|Volts)\b")
    PHASE_RE = re.compile(r"\b(single-phase|three-phase|1-phase|3-phase)\b", re.IGNORECASE)

    # Intended use context
    USE_RE = re.compile(r"\b(domestic|household|commercial|industrial|outdoor)\b", re.IGNORECASE)

    # Controlled product keywords dictionary
    KNOWN_PRODUCTS = [
        "packaged drinking water",
        "packaged natural mineral water",
        "drinking water",
        "electric steam iron",
        "electric dry iron",
        "electric iron",
        "steam iron",
        "dry iron",
        "electric kettle",
        "immersion water heater",
        "ceiling fan",
        "toys",
        "cement",
        "structural steel",
    ]

    # Hindi product term synonyms mapped to canonical English products
    HINDI_PRODUCT_SYNONYMS = [
        (re.compile(r"(?:पैकेज्ड\s*ड्रिंकिंग\s*वॉटर|पैकेज्ड\s*वॉटर|बोतलबंद\s*पानी|पीने\s*का\s*पानी)", re.IGNORECASE), "packaged drinking water"),
        (re.compile(r"(?:इलेक्ट्रिक\s*आयरन|बिजली\s*की\s*इस्त्री|बिजली\s*का\s*प्रेस|इस्त्री)", re.IGNORECASE), "electric iron"),
        (re.compile(r"(?:सीमेंट|पोर्टलैंड\s*सीमेंट)", re.IGNORECASE), "cement"),
        (re.compile(r"(?:स्टील|सरिया|टीएमटी)", re.IGNORECASE), "structural steel"),
        (re.compile(r"(?:खिलौने|खिलौना)", re.IGNORECASE), "toys"),
    ]

    HINDI_USE_SYNONYMS = [
        (re.compile(r"घरेलू", re.IGNORECASE), "domestic"),
        (re.compile(r"(?:वाणिज्यिक|व्यावसायिक)", re.IGNORECASE), "commercial"),
        (re.compile(r"औद्योगिक", re.IGNORECASE), "industrial"),
    ]

    @classmethod
    def extract(cls, query: str) -> ExtractedEntities:
        """
        Parses text and extracts standard codes, products, clauses, and attributes.
        Supports both English and Hindi/Devanagari inputs.
        """
        from ai.src.multilingual.preserver import TermPreserver
        normalized_query = TermPreserver.ensure_canonical_terms(query)
        q_lower = normalized_query.lower()

        # 1. Extract Standard Numbers
        standard_numbers: List[str] = []
        for match in cls.STANDARD_RE.finditer(normalized_query):
            # Canonicalize prefix to uppercase "IS"
            std_code = f"IS {match.group(1).strip()}"
            if std_code not in standard_numbers:
                standard_numbers.append(std_code)

        # 2. Extract Clause References
        clauses: List[str] = []
        for match in cls.CLAUSE_RE.finditer(normalized_query):
            cl = match.group(1).strip()
            if cl not in clauses:
                clauses.append(cl)

        # 3. Extract Products (English & Hindi synonyms)
        products: List[str] = []
        for p in cls.KNOWN_PRODUCTS:
            if p in q_lower and p not in products:
                products.append(p)

        for pat, canonical_p in cls.HINDI_PRODUCT_SYNONYMS:
            if pat.search(query) and canonical_p not in products:
                products.append(canonical_p)

        # 4. Extract Attributes
        attributes: Dict[str, str] = {}

        volt_match = cls.VOLTAGE_RE.search(normalized_query)
        if volt_match:
            attributes["voltage"] = f"{volt_match.group(1)}V"

        phase_match = cls.PHASE_RE.search(normalized_query)
        if phase_match:
            attributes["phase"] = phase_match.group(1).lower()

        use_match = cls.USE_RE.search(normalized_query)
        if use_match:
            attributes["intended_use"] = use_match.group(1).lower()
        else:
            for pat, canonical_use in cls.HINDI_USE_SYNONYMS:
                if pat.search(query):
                    attributes["intended_use"] = canonical_use
                    break

        return ExtractedEntities(
            standard_numbers=standard_numbers,
            product_mentions=products,
            attributes=attributes,
            clause_references=clauses,
        )
