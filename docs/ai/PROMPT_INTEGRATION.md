# Prompt Integration — BIS Intelligent Assistant

> Related: [AI_PIPELINE](AI_PIPELINE.md) | [AI_RULES](AI_RULES.md) | [PROMPT_FINAL_AUDIT](PROMPT_FINAL_AUDIT.md) | [API_CONTRACT](../api/API_CONTRACT.md)

---

## Purpose

This document defines the prompt architecture — how system prompts, retrieved evidence, conversation context, and output requirements are assembled into the final LLM prompt. It serves as the integration contract between the backend (which provides conversation state) and the AI layer (which constructs and sends prompts).

---

## Prompt Structure

```
┌─────────────────────────────────────────────────┐
│              SYSTEM PROMPT                       │
│                                                  │
│  Role definition                                 │
│  Behavioral rules                                │
│  Anti-hallucination instructions                 │
│  Citation requirements                           │
│  Output format specification                     │
│  Language instruction                            │
└─────────────────────────────────────────────────┘
                      +
┌─────────────────────────────────────────────────┐
│           RETRIEVED EVIDENCE                     │
│                                                  │
│  EVIDENCE [1]:                                   │
│    Source: IS XXXXX — Title                       │
│    Section: X. Section Title                      │
│    Clause: X.X                                    │
│    Content: "..."                                 │
│                                                  │
│  EVIDENCE [2]:                                   │
│    Source: ...                                    │
│    ...                                           │
│                                                  │
│  [Instruction: Use ONLY this evidence]           │
└─────────────────────────────────────────────────┘
                      +
┌─────────────────────────────────────────────────┐
│        CONVERSATION HISTORY                      │
│                                                  │
│  User: "..."                                     │
│  Assistant: "..."                                │
│  User: "..."                                     │
└─────────────────────────────────────────────────┘
                      +
┌─────────────────────────────────────────────────┐
│           CURRENT USER QUERY                     │
│                                                  │
│  User: "..."                                     │
└─────────────────────────────────────────────────┘
```

---

## System Prompt Responsibilities

The system prompt must establish:

| Responsibility | Description |
|:---|:---|
| **Role** | "You are the BIS Intelligent Assistant..." |
| **Domain scope** | BIS, Indian Standards, certification, testing, hallmarking |
| **Grounding rule** | "Answer ONLY based on the provided evidence" |
| **Hallucination prevention** | "NEVER invent standard numbers, clauses, schemes, or requirements" |
| **Uncertainty behavior** | "If the evidence is insufficient, say so clearly" |
| **Citation format** | "Cite sources using [1], [2] inline references" |
| **Output structure** | Required sections in the response |
| **Language** | "Respond in {language}. Do not translate technical terms." |
| **Safety** | "Never declare compliance. Never provide legal advice." |

### System Prompt Template (Conceptual)

```
You are the BIS Intelligent Assistant, a specialized AI assistant
for the Bureau of Indian Standards (BIS). You help users understand
Indian Standards, BIS certification, testing requirements,
hallmarking, and related topics.

CRITICAL RULES:
1. Answer ONLY based on the EVIDENCE provided below.
2. NEVER invent or fabricate:
   - Indian Standard numbers
   - Clause or section references
   - Certification schemes or requirements
   - Testing requirements
   - Laboratory information
   - Official BIS procedures
3. If the evidence is insufficient to answer the question, clearly
   state: "I could not find verified BIS information on this topic."
4. Cite your sources using inline references [1], [2], etc.
5. For each factual claim, reference the specific source.
6. Respond in {language}. Do NOT translate standard numbers, clause
   numbers, scheme names, or technical BIS terminology.
7. You provide information and guidance only. You are NOT a legal
   authority and CANNOT declare a product compliant or non-compliant.

OUTPUT FORMAT:
- Provide a clear, structured answer
- Include inline source references [1], [2]
- At the end, list all sources used with:
  - Standard/Document ID
  - Section/Clause
  - Brief description
- If appropriate, suggest follow-up questions the user might want to ask
```

> **Note:** This is a conceptual template. The final system prompt will be refined during implementation and tested using [PROMPT_FINAL_AUDIT.md](PROMPT_FINAL_AUDIT.md).

---

## Evidence Context Insertion

### Format

Retrieved evidence is inserted as a structured block:

```
=== EVIDENCE ===

EVIDENCE [1]:
Source: IS 14543:2016 — Packaged Drinking Water — Specification
Section: 4. Requirements
Clause: 4.2 Chemical Requirements
Content: "The water shall conform to the chemical requirements
         as given in Table 1. The pH value shall be between 6.5
         and 8.5."

EVIDENCE [2]:
Source: IS 14543:2016 — Packaged Drinking Water — Specification
Section: 5. Packing and Marking
Clause: 5.2
Content: "Every container shall be marked with the following
         information: ..."

EVIDENCE [3]:
Source: BIS Certification Scheme-I — ISI Mark
Section: 3. Application Process
Content: "The manufacturer shall apply to BIS with the following
         documents: ..."

=== END EVIDENCE ===

INSTRUCTION: Base your answer ONLY on the evidence above. Do not
use any information not present in the evidence. If the evidence
does not contain information relevant to the user's question,
state that you could not find relevant BIS information.
```

### Rules

1. **Number evidence sequentially** — [1], [2], [3], etc.
2. **Include metadata** — Standard number, section, clause for each piece of evidence.
3. **Include raw content** — The actual text from the chunk.
4. **Limit evidence count** — Maximum 5–8 evidence blocks (configurable).
5. **Order by relevance** — Most relevant evidence first.
6. **Explicit instruction** — Tell the LLM to use ONLY this evidence.

---

## Conversation History Insertion

### Format

```
=== CONVERSATION HISTORY ===

User: "I manufacture a domestic electric steam iron."
Assistant: "To help you find relevant BIS standards, could you
           provide the voltage rating and intended market?"
User: "It operates at 230V for the Indian market."

=== END CONVERSATION HISTORY ===
```

### Rules

1. **Include N most recent exchanges** — Configurable; recommend 5–10 message pairs.
2. **Preserve role labels** — "User:" and "Assistant:" prefixes.
3. **Truncate if necessary** — If history exceeds context window, keep the most recent messages.
4. **Include only relevant history** — Do not include system errors or empty messages.

---

## Output Requirements

The prompt must specify the expected output structure:

### Required Response Components

| Component | When Required |
|:---|:---|
| **Main answer** | Always |
| **Inline citations [1], [2]** | When factual claims are made |
| **Source list** | When citations are used |
| **Clarifying questions** | When information is insufficient |
| **Follow-up suggestions** | When relevant next steps exist |
| **Uncertainty statement** | When evidence is insufficient |

### Structured Output (Optional)

If the pipeline needs structured output (JSON), the prompt should request:

```
Respond in the following JSON format:
{
  "answer": "Your main response text with [1] citations",
  "citations_used": [1, 2, 3],
  "needs_clarification": false,
  "clarification_questions": [],
  "follow_up_suggestions": ["..."]
}
```

> **STATUS: TBD** — Whether to use structured JSON output or parse free-text output.

---

## Integration Contract

### Backend → AI Layer

The backend provides:

```python
{
    "session_id": "uuid",
    "query": "User's current message",
    "conversation_history": [
        {"role": "user", "content": "..."},
        {"role": "assistant", "content": "..."}
    ],
    "language": "en",
    "max_history_turns": 10  # optional
}
```

### AI Layer → Backend

The AI layer returns:

```python
{
    "response_text": "Formatted answer with [1] citations...",
    "intent": "PRODUCT_DISCOVERY",
    "citations": [
        {
            "index": 1,
            "standard_id": "IS 14543:2016",
            "document_title": "Packaged Drinking Water",
            "section": "4. Requirements",
            "clause": "4.2",
            "snippet": "The water shall conform to..."
        }
    ],
    "needs_clarification": false,
    "clarification_questions": [],
    "follow_up_suggestions": [
        "Would you like to know about testing requirements?",
        "Would you like information on recognized testing labs?"
    ],
    "metadata": {
        "chunks_retrieved": 15,
        "chunks_used": 5,
        "model": "model-name",
        "processing_time_ms": 2300
    }
}
```

### Contract Rules

1. **This contract is shared** between Member 2 (Backend) and Member 3 (AI/RAG).
2. **Changes must be agreed** by both members before implementation.
3. **The AI layer is responsible** for prompt construction — the backend does not build prompts.
4. **The backend is responsible** for providing conversation history — the AI layer does not query the database.

---

## Language Handling in Prompts

| Scenario | Prompt Instruction |
|:---|:---|
| English query | "Respond in English." |
| Hindi query | "Respond in Hindi. Do NOT translate: standard numbers (IS XXXX), clause numbers, scheme names (Scheme-I, CRS), BIS, ISI Mark." |
| Other language | Same pattern as Hindi with appropriate language name |

---

## Open Decisions

| Decision | Status |
|:---|:---|
| Structured JSON output vs. free-text parsing | **STATUS: TBD** |
| Maximum evidence blocks per prompt | **STATUS: TBD** — Suggest 5–8 |
| Maximum conversation history turns | **STATUS: TBD** — Suggest 5–10 |
| LLM temperature and generation parameters | **STATUS: TBD** — See [AI_PIPELINE.md](AI_PIPELINE.md) |
| System prompt iteration and testing process | **STATUS: TBD** |
