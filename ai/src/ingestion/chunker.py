"""
Hierarchical Clause-Aware Chunker — BIS Intelligent Assistant Ingestion Engine
Splits Indian Standards and BIS documents while strictly respecting Section and Clause boundaries.
Follows docs/ai/RAG_DATA_SCHEMA.md Section 8 and docs/bis/BIS_KNOWLEDGE_SPEC.md Section 8.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional

from ai.src.models.knowledge import BISChunk, ContentType


@dataclass
class ParsedClause:
    """Intermediate representation of an identified clause in a standard."""
    section_title: str
    clause_number: str
    clause_title: Optional[str]
    content: str


class ClauseParser:
    """
    Parses cleaned text from an Indian Standard into structured section and clause segments.
    Detects patterns like:
      - '4. REQUIREMENTS'
      - '4.1 General'
      - '4.2.1 Chemical limits'
    """

    # Matches major section headers: e.g. "1. SCOPE", "4. REQUIREMENTS", "SECTION 4: REQUIREMENTS", "ANNEX A"
    SECTION_HEADER_RE = re.compile(
        r"^(?:(?:SECTION\s+)?(\d+)\.\s+([A-Z0-9\s,\-\(\)]+)|(?:ANNEX\s+([A-Z]))\s*(.*)?)$",
        re.IGNORECASE | re.MULTILINE
    )

    # Matches clause numbers: e.g. "4.1", "4.2.1", "12.3.4.1" followed by optional title or body
    CLAUSE_HEADER_RE = re.compile(
        r"^(\d+\.\d+(?:\.\d+)*)\s*(.*?)$",
        re.MULTILINE
    )

    @classmethod
    def parse_clauses(cls, text: str, default_section: str = "General") -> List[ParsedClause]:
        """
        Parses text line-by-line, tracking current active section and accumulating clauses.
        """
        parsed_clauses: List[ParsedClause] = []
        current_section = default_section
        current_clause_num: Optional[str] = None
        current_clause_title: Optional[str] = None
        current_content_lines: List[str] = []

        def flush_clause():
            nonlocal current_clause_num, current_clause_title, current_content_lines
            if current_clause_num and current_content_lines:
                body = "\n".join(current_content_lines).strip()
                if body:
                    parsed_clauses.append(
                        ParsedClause(
                            section_title=current_section,
                            clause_number=current_clause_num,
                            clause_title=current_clause_title,
                            content=body,
                        )
                    )
            current_content_lines = []

        lines = text.splitlines()
        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                if current_content_lines:
                    current_content_lines.append("")
                continue

            # Check if this line is a section header
            section_match = cls.SECTION_HEADER_RE.match(line_stripped)
            if section_match:
                flush_clause()
                current_section = line_stripped
                current_clause_num = None
                current_clause_title = None
                continue

            # Check if this line starts a new clause
            clause_match = cls.CLAUSE_HEADER_RE.match(line_stripped)
            if clause_match:
                flush_clause()
                current_clause_num = clause_match.group(1).strip()
                trailing = clause_match.group(2).strip()
                # If trailing text is short and looks like a title, save it as title
                if trailing and len(trailing) < 80 and not trailing.endswith("."):
                    current_clause_title = trailing
                    current_content_lines.append(f"{current_clause_num} {trailing}:")
                elif trailing:
                    current_clause_title = None
                    current_content_lines.append(f"{current_clause_num} {trailing}")
                else:
                    current_clause_title = None
                    current_content_lines.append(current_clause_num)
                continue

            # Regular body line within the active clause
            if current_clause_num:
                current_content_lines.append(line_stripped)
            else:
                # Content before the first numbered clause (e.g. Foreword / Scope introduction)
                if not current_content_lines:
                    current_clause_num = "0.0"
                    current_clause_title = "Preamble"
                current_content_lines.append(line_stripped)

        flush_clause()
        return parsed_clauses


class HierarchicalChunker:
    """
    Produces search-optimized BISChunk objects from parsed clauses.
    Ensures chunks do not exceed max_chars while keeping sentences intact.
    """

    def __init__(self, target_chunk_size: int = 800, max_chunk_size: int = 1200):
        self.target_chunk_size = target_chunk_size
        self.max_chunk_size = max_chunk_size

    def chunk_document(
        self,
        text: str,
        document_id: str,
        standard_number: Optional[str] = None,
        document_title: Optional[str] = None,
        document_type: Optional[str] = None,
        product_categories: Optional[List[str]] = None,
    ) -> List[BISChunk]:
        """
        Transforms cleaned document text into an ordered list of BISChunks.
        """
        clauses = ClauseParser.parse_clauses(text)
        chunks: List[BISChunk] = []
        chunk_counter = 0

        for parsed in clauses:
            content = parsed.content.strip()
            if not content:
                continue

            # If clause fits comfortably within max_chunk_size, create a single atomic chunk
            if len(content) <= self.max_chunk_size:
                chunk_id = f"chk-{document_id}-{parsed.clause_number.replace('.', '_')}-{chunk_counter:03d}"
                chunks.append(
                    BISChunk(
                        chunk_id=chunk_id,
                        document_id=document_id,
                        clause=parsed.clause_number,
                        content=content,
                        content_type=ContentType.TEXT,
                        chunk_index=chunk_counter,
                        standard_number=standard_number,
                        document_title=document_title,
                        document_type=document_type,
                        product_categories=product_categories or [],
                        section_title=parsed.section_title,
                    )
                )
                chunk_counter += 1
            else:
                # Clause is too large; split along paragraph or sentence boundaries
                sub_parts = self._split_large_clause(content, self.target_chunk_size)
                for part_idx, part in enumerate(sub_parts):
                    chunk_id = f"chk-{document_id}-{parsed.clause_number.replace('.', '_')}-{chunk_counter:03d}"
                    prefix = f"[{parsed.clause_number} continued] " if part_idx > 0 else ""
                    chunk_content = f"{prefix}{part}".strip()

                    chunks.append(
                        BISChunk(
                            chunk_id=chunk_id,
                            document_id=document_id,
                            clause=parsed.clause_number,
                            content=chunk_content,
                            content_type=ContentType.TEXT,
                            chunk_index=chunk_counter,
                            standard_number=standard_number,
                            document_title=document_title,
                            document_type=document_type,
                            product_categories=product_categories or [],
                            section_title=parsed.section_title,
                        )
                    )
                    chunk_counter += 1

        return chunks

    def _split_large_clause(self, text: str, max_part_size: int) -> List[str]:
        """
        Splits text by double-newline paragraphs first, then by sentence if needed.
        Never splits words in half.
        """
        paragraphs = text.split("\n\n")
        parts: List[str] = []
        current_part = ""

        for p in paragraphs:
            p = p.strip()
            if not p:
                continue

            if len(current_part) + len(p) + 2 <= max_part_size:
                current_part = f"{current_part}\n\n{p}".strip()
            else:
                if current_part:
                    parts.append(current_part)
                # If a single paragraph is itself larger than max_part_size, split by sentences
                if len(p) > max_part_size:
                    sentence_parts = self._split_by_sentences(p, max_part_size)
                    parts.extend(sentence_parts)
                    current_part = ""
                else:
                    current_part = p

        if current_part:
            parts.append(current_part)

        return parts

    @staticmethod
    def _split_by_sentences(paragraph: str, max_size: int) -> List[str]:
        """Splits a single paragraph along sentence boundaries."""
        sentences = re.split(r"(?<=[.!?])\s+", paragraph)
        parts: List[str] = []
        current = ""

        for s in sentences:
            if len(current) + len(s) + 1 <= max_size:
                current = f"{current} {s}".strip()
            else:
                if current:
                    parts.append(current)
                current = s

        if current:
            parts.append(current)

        return parts
