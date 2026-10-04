"""
BIS Knowledge Domain Models — BIS Intelligent Assistant AI/RAG Engine
Follows docs/ai/RAG_DATA_SCHEMA.md, docs/bis/BIS_KNOWLEDGE_SPEC.md, and docs/bis/BIS_SOURCE_POLICY.md.
Provides strict Pydantic data schemas representing official BIS documents, sections, clauses, and chunks.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class DocumentType(str, Enum):
    """Authorized BIS document types per BIS_SOURCE_POLICY.md Section 1."""
    INDIAN_STANDARD = "indian_standard"
    BIS_GUIDELINE = "bis_guideline"
    CERTIFICATION_SCHEME = "certification_scheme"
    QUALITY_CONTROL_ORDER = "quality_control_order"
    LAB_DIRECTORY = "lab_directory"
    HALLMARKING_GUIDELINE = "hallmarking_guideline"
    NOTIFICATION = "notification"
    GENERAL_INFORMATION = "general_information"


class DocumentStatus(str, Enum):
    """Regulatory status of a standard per BIS_KNOWLEDGE_SPEC.md Section 2."""
    CURRENT = "current"
    SUPERSEDED = "superseded"
    WITHDRAWN = "withdrawn"


class ProductCategory(str, Enum):
    """Standardized high-level BIS product categories."""
    FOOD_AND_AGRICULTURE = "food_and_agriculture"
    ELECTRICAL_APPLIANCES = "electrical_appliances"
    ELECTRONICS_AND_IT = "electronics_and_it"
    CHEMICALS_AND_ALLIED = "chemicals_and_allied"
    CIVIL_AND_CONSTRUCTION = "civil_and_construction"
    MECHANICAL_ENGINEERING = "mechanical_engineering"
    MEDICAL_AND_HEALTHCARE = "medical_and_healthcare"
    TEXTILES_AND_CLOTHING = "textiles_and_clothing"
    GOLD_AND_PRECIOUS_METALS = "gold_and_precious_metals"
    GENERAL = "general"


class ContentType(str, Enum):
    """Structural type of content block inside a chunk per RAG_DATA_SCHEMA.md."""
    TEXT = "text"
    TABLE = "table"
    LIST = "list"
    DEFINITION = "definition"
    NOTE = "note"


class BISDocument(BaseModel):
    """
    Represents an entire authoritative BIS publication (Standard, Scheme, or QCO).
    Root node in the document hierarchy.
    """
    model_config = ConfigDict(frozen=True, extra="forbid")

    document_id: str = Field(..., min_length=1, description="Unique immutable document identifier (e.g., 'doc-is-14543-2016')")
    title: str = Field(..., min_length=1, description="Official publication title")
    standard_number: Optional[str] = Field(None, description="Official Indian Standard code (e.g., 'IS 14543:2016')")
    standard_part: Optional[str] = Field(None, description="Part number if multi-part (e.g., 'Part 2/Sec 3')")
    document_type: DocumentType = Field(default=DocumentType.INDIAN_STANDARD, description="Classification of the document")
    year: Optional[str] = Field(None, description="Publication or revision year (e.g., '2016')")
    revision: Optional[str] = Field(None, description="Revision/amendment notes (e.g., 'Reaffirmed 2021')")
    status: DocumentStatus = Field(default=DocumentStatus.CURRENT, description="Regulatory validity status")
    subject_area: Optional[str] = Field(None, description="Technical division (e.g., 'Electrotechnical')")
    product_categories: List[str] = Field(default_factory=list, description="Target product categories for search filtering")
    source: str = Field(..., min_length=1, description="Authoritative origin (e.g., 'Bureau of Indian Standards')")
    source_url: Optional[str] = Field(None, description="Verified official source URL (no fabricated links allowed)")
    ingestion_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Timestamp when ingested into RAG")
    total_sections: Optional[int] = Field(None, ge=0, description="Total identified sections")
    total_chunks: Optional[int] = Field(None, ge=0, description="Total chunks generated for RAG")

    @field_validator("standard_number")
    @classmethod
    def validate_standard_number(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if not v.upper().startswith("IS") and not v.upper().startswith("QCO") and not v.upper().startswith("SCHEME"):
                raise ValueError(f"standard_number must typically begin with 'IS', 'QCO', or 'Scheme'. Got: '{v}'")
        return v


class BISSection(BaseModel):
    """
    Represents a major section or chapter within a BIS Document (e.g., '4. Requirements').
    Second level in the document hierarchy.
    """
    model_config = ConfigDict(frozen=True, extra="forbid")

    section_id: str = Field(..., min_length=1, description="Unique section identifier (e.g., 'sec-is-14543-4')")
    document_id: str = Field(..., min_length=1, description="Foreign reference to parent BISDocument")
    section_number: Optional[str] = Field(None, description="Section index (e.g., '4', 'Annex A')")
    section_title: str = Field(..., min_length=1, description="Title of the section (e.g., 'Requirements')")
    level: int = Field(default=1, ge=1, le=5, description="Hierarchical depth (1 = top-level, 2 = sub-section)")
    parent_section_id: Optional[str] = Field(None, description="Parent section ID for nested sections")
    content: Optional[str] = Field(None, description="Full raw text of section before chunking")


class BISClause(BaseModel):
    """
    Represents a specific regulatory requirement or rule within a BIS Section.
    Third level in the document hierarchy.
    """
    model_config = ConfigDict(frozen=True, extra="forbid")

    clause_id: str = Field(..., min_length=1, description="Unique clause identifier (e.g., 'cl-is-14543-4-2')")
    document_id: str = Field(..., min_length=1, description="Reference to parent BISDocument")
    section_id: Optional[str] = Field(None, description="Reference to parent BISSection")
    clause_number: str = Field(..., min_length=1, description="Specific clause code (e.g., '4.2', '8.1.1')")
    clause_title: Optional[str] = Field(None, description="Clause subtitle if present (e.g., 'Chemical Requirements')")
    content: str = Field(..., min_length=1, description="Verbatim clause text")
    standard_number: Optional[str] = Field(None, description="Denormalized standard number for provenance")


class BISChunk(BaseModel):
    """
    The atomic unit of retrieval and embedding.
    Carries denormalized metadata from parent Document, Section, and Clause so that
    it can produce an authoritative citation directly without database joins.
    """
    model_config = ConfigDict(frozen=True, extra="forbid")

    chunk_id: str = Field(..., min_length=1, description="Unique chunk identifier (e.g., 'chk-is-14543-0042')")
    document_id: str = Field(..., min_length=1, description="Provenance: parent BISDocument ID")
    section_id: Optional[str] = Field(None, description="Provenance: parent BISSection ID")
    clause_id: Optional[str] = Field(None, description="Provenance: parent BISClause ID")
    clause: Optional[str] = Field(None, description="Denormalized clause number (e.g., '4.2')")
    content: str = Field(..., min_length=1, description="Exact chunk text for embedding and search")
    content_type: ContentType = Field(default=ContentType.TEXT, description="Type of textual content")
    char_count: int = Field(default=0, ge=0, description="Character count of content")
    token_count: Optional[int] = Field(None, ge=0, description="Estimated token count")
    chunk_index: int = Field(..., ge=0, description="Sequential index within parent document")
    standard_number: Optional[str] = Field(None, description="Denormalized standard ID (e.g., 'IS 14543:2016')")
    document_title: Optional[str] = Field(None, description="Denormalized title for citation generation")
    document_type: Optional[str] = Field(None, description="Denormalized type for filtering")
    product_categories: List[str] = Field(default_factory=list, description="Denormalized categories for filtering")
    section_title: Optional[str] = Field(None, description="Denormalized section title (e.g., '4. Requirements')")

    @model_validator(mode="before")
    @classmethod
    def calculate_char_count(cls, data: Any) -> Any:
        if isinstance(data, dict):
            content = data.get("content", "")
            if isinstance(content, str) and not data.get("char_count"):
                data["char_count"] = len(content)
        return data

    def to_citation_dict(self, index: int, max_snippet_length: int = 300) -> Dict[str, Any]:
        """
        Converts this chunk into the exact CitationItem structure expected by
        the backend application layer and database citations table.
        References: backend/src/types.ts CitationItem and API_CONTRACT.md.
        """
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
            "source_document_id": self.document_id,
        }
