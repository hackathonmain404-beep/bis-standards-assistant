# Architecture — BIS Intelligent Assistant

> Related: [BACKEND_ARCHITECTURE](BACKEND_ARCHITECTURE.md) | [TECH_STACK](TECH_STACK.md) | [TOPOLOGY_RULES](TOPOLOGY_RULES.md) | [API_CONTRACT](../api/API_CONTRACT.md) | [AI_PIPELINE](../ai/AI_PIPELINE.md)

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           USER                                  │
│                    (Browser / Mobile)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Chat UI  │  │ Product  │  │ Citation │  │  Compliance   │   │
│  │          │  │  Input   │  │ Display  │  │  Journey UI   │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ REST API / WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ API      │  │ Session  │  │ Auth     │  │   AI Service  │   │
│  │ Gateway  │  │ Manager  │  │ (if req) │  │   Connector   │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────┬───────┘   │
└──────────────────────────────────────────────────────┬──────────┘
                                                       │
                                                       │ Internal API
                                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI ORCHESTRATION                              │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Query    │  │ Intent   │  │ Context  │  │   Retrieval   │   │
│  │ Parser   │  │ Detector │  │ Manager  │  │   Engine      │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────┬───────┘   │
│                                                     │           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │           │
│  │ Prompt   │  │   LLM    │  │ Citation │          │           │
│  │ Builder  │  │ Generator│  │ Extractor│          │           │
│  └──────────┘  └──────────┘  └──────────┘          │           │
└────────────────────────────────────────────────────┬┘───────────┘
                                                     │
                                                     │ Vector / Text Search
                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BIS KNOWLEDGE BASE                              │
│                                                                 │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │ Vector Store │  │   Document    │  │  Metadata Index      │  │
│  │ (Embeddings) │  │   Store       │  │  (Standards, Clauses)│  │
│  └──────────────┘  └───────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Responsibilities

### 2.1 Frontend

| Component | Responsibility |
|:---|:---|
| **Chat UI** | Message input, conversation display, loading/error states |
| **Product Input** | Guided product description entry (free-text or structured) |
| **Citation Display** | Source cards, expandable evidence panels, clause references |
| **Compliance Journey UI** | Visual stepper showing Standard → Testing → Certification flow |
| **Language Selector** | Switch interface and response language |

**Ownership:** `frontend/`
**Communicates with:** Backend API only. No direct access to AI services or knowledge base.

### 2.2 Backend

| Component | Responsibility |
|:---|:---|
| **API Gateway** | HTTP endpoint routing, request validation, response formatting |
| **Session Manager** | Create, retrieve, and manage conversation sessions |
| **Auth Module** | Authentication and authorization (if required) |
| **AI Service Connector** | Forward queries to AI orchestration layer; return structured responses |
| **Database Layer** | Persist sessions, conversations, messages |
| **Error Handler** | Structured error responses, logging, fallback behavior |

**Ownership:** `backend/`
**Communicates with:** Frontend (via REST/WebSocket), AI Orchestration (via internal API)

### 2.3 AI Orchestration

| Component | Responsibility |
|:---|:---|
| **Query Parser** | Clean, normalize, and prepare user queries |
| **Intent Detector** | Classify query intent (Q&A, Product Discovery, Certification, Testing, Lab, etc.) |
| **Context Manager** | Maintain and inject conversation history for multi-turn interactions |
| **Retrieval Engine** | Search the BIS knowledge base using hybrid search (semantic + lexical) |
| **Prompt Builder** | Construct LLM prompts with system instructions, retrieved context, and output requirements |
| **LLM Generator** | Call the LLM API with constructed prompts; receive generated responses |
| **Citation Extractor** | Extract and validate source references from retrieved evidence and generated text |

**Ownership:** `ai/`
**Communicates with:** Backend (receives queries, returns structured responses), BIS Knowledge Base (retrieval)

### 2.4 BIS Knowledge Base

| Component | Responsibility |
|:---|:---|
| **Vector Store** | Store document chunk embeddings for semantic search |
| **Document Store** | Store original document text, sections, and clauses |
| **Metadata Index** | Structured index of standard numbers, categories, schemes, document types |
| **Ingestion Pipeline** | Process raw BIS documents into structured, chunked, embedded format |

**Ownership:** `data/`, `docs/bis/`
**Communicates with:** AI Orchestration (serves retrieval queries)

---

## 3. Request Flow

### 3.1 Standard Chat Query

```
1. User types query in Frontend
         │
2. Frontend sends POST /api/chat
   { session_id, message, language }
         │
3. Backend validates request
         │
4. Backend loads session & conversation history
         │
5. Backend calls AI Orchestration
   { query, conversation_history, language }
         │
6. AI parses query, detects intent
         │
7. AI constructs retrieval query
         │
8. Retrieval Engine searches BIS Knowledge Base
   → Semantic search (vector similarity)
   → Metadata filtering (document type, category)
   → Optional: Lexical/keyword search
         │
9. Retrieved chunks ranked and selected
         │
10. Prompt Builder constructs LLM prompt:
    - System instructions
    - Retrieved evidence
    - Conversation context
    - Output format requirements
         │
11. LLM generates grounded response
         │
12. Citation Extractor maps claims to sources
         │
13. AI returns structured response to Backend:
    {
      response_text,
      intent,
      citations: [ { standard_id, clause, snippet } ],
      needs_clarification,
      follow_up_suggestions
    }
         │
14. Backend persists message and response
         │
15. Backend returns response to Frontend
         │
16. Frontend renders message, citations, and suggestions
```

### 3.2 Product → Standard Discovery

Same flow as above, with additional steps at stage 6–8:

```
6a. AI extracts product attributes from query
    (product type, use, technical specs)
         │
7a. AI constructs product-aware retrieval query
    (may use multiple search strategies)
         │
8a. Retrieval returns candidate standards
         │
8b. AI evaluates WHY each standard is relevant
    to the described product
```

---

## 4. Data Flow

```
┌─────────────┐     ┌────────────┐     ┌────────────────┐
│  Raw BIS     │     │ Ingestion  │     │ BIS Knowledge  │
│  Documents   │────▶│ Pipeline   │────▶│ Base           │
│  (PDFs, etc) │     │ (Chunk,    │     │ (Vectors,      │
│              │     │  Embed,    │     │  Documents,    │
└─────────────┘     │  Index)    │     │  Metadata)     │
                    └────────────┘     └───────┬────────┘
                                               │
                                               │ Query
                                               ▼
                                       ┌───────────────┐
                                       │  AI Retrieval  │
                                       │  Engine        │
                                       └───────────────┘
```

---

## 5. Error Flow

```
User Query
    │
    ▼
[Validation Error?] ──Yes──▶ Return 400 + error message
    │ No
    ▼
[Session Error?] ──Yes──▶ Return 404/500 + error message
    │ No
    ▼
[AI Service Error?] ──Yes──▶ Return 503 + fallback message
    │ No                      "Service temporarily unavailable"
    ▼
[Retrieval Returns Nothing?] ──Yes──▶ Return response with:
    │ No                               "No relevant evidence found"
    ▼                                  + suggestions
[LLM Error?] ──Yes──▶ Return 503 + fallback message
    │ No
    ▼
[Normal Response]
```

See [ERROR_HANDLING.md](../api/ERROR_HANDLING.md) for detailed error specifications.

---

## 6. Deployment Concept

> **STATUS: TBD** — Deployment architecture has not been finalized.

Conceptual deployment options:

```
Option A: Single Server
┌────────────────────────────────┐
│  Frontend (static files)       │
│  Backend (API server)          │
│  AI Service (same process)     │
│  Vector DB (embedded/local)    │
│  App DB (SQLite/local)         │
└────────────────────────────────┘

Option B: Separated Services
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Frontend │  │ Backend  │  │ AI Svc   │  │ Vector   │
│ (CDN/    │  │ (API     │  │          │  │ DB       │
│  Static) │  │  Server) │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

For MVP, **Option A (single server)** is likely sufficient. See [DECISIONS.md](DECISIONS.md).

---

## 7. Key Architectural Principles

1. **Separation of concerns.** Frontend, Backend, AI, and Knowledge Base are distinct layers with explicit interfaces.
2. **Frontend is presentation only.** No AI logic, no direct knowledge base access.
3. **Backend is orchestration.** Routes requests, manages sessions, connects layers.
4. **AI layer is stateless per request.** Conversation state is injected by the backend, not stored internally.
5. **Knowledge base is the source of truth.** The LLM explains and reasons over retrieved evidence — it does not generate facts from its training data.
6. **Every factual claim is traceable.** The architecture is designed around evidence provenance.
7. **Fail safely.** When any component fails, the system returns a graceful, honest error — never a hallucinated response.
