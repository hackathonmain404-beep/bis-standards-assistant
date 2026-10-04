"""
Citation Extraction, Validation & Mapping — BIS Intelligent Assistant
Ensures that all inline citation markers [N] in generated text map strictly to
verified retrieved chunks, and eliminates hallucinated citations.
Follows docs/ai/AI_PIPELINE.md Stage 9 and docs/api/API_CONTRACT.md.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Set, Tuple
from ai.src.models.knowledge import BISChunk


CITATION_PATTERN = re.compile(r"\[(\d+)\]")


class CitationValidator:
    """
    Validates and formats inline citations against the retrieved evidence set.
    """

    @classmethod
    def extract_citation_indices(cls, text: str) -> List[int]:
        """
        Extracts all unique 1-based integer citation indices appearing in text in order of appearance.
        """
        indices: List[int] = []
        for match in CITATION_PATTERN.finditer(text):
            idx = int(match.group(1))
            if idx not in indices:
                indices.append(idx)
        return indices

    @classmethod
    def validate_and_build(
        cls,
        text: str,
        chunks: List[BISChunk],
        max_snippet_length: int = 250,
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Validates citation markers against available chunks.
        Removes invalid/hallucinated markers that exceed the chunk count.
        Returns cleaned text and the authoritative citation items list.
        """
        if not chunks:
            # Strip all citation markers if there are no chunks
            cleaned = CITATION_PATTERN.sub("", text)
            # Clean up potential double spaces left by removed markers
            cleaned = re.sub(r" +", " ", cleaned).replace(" .", ".")
            return cleaned.strip(), []

        available_count = len(chunks)
        used_indices = cls.extract_citation_indices(text)

        # 1. Identify and remove hallucinated citations (e.g. [99] when only 3 chunks exist)
        def replace_invalid(match: re.Match) -> str:
            idx = int(match.group(1))
            if 1 <= idx <= available_count:
                return match.group(0)  # Keep valid marker
            return ""  # Strip hallucinated marker

        cleaned_text = CITATION_PATTERN.sub(replace_invalid, text)
        cleaned_text = re.sub(r" +", " ", cleaned_text).replace(" .", ".").strip()

        # 2. Build verified citation items for valid indices that appear in text
        valid_used = [idx for idx in used_indices if 1 <= idx <= available_count]

        # If the LLM didn't cite any chunks explicitly, but chunks were provided,
        # fallback to including the top relevant chunk as citation [1] if relevant
        citations: List[Dict[str, Any]] = []
        for idx in valid_used:
            chunk = chunks[idx - 1]
            citation_item = chunk.to_citation_dict(index=idx, max_snippet_length=max_snippet_length)
            citations.append(citation_item)

        # Sort by index
        citations.sort(key=lambda c: c["index"])
        return cleaned_text, citations

    @classmethod
    def renumber_citations(
        cls,
        text: str,
        chunks: List[BISChunk],
        max_snippet_length: int = 250,
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Normalizes citations so they are contiguous starting from 1 in order of appearance.
        Example: If text cites [3] then [1], renumbers them to [1] and [2].
        """
        if not chunks:
            return cls.validate_and_build(text, chunks, max_snippet_length)

        available_count = len(chunks)
        raw_indices = cls.extract_citation_indices(text)
        valid_indices = [idx for idx in raw_indices if 1 <= idx <= available_count]

        if not valid_indices:
            lower_text = text.lower()
            if "could not find" in lower_text or "insufficient" in lower_text or "cannot assist" in lower_text:
                cleaned = CITATION_PATTERN.sub("", text)
                return re.sub(r" +", " ", cleaned).replace(" .", ".").strip(), []

            # Grounded fallback: associate top evidence chunk as citation [1]
            top_chunk = chunks[0]
            cit = top_chunk.to_citation_dict(index=1, max_snippet_length=max_snippet_length)
            lines = text.strip().split("\n")
            if lines:
                lines[0] = f"{lines[0].rstrip()} [1]"
            augmented_text = "\n".join(lines)
            return augmented_text, [cit]

        # Create mapping old_idx -> new_idx (1-based contiguous)
        index_map: Dict[int, int] = {}
        for new_idx, old_idx in enumerate(valid_indices, start=1):
            index_map[old_idx] = new_idx

        def replace_with_new_index(match: re.Match) -> str:
            idx = int(match.group(1))
            if idx in index_map:
                return f"[{index_map[idx]}]"
            return ""

        renumbered_text = CITATION_PATTERN.sub(replace_with_new_index, text)
        renumbered_text = re.sub(r" +", " ", renumbered_text).replace(" .", ".").strip()

        # Build citations with new sequential indices
        citations: List[Dict[str, Any]] = []
        for old_idx in valid_indices:
            new_idx = index_map[old_idx]
            chunk = chunks[old_idx - 1]
            cit = chunk.to_citation_dict(index=new_idx, max_snippet_length=max_snippet_length)
            citations.append(cit)

        citations.sort(key=lambda c: c["index"])
        return renumbered_text, citations
