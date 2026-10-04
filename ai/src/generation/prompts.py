"""
Prompt Engineering & Construction — BIS Intelligent Assistant
Builds system prompts, structured evidence contexts, and conversation history blocks
strictly following docs/ai/PROMPT_INTEGRATION.md and docs/ai/AI_RULES.md.
"""

from __future__ import annotations

from typing import Dict, List, Optional
from ai.src.models.knowledge import BISChunk


SYSTEM_PROMPT_TEMPLATE = """You are the BIS Intelligent Assistant, a specialized AI assistant for the Bureau of Indian Standards (BIS). You help users understand Indian Standards, BIS certification, testing requirements, hallmarking, and related topics.

CRITICAL RULES:
1. Answer ONLY based on the EVIDENCE provided below.
2. NEVER invent or fabricate:
   - Indian Standard numbers
   - Clause or section references
   - Certification schemes or requirements
   - Testing requirements
   - Laboratory information
   - Official BIS procedures
3. If the evidence is insufficient to answer the question, clearly state: "I could not find verified BIS information on this topic."
4. Cite your sources using inline references [1], [2], etc. Every factual technical assertion or requirement must cite its corresponding evidence item (e.g. "[1]"). You MUST use inline markers like [1], [2] throughout your response.
5. Respond in {language_instruction}
6. You provide information and guidance only. You are NOT a legal authority and CANNOT declare a product compliant or non-compliant.

OUTPUT FORMAT:
- Provide a clear, well-structured answer using bullet points or concise paragraphs.
- Place citations directly following the relevant factual statements (e.g. "The pH value must be between 6.5 and 8.5 [1].").
- Suggest 2-3 logical follow-up questions the user might want to explore next."""


class PromptBuilder:
    """
    Constructs standardized, grounded prompts for downstream LLM generation.
    """

    @classmethod
    def get_language_instruction(cls, language: str = "en") -> str:
        """
        Generates strict language instructions preventing translation of technical terms.
        """
        lang = language.strip().lower()
        if lang == "hi":
            return (
                "Hindi. Do NOT translate: Indian Standard numbers (e.g., 'IS 14543', 'IS 302'), "
                "clause numbers (e.g., 'Clause 4.2'), scheme names ('Scheme-I', 'CRS'), "
                "or official BIS terminology ('BIS', 'ISI Mark', 'QCO')."
            )
        return "English."

    @classmethod
    def build_system_prompt(cls, language: str = "en") -> str:
        """Constructs the authoritative system prompt."""
        lang_instruction = cls.get_language_instruction(language)
        return SYSTEM_PROMPT_TEMPLATE.format(language_instruction=lang_instruction)

    @classmethod
    def build_evidence_block(cls, chunks: List[BISChunk]) -> str:
        """
        Formats retrieved chunks into the standard === EVIDENCE === block
        with 1-based sequential indices [1], [2], ...
        """
        if not chunks:
            return (
                "=== EVIDENCE ===\n"
                "[NO EVIDENCE AVAILABLE]\n"
                "=== END EVIDENCE ===\n\n"
                "INSTRUCTION: No verified BIS evidence was retrieved for this query. "
                "State clearly that you could not find verified BIS information on this topic."
            )

        lines: List[str] = ["=== EVIDENCE ==="]
        for idx, chunk in enumerate(chunks, start=1):
            lines.append("")
            lines.append(f"EVIDENCE [{idx}]:")
            source_parts = []
            if chunk.standard_number:
                source_parts.append(chunk.standard_number)
            if chunk.document_title:
                source_parts.append(chunk.document_title)
            source_str = " — ".join(source_parts) if source_parts else (chunk.document_id or "BIS Standard")
            lines.append(f"Source: {source_str}")

            if chunk.section_title:
                lines.append(f"Section: {chunk.section_title}")
            if chunk.clause:
                lines.append(f"Clause: {chunk.clause}")

            lines.append(f'Content: "{chunk.content.strip()}"')

        lines.append("")
        lines.append("=== END EVIDENCE ===")
        lines.append("")
        lines.append(
            "INSTRUCTION: Base your answer ONLY on the evidence above. Do not use any information "
            "not present in the evidence. If the evidence does not contain information relevant to "
            "the user's question, state that you could not find relevant BIS information."
        )
        return "\n".join(lines)

    @classmethod
    def build_history_block(
        cls,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        max_turns: int = 6,
    ) -> str:
        """
        Formats conversation turns, keeping the most recent turns up to max_turns.
        """
        if not conversation_history:
            return ""

        # Filter valid turns
        valid_turns = [
            turn for turn in conversation_history
            if isinstance(turn, dict) and turn.get("content") and turn.get("role") in ("user", "assistant")
        ]
        if not valid_turns:
            return ""

        # Keep last N turns
        recent_turns = valid_turns[-max_turns:]
        lines: List[str] = ["=== CONVERSATION HISTORY ==="]
        for turn in recent_turns:
            role = "User" if turn["role"] == "user" else "Assistant"
            lines.append(f"{role}: {turn['content'].strip()}")
        lines.append("=== END CONVERSATION HISTORY ===")
        return "\n".join(lines)

    @classmethod
    def build_full_prompt(
        cls,
        query: str,
        chunks: List[BISChunk],
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en",
        max_history_turns: int = 6,
    ) -> str:
        """
        Assembles all prompt sections into a unified generation prompt.
        """
        sections: List[str] = [cls.build_system_prompt(language)]

        evidence_block = cls.build_evidence_block(chunks)
        sections.append(evidence_block)

        history_block = cls.build_history_block(conversation_history, max_turns=max_history_turns)
        if history_block:
            sections.append(history_block)

        query_block = (
            "=== CURRENT USER QUERY ===\n"
            f"User: {query.strip()}\n"
            "=== END CURRENT USER QUERY ===\n\n"
            "Synthesize your grounded response now:"
        )
        sections.append(query_block)

        return "\n\n".join(sections)
