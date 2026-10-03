# AI Pipeline — BIS Intelligent Assistant

> Related: [ARCHITECTURE](../architecture/ARCHITECTURE.md) | [AI_RULES](AI_RULES.md) | [RAG_DATA_SCHEMA](RAG_DATA_SCHEMA.md) | [PROMPT_INTEGRATION](PROMPT_INTEGRATION.md) | [API_CONTRACT](../api/API_CONTRACT.md)

---

## Overview

This document defines the complete AI processing pipeline — from receiving a user query to returning a grounded, source-cited response. Every stage has defined inputs, outputs, and failure behaviors.

---

## Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    AI ORCHESTRATION PIPELINE                  │
│                                                              │
│  ┌────────────┐                                              │
│  │  INPUT     │  query, conversation_history, language       │
│  └─────┬──────┘                                              │
│        ▼                                                     │
│  ┌────────────┐                                              │
│  │ 1. QUERY   │  Clean, normalize, extract key terms         │
│  │ PROCESSING │                                              │
│  └─────┬──────┘                                              │
│        ▼                                                     │
│  ┌────────────┐                                              │
│  │ 2. INTENT  │  Classify query type                         │
│  │ DETECTION  │                                              │
│  └─────┬──────┘                                              │
│        ▼                                                     │
│  ┌────────────┐                                              │
│  │ 3. CONTEXT │  Inject conversation history                 │
│  │ ASSEMBLY   │  Resolve references ("this product")         │
│  └─────┬──────┘                                              │
│        ▼                                                     │
│  ┌────────────┐                                              │
│  │ 4. QUERY   │  Rewrite query for better retrieval          │
│  │ REWRITING  │  (Optional: generate sub-queries)            │
│  └─────┬──────┘                                              │
│        ▼                                                     │
│  ┌────────────┐     ┌───────────────────┐                    │
│  │ 5. RETRIEV │────▶│ BIS Knowledge     │                    │
│  │    AL      │◀────│ Base (Vector +    │                    │
│  │            │     │ Metadata Search)  │                    │
│  └─────┬──────┘     └───────────────────┘                    │
│        ▼                                                     │
│  ┌────────────┐                                              │
│  │ 6. EVIDENCE│  Score, filter, rank retrieved chunks        │
│  │ SELECTION  │  Check relevance threshold                   │
│  └─────┬──────┘                                              │
│        │                                                     │
│        ├── [No evidence] ──▶ 6a. INSUFFICIENT EVIDENCE PATH  │
│        │                                                     │
│        ▼ [Evidence available]                                │
│  ┌────────────┐                                              │
│  │ 7. PROMPT  │  System prompt + evidence + context          │
│  │ CONSTRUCT  │  + output format requirements                │
│  └─────┬──────┘                                              │
│        ▼                                                     │
│  ┌────────────┐                                              │
│  │ 8. LLM     │  Call LLM API with constructed prompt        │
│  │ GENERATION │                                              │
│  └─────┬──────┘                                              │
│        ▼                                                     │
│  ┌────────────┐                                              │
│  │ 9. CITATION│  Extract source references from evidence     │
│  │ MAPPING    │  Validate citations against knowledge base   │
│  └─────┬──────┘                                              │
│        ▼                                                     │
│  ┌────────────┐                                              │
│  │ 10. OUTPUT │  Structured response object                  │
│  │ FORMATTING │                                              │
│  └────────────┘                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Stage Details

### Stage 1: Query Processing

**Input:** Raw user query string
**Output:** Cleaned, normalized query

| Step | Description |
|:---|:---|
| Normalize whitespace | Remove extra spaces, newlines |
| Language detection | Identify query language (if not explicitly set) |
| Key term extraction | Identify product names, standard numbers, technical terms |
| Query validation | Reject empty or clearly non-BIS queries |

**Failure:** Empty or invalid query → return validation error.

---

### Stage 2: Intent Detection

**Input:** Processed query + conversation context
**Output:** Intent classification

| Intent | Trigger Examples |
|:---|:---|
| `STANDARD_QUERY` | "What is IS 14543?" |
| `PRODUCT_DISCOVERY` | "I manufacture electric kettles" |
| `CERTIFICATION_GUIDANCE` | "What certification do I need?" |
| `TESTING_REQUIREMENTS` | "What testing is required?" |
| `LAB_DISCOVERY` | "Where can I get testing done?" |
| `HALLMARKING` | "How does hallmarking work?" |
| `CONSUMER_QUERY` | "How to check BIS mark?" |
| `CLAUSE_EXPLANATION` | "What does clause 4.2 mean?" |
| `GENERAL_BIS` | "What does BIS do?" |
| `CLARIFICATION_NEEDED` | "I make products" (too vague) |
| `OUT_OF_SCOPE` | "What's the weather?" |

**Method:**

> **STATUS: TBD** — Intent detection may use:
> - LLM-based classification (prompt the LLM to classify)
> - Rule-based keyword matching (simpler, faster)
> - Hybrid approach

**Failure:** If intent cannot be determined → default to `GENERAL_BIS` and attempt retrieval.

---

### Stage 3: Context Assembly

**Input:** Current query + conversation history
**Output:** Context-enriched query

| Step | Description |
|:---|:---|
| History injection | Include relevant previous messages |
| Reference resolution | "this product" → resolve to previously mentioned product |
| Context window management | Limit history to N most recent messages (configurable) |
| Product attribute accumulation | Merge product details from multiple messages |

**Example:**
```
Message 1: "I manufacture electrical appliances"
Message 2: "It's for domestic use, 230V"
→ Resolved context: { product: "electrical appliance", use: "domestic", voltage: "230V" }
```

**Failure:** If context assembly fails → proceed with current query only.

---

### Stage 4: Query Rewriting

**Input:** Context-enriched query + intent
**Output:** Optimized retrieval query (or multiple sub-queries)

| Step | Description |
|:---|:---|
| Query expansion | Add synonyms or related terms for retrieval |
| Sub-query generation | Split complex queries into focused sub-queries (optional) |
| Metadata filter construction | Build filters (e.g., document_type = "standard") |

**Example:**
```
Original: "I make a domestic electric steam iron"
Rewritten: "Indian Standard safety requirements household electric steam iron domestic 230V"
Filters: { document_type: ["standard", "scheme"], product_category: "electrical_appliances" }
```

**Failure:** If rewriting fails → use original query for retrieval.

---

### Stage 5: Retrieval

**Input:** Retrieval query + metadata filters
**Output:** List of candidate document chunks with scores

| Method | Description |
|:---|:---|
| **Semantic search** | Query embedding vs. chunk embeddings (cosine similarity) |
| **Lexical search** | Keyword/BM25 matching (optional, for hybrid) |
| **Metadata filtering** | Filter by standard_number, document_type, category |
| **Hybrid scoring** | Combine semantic and lexical scores (if both used) |

**Configuration:**

| Parameter | Description | Default (TBD) |
|:---|:---|:---|
| `top_k` | Number of candidate chunks to retrieve | 10–20 |
| `similarity_threshold` | Minimum relevance score | TBD |
| `max_chunks_for_context` | Maximum chunks sent to LLM | 5–8 |

**Failure:** If vector store is unreachable → return service error. If no results → proceed to Stage 6a.

---

### Stage 6: Evidence Selection

**Input:** Candidate chunks with scores
**Output:** Selected evidence chunks (ranked by relevance)

| Step | Description |
|:---|:---|
| Relevance filtering | Remove chunks below similarity threshold |
| Deduplication | Remove near-duplicate chunks |
| Diversity | Ensure evidence covers different aspects of the query |
| Reranking | (Optional) Use a cross-encoder or LLM to rerank top candidates |
| Context window fitting | Select top chunks that fit within LLM context window |

**Output format:** Ordered list of evidence chunks, each with:
- `chunk_id`
- `content`
- `standard_id`
- `clause`
- `section`
- `document_title`
- `relevance_score`

### Stage 6a: Insufficient Evidence Path

If no evidence passes the relevance threshold:

1. **Do NOT proceed to LLM generation** with empty evidence.
2. Generate an "insufficient evidence" response:
   - "I could not find relevant BIS information for your query."
   - Suggest refinement or direct the user to BIS.
3. If the query was vague, trigger a **clarification request** instead.

---

### Stage 7: Prompt Construction

**Input:** System prompt template + selected evidence + conversation context + output requirements
**Output:** Complete LLM prompt

See [PROMPT_INTEGRATION.md](PROMPT_INTEGRATION.md) for detailed prompt architecture.

**Structure:**
```
[System Prompt]
  - Role definition
  - Behavioral rules
  - Anti-hallucination instructions
  - Output format requirements

[Evidence Context]
  - Retrieved chunks with source metadata
  - "Use ONLY the following evidence..."

[Conversation History]
  - Recent messages for context

[Current Query]
  - The user's current question

[Output Instructions]
  - Required format
  - Citation format
  - Language requirement
```

---

### Stage 8: LLM Generation

**Input:** Constructed prompt
**Output:** Generated response text

| Step | Description |
|:---|:---|
| API call | Send prompt to LLM provider |
| Response parsing | Extract generated text |
| Safety check | Verify response doesn't contain harmful content |

**Configuration:**

| Parameter | Description | Default (TBD) |
|:---|:---|:---|
| `temperature` | Response randomness | 0.1–0.3 (low for factual accuracy) |
| `max_tokens` | Maximum response length | TBD |
| `model` | LLM model identifier | TBD |

**Failure:** If LLM API fails → return service error with fallback message.

---

### Stage 9: Citation Mapping

**Input:** Generated response + evidence chunks used
**Output:** Response with validated citations

| Step | Description |
|:---|:---|
| Citation extraction | Identify source references in the generated text |
| Citation validation | Verify that cited standard numbers/clauses exist in the knowledge base |
| Citation formatting | Structure citations as `{ standard_id, clause, section, snippet, document_title }` |
| Invalid citation removal | Remove any citation that cannot be verified against the knowledge base |

**Failure:** If citation validation fails → remove the unverified citation and flag for logging.

---

### Stage 10: Output Formatting

**Input:** Generated response + validated citations + metadata
**Output:** Structured response object

```json
{
  "response_text": "string — the AI's answer",
  "intent": "string — detected intent",
  "citations": [
    {
      "index": 1,
      "standard_id": "IS 14543",
      "document_title": "Packaged Drinking Water",
      "section": "Section 4",
      "clause": "Clause 4.2",
      "snippet": "Relevant text excerpt..."
    }
  ],
  "needs_clarification": false,
  "clarification_questions": [],
  "follow_up_suggestions": [
    "Would you like to know about testing requirements?",
    "Would you like to find recognized testing laboratories?"
  ],
  "metadata": {
    "intent": "STANDARD_QUERY",
    "chunks_retrieved": 12,
    "chunks_used": 5,
    "processing_time_ms": 1500
  }
}
```

---

## Multilingual Handling

```
Non-English Query
      ↓
Language Detection
      ↓
(Option A) Translate to English → Retrieve → Generate in English → Translate back
(Option B) Retrieve using multilingual embeddings → Generate directly in target language
```

> **STATUS: TBD** — Multilingual strategy depends on LLM and embedding model capabilities.

**Critical rule:** Standard numbers, clause numbers, scheme names, and technical BIS terminology must NEVER be translated. They must appear as-is in any language.

---

## Failure Points Summary

| Stage | Failure | Behavior |
|:---|:---|:---|
| Query Processing | Empty/invalid query | Return validation error |
| Intent Detection | Cannot classify | Default to GENERAL_BIS |
| Context Assembly | History load fails | Proceed without context |
| Query Rewriting | Rewrite fails | Use original query |
| Retrieval | Vector store error | Return service error |
| Retrieval | No results | Insufficient evidence response |
| Evidence Selection | All below threshold | Insufficient evidence response |
| LLM Generation | API error | Return service error with fallback |
| Citation Mapping | Invalid citation | Remove citation, log warning |
| Output Formatting | Formatting error | Return plain text response |

---

## AI Service Interface

The backend calls the AI pipeline through a defined interface:

**Input:**
```python
{
    "session_id": "string",
    "query": "string",
    "conversation_history": [
        { "role": "user", "content": "..." },
        { "role": "assistant", "content": "..." }
    ],
    "language": "en"
}
```

**Output:**
```python
{
    "response_text": "string",
    "intent": "string",
    "citations": [ ... ],
    "needs_clarification": bool,
    "clarification_questions": [ ... ],
    "follow_up_suggestions": [ ... ],
    "metadata": { ... }
}
```

This interface is the contract between the backend (Member 2) and the AI layer (Member 3). Changes must be agreed upon by both teams.
