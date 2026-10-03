# Tech Stack — BIS Intelligent Assistant

> Related: [ARCHITECTURE](ARCHITECTURE.md) | [DECISIONS](DECISIONS.md) | [ENV_CONFIG](../api/ENV_CONFIG.md)

---

## Overview

This document records the technology choices for each layer of the system. Where a decision has not been finalized, it is marked **STATUS: TBD** with context on what needs to be decided.

---

## Frontend

| Concern | Technology | Status |
|:---|:---|:---|
| **Framework** | | **STATUS: TBD** — Options: React (Vite), Next.js, or Vanilla HTML/CSS/JS. Team needs to decide based on complexity requirements and member familiarity. |
| **Styling** | CSS (Vanilla or framework) | **STATUS: TBD** — Vanilla CSS is the default. TailwindCSS only if team explicitly chooses it. |
| **State Management** | | **STATUS: TBD** — Depends on framework choice. React Context, Zustand, or equivalent. |
| **HTTP Client** | `fetch` API or Axios | **STATUS: TBD** |
| **Markdown Rendering** | | **STATUS: TBD** — Needed if AI responses are returned in Markdown. Options: marked, react-markdown. |
| **Build Tool** | | **STATUS: TBD** — Depends on framework choice. Vite is preferred for React. |

### Frontend Decision Needed

> The team must decide: **React (Vite)** vs. **Next.js** vs. **Vanilla HTML/CSS/JS**.
>
> Recommendation context:
> - Vanilla is simplest but may limit UI complexity for citation panels, compliance journey, etc.
> - React (Vite) provides component-based architecture with fast dev experience.
> - Next.js adds SSR which may not be needed for a chat-based application.

---

## Backend

| Concern | Technology | Status |
|:---|:---|:---|
| **Language** | Python | Recommended — native ecosystem for AI/ML integration |
| **Framework** | | **STATUS: TBD** — Options: FastAPI (recommended for async + AI integration), Flask, Express.js (Node.js). |
| **API Style** | REST | Confirmed for MVP |
| **Real-time** | | **STATUS: TBD** — WebSocket or SSE for streaming responses (optional for MVP). |
| **Authentication** | | **STATUS: TBD** — May not be needed for MVP. Options: JWT, session-based, API key. |
| **CORS** | Required for frontend-backend separation | |

### Backend Decision Needed

> The team must decide: **Python (FastAPI)** vs. **Python (Flask)** vs. **Node.js (Express)**.
>
> Python (FastAPI) is recommended because:
> - Native async support
> - Auto-generated API docs (OpenAPI)
> - Same language as AI/RAG layer, simplifying integration

---

## Database (Application Data)

| Concern | Technology | Status |
|:---|:---|:---|
| **Database Engine** | | **STATUS: TBD** — Options: SQLite (simplest for MVP), PostgreSQL (production-grade), or in-memory/file-based storage. |
| **ORM / Query Layer** | | **STATUS: TBD** — Options: SQLAlchemy (Python), Prisma (Node.js), raw SQL. |
| **Migrations** | | **STATUS: TBD** — Options: Alembic (SQLAlchemy), manual scripts. |

### Database Decision Needed

> For MVP, **SQLite** is likely sufficient (zero-config, single-file). If the team anticipates multi-user deployment, PostgreSQL should be considered.

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for schema design.

---

## Vector Database / Search (RAG)

| Concern | Technology | Status |
|:---|:---|:---|
| **Vector Store** | | **STATUS: TBD** — Options: ChromaDB (simple, Python-native), FAISS (fast, in-memory), Qdrant (feature-rich), PostgreSQL + pgvector. |
| **Lexical Search** | | **STATUS: TBD** — Options: BM25 (via rank_bm25 library), built-in vector DB keyword search, SQLite FTS. |
| **Hybrid Search** | Combine semantic + lexical results | Recommended approach, implementation TBD |
| **Reranking** | | **STATUS: TBD** — Options: Cross-encoder reranker, Cohere Rerank, custom scoring. |

### Vector DB Decision Needed

> For MVP, **ChromaDB** (Python-native, embedded, simple API) is a strong candidate. Team should evaluate based on scale requirements and deployment constraints.

---

## LLM / AI Provider

| Concern | Technology | Status |
|:---|:---|:---|
| **LLM Provider** | | **STATUS: TBD** — Options: Google Gemini API, OpenAI API, local open-source models (via Ollama), or a combination. |
| **LLM Model** | | **STATUS: TBD** — Depends on provider choice. |
| **Embedding Model** | | **STATUS: TBD** — Options: Google embedding models, OpenAI `text-embedding-3-small/large`, open-source sentence transformers. |
| **Embedding Dimensions** | | **STATUS: TBD** — Depends on embedding model choice. |

### LLM Decision Needed

> This is a critical decision that affects cost, latency, quality, and deployment.
>
> Key considerations:
> - API-based models (Gemini, OpenAI) offer high quality but require API keys and have cost implications.
> - Local models (Ollama + Mistral/Llama) offer privacy and zero cost but require compute resources.
> - Embedding model should match the vector store's requirements.

---

## AI / RAG Libraries

| Concern | Technology | Status |
|:---|:---|:---|
| **RAG Framework** | | **STATUS: TBD** — Options: LangChain, LlamaIndex, custom pipeline. |
| **Document Processing** | | **STATUS: TBD** — Options: PyMuPDF, pdfplumber, unstructured, custom extraction. |
| **Text Chunking** | | **STATUS: TBD** — Options: RecursiveCharacterTextSplitter (LangChain), custom hierarchical chunker. |
| **Prompt Management** | | **STATUS: TBD** — Options: LangChain prompts, Jinja2 templates, custom. |

### RAG Framework Decision Needed

> **LangChain** is the most common choice but adds significant abstraction. **Custom pipeline** offers more control but requires more effort. Team should decide based on familiarity and time constraints.

---

## Infrastructure / Deployment

| Concern | Technology | Status |
|:---|:---|:---|
| **Hosting** | | **STATUS: TBD** — Options: Local demo, cloud VM, PaaS (Railway, Render), Docker. |
| **Containerization** | | **STATUS: TBD** — Docker recommended for reproducibility but not required for MVP. |
| **CI/CD** | | **STATUS: TBD** — GitHub Actions is a natural choice given the repository is on GitHub. |
| **Environment Management** | `.env` files | See [ENV_CONFIG.md](../api/ENV_CONFIG.md) |

---

## Monitoring / Logging

| Concern | Technology | Status |
|:---|:---|:---|
| **Application Logging** | Python `logging` module | Recommended default |
| **Error Tracking** | | **STATUS: TBD** — Options: Sentry, simple file-based logging for MVP. |
| **AI Observability** | | **STATUS: TBD** — Options: LangSmith, custom logging, none for MVP. |

---

## Summary of Open Decisions

| # | Decision | Options | Blocking |
|:--|:---------|:--------|:---------|
| 1 | Frontend framework | React (Vite) / Next.js / Vanilla | Frontend development |
| 2 | Backend framework | FastAPI / Flask / Express | Backend development |
| 3 | Application database | SQLite / PostgreSQL | Backend development |
| 4 | Vector store | ChromaDB / FAISS / Qdrant / pgvector | AI/RAG development |
| 5 | LLM provider & model | Gemini / OpenAI / Local (Ollama) | AI/RAG development |
| 6 | Embedding model | Google / OpenAI / Sentence Transformers | AI/RAG development |
| 7 | RAG framework | LangChain / LlamaIndex / Custom | AI/RAG development |
| 8 | Document processing | PyMuPDF / pdfplumber / unstructured | Knowledge base preparation |
| 9 | Deployment target | Local / Cloud / Docker | All teams |

These decisions should be resolved **before implementation begins**. See [DECISIONS.md](DECISIONS.md).
