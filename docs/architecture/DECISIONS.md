# Architecture Decision Records — BIS Intelligent Assistant

> Related: [TECH_STACK](TECH_STACK.md) | [ARCHITECTURE](ARCHITECTURE.md) | [TOPOLOGY_RULES](TOPOLOGY_RULES.md)

---

## Purpose

This document records significant architectural and technical decisions using a structured format. Open decisions are explicitly marked so the team can track what still needs to be resolved before implementation.

---

## Decision Format

Each decision follows this structure:

```
## ADR-NNN: Title

**Status:** DECIDED / OPEN DECISION / SUPERSEDED
**Date:** YYYY-MM-DD
**Deciders:** Team members involved

### Context
Why this decision is needed.

### Options
Available choices.

### Chosen Approach
What was decided (or "TBD" if open).

### Reason
Why this option was chosen.

### Consequences
What follows from this decision.
```

---

## Decided

### ADR-001: Separation of Concerns — Four-Layer Architecture

**Status:** DECIDED
**Date:** 2026-10-03
**Deciders:** Full team

#### Context
The system needs clear boundaries between frontend, backend, AI/RAG, and BIS knowledge to enable parallel development by four team members.

#### Options
1. Monolithic application — all logic in one codebase
2. Layered architecture — four distinct layers with explicit interfaces
3. Microservices — fully independent deployable services

#### Chosen Approach
**Option 2: Layered architecture** with four primary directories (`frontend/`, `backend/`, `ai/`, `data/`) and explicit contracts between layers.

#### Reason
- Enables parallel development with minimal merge conflicts
- Simpler than microservices for a small team / MVP
- Clear ownership boundaries map to team member responsibilities
- Can evolve toward microservices later if needed

#### Consequences
- Each layer has a single owner
- Inter-layer communication must use documented interfaces
- Shared data structures go in `shared/`
- See [TOPOLOGY_RULES.md](TOPOLOGY_RULES.md)

---

### ADR-002: RAG-Based Architecture for BIS Information Retrieval

**Status:** DECIDED
**Date:** 2026-10-03
**Deciders:** Full team

#### Context
The assistant needs to answer BIS questions grounded in authoritative source documents, not from the LLM's general training data.

#### Options
1. Direct LLM (no retrieval) — rely on the model's parametric knowledge
2. RAG (Retrieval-Augmented Generation) — retrieve relevant documents, then generate
3. Fine-tuned LLM — train a custom model on BIS data

#### Chosen Approach
**Option 2: RAG** — Retrieve relevant BIS knowledge chunks, inject them as context, and generate grounded responses.

#### Reason
- BIS information is specialized and frequently updated — parametric knowledge is insufficient
- RAG allows traceability (source citations)
- Fine-tuning is expensive and doesn't provide source attribution
- RAG aligns with the core product requirement of evidence-backed answers

#### Consequences
- A vector store and document store are required
- Documents must be chunked and embedded
- Retrieval quality directly impacts answer quality
- Citations can be extracted from retrieved chunks
- See [AI_PIPELINE.md](../ai/AI_PIPELINE.md), [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md)

---

### ADR-003: Anti-Hallucination as a Core Architectural Requirement

**Status:** DECIDED
**Date:** 2026-10-03
**Deciders:** Full team

#### Context
The system provides regulatory/standards information. Hallucinated standards, clauses, or requirements could mislead users and damage trust.

#### Options
1. Best-effort — accept some hallucination, rely on disclaimers
2. Post-generation verification — check generated claims against the knowledge base
3. Retrieval-constrained generation — only allow the LLM to use retrieved evidence

#### Chosen Approach
**Option 3 (primary) + Option 2 (supplementary):** The LLM is instructed to only use retrieved evidence. Post-generation checks verify that cited standard numbers and clauses exist in the knowledge base.

#### Reason
- Trust is the highest product priority
- Retrieval-constrained generation reduces hallucination at the source
- Post-generation verification provides a safety net
- See [AI_RULES.md](../ai/AI_RULES.md) for detailed hallucination prevention rules

#### Consequences
- Prompts must explicitly constrain the LLM to retrieved evidence
- When no evidence is retrieved, the system must say so (not invent an answer)
- Citation accuracy must be evaluated as a quality metric
- See [AI_EVALUATION.md](../ai/AI_EVALUATION.md)

---

### ADR-004: REST API for Frontend-Backend Communication

**Status:** DECIDED
**Date:** 2026-10-03
**Deciders:** Full team

#### Context
Frontend and backend need a communication protocol.

#### Options
1. REST API (JSON over HTTP)
2. GraphQL
3. gRPC

#### Chosen Approach
**Option 1: REST API** for MVP.

#### Reason
- Simplest to implement and debug
- Well understood by all team members
- Sufficient for the chat-based interaction model
- Streaming can be added via SSE (Server-Sent Events) if needed

#### Consequences
- API contract documented in [API_CONTRACT.md](../api/API_CONTRACT.md)
- Frontend uses standard `fetch` or equivalent HTTP client
- Streaming responses may require SSE in a later phase

---

### ADR-005: Application Data Separate from RAG Knowledge

**Status:** DECIDED
**Date:** 2026-10-03
**Deciders:** Full team

#### Context
The system has two types of data: application data (sessions, messages, user data) and RAG knowledge (BIS documents, embeddings, metadata).

#### Options
1. Single database for everything
2. Separate storage — application DB + vector/document store for knowledge

#### Chosen Approach
**Option 2: Separate storage.**

#### Reason
- Different access patterns: application data is CRUD; knowledge data is vector search + text retrieval
- Different ownership: application DB managed by backend; knowledge base managed by AI/Data teams
- Different update cycles: application data changes with user interactions; knowledge base changes with document ingestion

#### Consequences
- Two schema documents: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) (application) and [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md) (knowledge)
- Backend manages application DB
- AI/Data teams manage knowledge store

---

## Open Decisions

### ADR-006: Frontend Framework

**Status:** OPEN DECISION
**Date:** 2026-10-03

#### Context
The frontend needs a technology framework. The UI includes chat interface, citation panels, compliance journey visualization, and multilingual support.

#### Options
1. **React (Vite)** — Component-based, fast dev server, large ecosystem
2. **Next.js** — React with SSR, but SSR may be unnecessary for a chat app
3. **Vanilla HTML/CSS/JS** — Simplest, but may limit UI complexity

#### Chosen Approach
**TBD** — Team needs to decide based on Member 1's familiarity and UI complexity requirements.

#### Notes
- React (Vite) is recommended for balance of simplicity and capability
- Vanilla is acceptable if the team prefers minimal tooling
- Next.js SSR is likely unnecessary for this use case

---

### ADR-007: Backend Framework

**Status:** OPEN DECISION
**Date:** 2026-10-03

#### Context
The backend needs a framework for API endpoints, session management, and AI service integration.

#### Options
1. **Python (FastAPI)** — Async, auto-generated docs, same language as AI layer
2. **Python (Flask)** — Simpler, synchronous by default, large ecosystem
3. **Node.js (Express)** — JavaScript, but creates a language boundary with the AI layer

#### Chosen Approach
**TBD** — Team needs to decide.

#### Notes
- Python (FastAPI) is recommended because it shares the language with the AI layer and provides native async + OpenAPI docs

---

### ADR-008: Application Database Engine

**Status:** OPEN DECISION
**Date:** 2026-10-03

#### Context
The backend needs a database for sessions, messages, and citations.

#### Options
1. **SQLite** — Zero-config, single-file, sufficient for MVP
2. **PostgreSQL** — Production-grade, supports pgvector (could consolidate with vector store)
3. **In-memory / file-based** — Simplest but not persistent

#### Chosen Approach
**TBD** — Team needs to decide.

#### Notes
- SQLite is recommended for MVP simplicity

---

### ADR-009: Vector Store

**Status:** OPEN DECISION
**Date:** 2026-10-03

#### Context
The RAG pipeline needs a vector store for semantic search over BIS document embeddings.

#### Options
1. **ChromaDB** — Python-native, embedded, simple API
2. **FAISS** — Fast, in-memory, from Meta
3. **Qdrant** — Feature-rich, supports filtering, client-server
4. **PostgreSQL + pgvector** — If using PostgreSQL for application data, could consolidate

#### Chosen Approach
**TBD** — Team needs to decide.

#### Notes
- ChromaDB is recommended for MVP (simple, Python-native, embedded mode)

---

### ADR-010: LLM Provider and Model

**Status:** OPEN DECISION
**Date:** 2026-10-03

#### Context
The system needs an LLM for grounded response generation and an embedding model for vector search.

#### Options
1. **Google Gemini API** — Strong multilingual support, competitive pricing
2. **OpenAI API** — GPT-4o/mini, well-documented, established ecosystem
3. **Local models via Ollama** — Zero cost, full privacy, but requires compute resources
4. **Hybrid** — Use API for generation, local model for embeddings

#### Chosen Approach
**TBD** — Team needs to decide.

#### Notes
- This decision affects cost, latency, quality, multilingual capability, and deployment requirements.

---

### ADR-011: RAG Framework

**Status:** OPEN DECISION
**Date:** 2026-10-03

#### Context
The AI team needs to decide whether to use an existing RAG framework or build a custom pipeline.

#### Options
1. **LangChain** — Most common, large ecosystem, significant abstraction
2. **LlamaIndex** — Designed for document Q&A, strong retrieval features
3. **Custom pipeline** — Full control, minimal dependencies, more development effort

#### Chosen Approach
**TBD** — Team needs to decide based on familiarity and time constraints.

---

### ADR-012: MVP Product Categories

**Status:** OPEN DECISION
**Date:** 2026-10-03

#### Context
The MVP cannot cover all Indian Standards. The team needs to select 3–5 product categories for initial knowledge base development.

#### Options
Possible categories (not exhaustive):
- Domestic electrical appliances (IS 302 series)
- Packaged drinking water (IS 14543)
- Toys safety (IS 9873 series)
- Gold/silver hallmarking (IS 1417, IS 2112)
- Food products (various)
- Cement (IS 269, IS 8112)
- Steel (IS 2062)

#### Chosen Approach
**TBD** — Team needs to decide based on available BIS source documents.

---

### ADR-013: Authentication for MVP

**Status:** OPEN DECISION
**Date:** 2026-10-03

#### Context
Should the MVP require user authentication?

#### Options
1. **No authentication** — Open access, simpler development
2. **Simple API key** — Basic access control
3. **Full user auth (JWT)** — User accounts, saved sessions

#### Chosen Approach
**TBD** — Team needs to decide.

#### Notes
- Recommendation: No authentication for MVP to reduce complexity. Add in Phase 2 if needed.

---

### ADR-014: Multilingual Support Scope for MVP

**Status:** OPEN DECISION
**Date:** 2026-10-03

#### Context
The product spec calls for multilingual support, but the MVP scope needs to be defined.

#### Options
1. **English only for MVP** — Simplest, defer multilingual to Phase 2
2. **English + Hindi for MVP** — Cover the two most spoken languages in India
3. **Full multilingual from day one** — Ambitious, may delay MVP

#### Chosen Approach
**TBD** — Team needs to decide.

#### Notes
- Recommendation: English only for MVP, Hindi in Phase 2.

---

### ADR-015: Response Streaming

**Status:** OPEN DECISION
**Date:** 2026-10-03

#### Context
Should the assistant stream responses token-by-token (like ChatGPT) or return complete responses?

#### Options
1. **Complete response** — Simpler to implement, user waits for full response
2. **Streaming (SSE)** — Better UX for long responses, more complex implementation

#### Chosen Approach
**TBD** — Team needs to decide.

#### Notes
- Recommendation: Complete response for MVP, streaming in Phase 2.

---

### ADR-016: Supabase as Primary Backend Platform

**Status:** DECIDED
**Date:** 2026-10-03
**Deciders:** Full team / Backend Engineer

#### Context
The backend requires a secure, relational application data platform with integrated authentication, Row Level Security, migration tooling, and serverless Edge Functions to orchestrate client requests and AI service integrations.

#### Options
1. Traditional custom Python/FastAPI backend with SQLite/PostgreSQL
2. Node/Express backend with manual auth and ORM
3. Supabase Backend Stack (Supabase Auth + PostgreSQL + Row Level Security + Edge Functions + CLI/Migrations)

#### Chosen Approach
**Option 3: Supabase Backend Stack** with TypeScript Edge Functions and a standalone Node/TypeScript local dev runner.

#### Reason
- Provides enterprise-grade PostgreSQL with declarative SQL migrations and native Row Level Security (RLS) enforcing deny-by-default isolation.
- Integrated Supabase Auth eliminating custom password/session vulnerability risks.
- Edge Functions offer fast, serverless orchestration for client query validation, rate limiting, and external AI/RAG service connectivity.
- Standalone runner ensures continuous local testing and frontend integration without requiring Docker.

#### Consequences
- Application schema and RLS policies are maintained in `supabase/migrations/`.
- Edge Functions are maintained in `supabase/functions/`.
- Backend testing and dev runner are maintained in `backend/`.
- AI/RAG remains a cleanly decoupled downstream service communicating via HTTP.

