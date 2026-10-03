# Topology Rules — BIS Intelligent Assistant

> Related: [ARCHITECTURE](ARCHITECTURE.md) | [BRANCH_OWNERSHIP](../team/BRANCH_OWNERSHIP.md) | [API_CONTRACT](../api/API_CONTRACT.md)

---

## Purpose

This document defines the repository structure, module boundaries, dependency rules, and isolation principles. It ensures that the four team members can work independently with minimal conflicts and that the system architecture remains clean.

---

## 1. Repository Structure

```
bis/
├── README.md
├── docs/                          ← Documentation (shared)
│   ├── product/
│   ├── architecture/
│   ├── ai/
│   ├── bis/
│   ├── api/
│   ├── frontend/
│   ├── team/
│   └── testing/
│
├── frontend/                      ← MEMBER 1 ownership
│   ├── public/                    ← Static assets
│   ├── src/                       ← Frontend source code
│   │   ├── components/            ← UI components
│   │   ├── pages/                 ← Page layouts
│   │   ├── services/              ← API client / HTTP layer
│   │   ├── utils/                 ← Frontend utilities
│   │   ├── styles/                ← CSS / stylesheets
│   │   └── i18n/                  ← Internationalization
│   ├── package.json
│   └── ...
│
├── backend/                       ← MEMBER 2 ownership
│   ├── app/                       ← Backend application
│   │   ├── api/                   ← API route handlers
│   │   ├── models/                ← Database models
│   │   ├── services/              ← Business logic services
│   │   ├── config/                ← Configuration
│   │   └── utils/                 ← Backend utilities
│   ├── requirements.txt
│   └── ...
│
├── ai/                            ← MEMBER 3 ownership
│   ├── pipeline/                  ← RAG pipeline modules
│   │   ├── query/                 ← Query parsing & intent detection
│   │   ├── retrieval/             ← Retrieval engine
│   │   ├── generation/            ← Prompt building & LLM generation
│   │   └── citation/              ← Citation extraction
│   ├── prompts/                   ← Prompt templates
│   ├── config/                    ← AI configuration
│   ├── requirements.txt
│   └── ...
│
├── data/                          ← MEMBER 4 ownership
│   ├── raw/                       ← Raw BIS source documents
│   ├── processed/                 ← Processed/chunked documents
│   ├── embeddings/                ← Generated embeddings (if file-based)
│   ├── metadata/                  ← Standard/category metadata
│   └── scripts/                   ← Data processing scripts
│
├── evaluation/                    ← MEMBER 4 ownership
│   ├── datasets/                  ← Golden test datasets
│   ├── results/                   ← Evaluation results
│   └── scripts/                   ← Evaluation scripts
│
├── shared/                        ← SHARED (changes require team agreement)
│   ├── schemas/                   ← Shared data schemas / contracts
│   └── constants/                 ← Shared constants
│
└── .env.example                   ← Environment variable template
```

---

## 2. Module Boundaries

### Strict Ownership Rules

| Directory | Owner | Other Members May |
|:---|:---|:---|
| `frontend/` | Member 1 (Frontend) | Read only. Propose changes via PR. |
| `backend/` | Member 2 (Backend) | Read only. Propose changes via PR. |
| `ai/` | Member 3 (AI/RAG) | Read only. Propose changes via PR. |
| `data/` | Member 4 (BIS/QA) | Read only. Propose changes via PR. |
| `evaluation/` | Member 4 (BIS/QA) | Read only. Propose changes via PR. |
| `docs/` | All members | Each member owns their domain's docs. Shared docs require review. |
| `shared/` | All members | Changes require agreement from affected members. |
| `README.md` | All members | Changes require team review. |

---

## 3. Dependency Direction

### Allowed Dependencies

```
frontend/ ──depends on──▶ Backend API (via HTTP)
                          NEVER imports backend/ or ai/ code directly

backend/  ──depends on──▶ ai/ (as a service/module)
                          NEVER imports frontend/ code
                          NEVER accesses vector DB directly

ai/       ──depends on──▶ data/ knowledge base (via vector DB / retrieval)
                          NEVER imports frontend/ or backend/ code

data/     ──depends on──▶ Nothing (leaf dependency)
                          Provides data to ai/ via the knowledge base
```

### Visual Dependency Graph

```
┌──────────┐
│ frontend │ ────HTTP────▶ ┌──────────┐
└──────────┘               │ backend  │ ──import──▶ ┌────────┐
                           └──────────┘             │  ai/   │
                                                    └────┬───┘
                                                         │
                                                    query/read
                                                         │
                                                         ▼
                                                    ┌────────┐
                                                    │ data/  │
                                                    │ (KB)   │
                                                    └────────┘
```

### Forbidden Dependencies

| From | To | Why |
|:---|:---|:---|
| `frontend/` | `backend/` (import) | Frontend communicates via HTTP API only |
| `frontend/` | `ai/` | Frontend must never access AI logic directly |
| `frontend/` | `data/` | Frontend must never access the knowledge base directly |
| `backend/` | `frontend/` | Backend must not depend on UI code |
| `ai/` | `frontend/` | AI layer must not depend on UI code |
| `ai/` | `backend/` | AI layer must not depend on backend infrastructure |
| `data/` | `frontend/`, `backend/`, `ai/` | Data layer is a leaf — it provides data, never consumes application logic |

---

## 4. Shared Interfaces

Communication between layers happens through **explicit contracts**, not direct imports (except `backend/ → ai/` which may use direct Python imports if both are Python).

### Interface Points

| Interface | Between | Contract Document |
|:---|:---|:---|
| **REST API** | Frontend ↔ Backend | [API_CONTRACT.md](../api/API_CONTRACT.md) |
| **AI Service Interface** | Backend ↔ AI | [AI_PIPELINE.md](../ai/AI_PIPELINE.md), [PROMPT_INTEGRATION.md](../ai/PROMPT_INTEGRATION.md) |
| **RAG Data Schema** | AI ↔ Knowledge Base | [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md) |

### Shared Contract Rules

1. **Define before implement.** Agree on the interface contract before writing code on either side.
2. **Document changes.** Any change to a shared interface must update the contract document.
3. **Version if necessary.** If a breaking change is needed, communicate it to all affected teams.
4. **Shared schemas go in `shared/`.** If both backend and AI need the same data structure, define it once in `shared/schemas/`.

---

## 5. Avoiding Circular Dependencies

### Rules

1. **Dependency flows downward.** Frontend → Backend → AI → Data. Never upward.
2. **No mutual imports.** If module A imports from module B, module B must NOT import from module A.
3. **Use interfaces, not implementations.** Depend on the contract (function signature, schema) not the implementation.
4. **Shared code goes in `shared/`.** If two modules need the same utility, extract it to `shared/` rather than creating a two-way dependency.

### Circular Dependency Detection

If you find yourself needing module A to import from module B AND module B to import from module A:

1. **Extract the shared dependency** into `shared/`.
2. **Use dependency injection** — pass the dependency as a parameter rather than importing it.
3. **Re-evaluate the architecture** — circular dependencies usually indicate a boundary problem.

---

## 6. File Naming Conventions

| Concern | Convention |
|:---|:---|
| **Source files** | `snake_case.py` (Python), `camelCase.js` or `PascalCase.jsx` (JavaScript/React) |
| **Documentation** | `UPPER_CASE.md` for top-level docs, `lower_case.md` for supporting docs |
| **Directories** | `lower_case/` |
| **Configuration** | `lower_case.json`, `lower_case.yaml` |
| **Environment** | `.env`, `.env.example` |
| **Tests** | `test_*.py` (Python), `*.test.js` (JavaScript) |

---

## 7. What Goes Where — Quick Reference

| I need to... | Put it in... |
|:---|:---|
| Add a UI component | `frontend/src/components/` |
| Add an API endpoint | `backend/app/api/` |
| Add a database model | `backend/app/models/` |
| Add RAG retrieval logic | `ai/pipeline/retrieval/` |
| Add a prompt template | `ai/prompts/` |
| Add a BIS source document | `data/raw/` |
| Add a processed chunk file | `data/processed/` |
| Add a test dataset | `evaluation/datasets/` |
| Add a shared schema | `shared/schemas/` |
| Add documentation | `docs/<category>/` |
| Add an API client service (frontend) | `frontend/src/services/` |
