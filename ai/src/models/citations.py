"""
Citation Models — BIS Intelligent Assistant AI/RAG Engine
Follows Section 3 of Master Implementation Contract and backend/src/types.ts CitationItem.
Ensures citations created by the AI engine conform strictly to the backend API contract.
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field


class BISCitation(BaseModel):
    """
    Structured source evidence cited by the assistant.
    Directly maps to backend CitationItem and database public.citations table.
    """
    model_config = ConfigDict(frozen=True, extra="forbid")

    index: int = Field(..., ge=1, description="1-based citation reference marker matching [N] in response_text")
    standard_id: Optional[str] = Field(None, description="Official Indian Standard ID (e.g., 'IS 14543:2016')")
    document_title: Optional[str] = Field(None, description="Full publication title of standard")
    section: Optional[str] = Field(None, description="Section / chapter name (e.g., '4. Requirements')")
    clause: Optional[str] = Field(None, description="Clause or sub-clause number (e.g., '4.2')")
    snippet: Optional[str] = Field(None, description="Verbatim text excerpt supporting the claim")
    source_document_id: Optional[str] = Field(None, description="Internal source document identifier in RAG store")

    def to_backend_dict(self) -> Dict[str, Any]:
        """
        Serializes this citation into the JSON-compatible dictionary required by
        backend/src/ai-validator.ts and the Supabase citations table.
        """
        return {
            "index": self.index,
            "standard_id": self.standard_id,
            "document_title": self.document_title,
            "section": self.section,
            "clause": self.clause,
            "snippet": self.snippet,
            "source_document_id": self.source_document_id,
        }
