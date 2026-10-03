# Team Plan — BIS Intelligent Assistant

> Related: [BRANCH_OWNERSHIP](BRANCH_OWNERSHIP.md) | [GIT_WORKFLOW](GIT_WORKFLOW.md) | [ARCHITECTURE](../architecture/ARCHITECTURE.md) | [TOPOLOGY_RULES](../architecture/TOPOLOGY_RULES.md)

---

## Team Structure

| Member | Role | Primary Responsibility | Ownership |
|:---|:---|:---|:---|
| **Member 1** | Frontend Developer | User interface, chat experience, UX | `frontend/` |
| **Member 2** | Backend Developer | APIs, database, session management, integration | `backend/` |
| **Member 3** | AI / RAG Engineer | RAG pipeline, retrieval, generation, prompts | `ai/` |
| **Member 4** | BIS Knowledge / QA | Knowledge base, data, evaluation, testing | `data/`, `evaluation/` |

---

## Detailed Responsibilities

### Member 1 — Frontend

| Area | Tasks |
|:---|:---|
| **Chat UI** | Message display, input, loading/error states |
| **Citation Display** | Source cards, expandable evidence panels |
| **Product Input** | Free-text (MVP) and guided input (future) |
| **Compliance Journey UI** | Visual stepper for Standard → Testing → Certification |
| **Language Selection** | Language switcher, UI localization |
| **Responsive Design** | Desktop, tablet, and mobile layouts |
| **Accessibility** | Keyboard nav, screen reader support, contrast |
| **API Integration** | Consume backend API per [API_CONTRACT.md](../api/API_CONTRACT.md) |

**Key documents:** [UI_SPEC](../frontend/UI_SPEC.md), [API_CONTRACT](../api/API_CONTRACT.md), [USER_FLOWS](../product/USER_FLOWS.md)

### Member 2 — Backend

| Area | Tasks |
|:---|:---|
| **API Endpoints** | Implement endpoints per [API_CONTRACT.md](../api/API_CONTRACT.md) |
| **Session Management** | Create, retrieve, delete sessions |
| **Message Persistence** | Store user messages and AI responses |
| **Citation Storage** | Persist citation data with messages |
| **AI Service Integration** | Connect to AI pipeline, forward queries, return responses |
| **Input Validation** | Validate all user inputs on the backend |
| **Error Handling** | Implement per [ERROR_HANDLING.md](../api/ERROR_HANDLING.md) |
| **Security** | CORS, rate limiting, secrets management |
| **Database** | Schema implementation, migrations |

**Key documents:** [API_CONTRACT](../api/API_CONTRACT.md), [DATABASE_SCHEMA](../architecture/DATABASE_SCHEMA.md), [ERROR_HANDLING](../api/ERROR_HANDLING.md), [SECURITY](../api/SECURITY.md)

### Member 3 — AI / RAG

| Area | Tasks |
|:---|:---|
| **Query Processing** | Parse, normalize, rewrite queries |
| **Intent Detection** | Classify query types |
| **Retrieval Engine** | Implement semantic + optional lexical search |
| **Context Management** | Multi-turn conversation context handling |
| **Prompt Engineering** | System prompts, evidence injection, output formatting |
| **LLM Integration** | Connect to LLM provider, manage API calls |
| **Citation Extraction** | Map generated claims to retrieved evidence |
| **Anti-Hallucination** | Implement pipeline-level guardrails |
| **Embedding Pipeline** | Generate and store document embeddings |
| **AI Evaluation** | Run evaluation tests, measure quality metrics |

**Key documents:** [AI_PIPELINE](../ai/AI_PIPELINE.md), [AI_RULES](../ai/AI_RULES.md), [PROMPT_INTEGRATION](../ai/PROMPT_INTEGRATION.md), [RAG_DATA_SCHEMA](../ai/RAG_DATA_SCHEMA.md)

### Member 4 — BIS Knowledge / QA

| Area | Tasks |
|:---|:---|
| **Source Acquisition** | Obtain authorized BIS documents |
| **Document Processing** | Extract text, structure, and metadata from BIS sources |
| **Chunking** | Split documents into retrieval-ready chunks |
| **Metadata Tagging** | Tag documents with standard numbers, categories, etc. |
| **Knowledge Base QA** | Verify completeness, accuracy, and structure |
| **Evaluation Datasets** | Create golden test cases for AI evaluation |
| **Answer Verification** | Test AI responses for accuracy against source documents |
| **Hallucination Auditing** | Verify that the system does not invent BIS information |
| **End-to-End Testing** | Validate complete user flows |
| **Integration Support** | Help connect data pipeline with AI and backend |

**Key documents:** [BIS_KNOWLEDGE_SPEC](../bis/BIS_KNOWLEDGE_SPEC.md), [BIS_SOURCE_POLICY](../bis/BIS_SOURCE_POLICY.md), [AI_EVALUATION](../ai/AI_EVALUATION.md), [RAG_DATA_SCHEMA](../ai/RAG_DATA_SCHEMA.md)

---

## Collaboration Rules

### 1. Own Your Domain

Each member has primary ownership of their directory. Other members should not modify files in your domain without discussion and a PR.

### 2. Communicate at Interfaces

The most important collaboration points are the **interfaces between layers**:

| Interface | Between | Contract |
|:---|:---|:---|
| REST API | Frontend ↔ Backend | [API_CONTRACT.md](../api/API_CONTRACT.md) |
| AI Service | Backend ↔ AI | [AI_PIPELINE.md](../ai/AI_PIPELINE.md) |
| Knowledge Schema | AI ↔ Knowledge Base | [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md) |

**Rule:** Agree on the interface before implementing on either side.

### 3. Shared Files Need Team Review

Changes to shared files require review from affected members:

| Shared File | Reviewers |
|:---|:---|
| `README.md` | All members |
| `shared/schemas/` | All affected members |
| `API_CONTRACT.md` | Member 1 + Member 2 |
| `AI_PIPELINE.md` (service interface) | Member 2 + Member 3 |
| `RAG_DATA_SCHEMA.md` | Member 3 + Member 4 |
| `.env.example` | All members |

### 4. Resolve Conflicts Early

If you need to make changes that affect another team member's domain:

1. Discuss before making the change
2. Open a PR — do not push directly
3. Get the domain owner's approval
4. Update documentation if the interface changes

### 5. Documentation Responsibility

| Docs Category | Primary Owner |
|:---|:---|
| Product docs (`docs/product/`) | Team-wide (any member can update) |
| Architecture docs (`docs/architecture/`) | Member 2 + Member 3 |
| AI docs (`docs/ai/`) | Member 3 |
| BIS docs (`docs/bis/`) | Member 4 |
| API docs (`docs/api/`) | Member 2 |
| Frontend docs (`docs/frontend/`) | Member 1 |
| Team docs (`docs/team/`) | Team-wide |
| Testing docs (`docs/testing/`) | Member 4 (primary), all contribute |

---

## Integration Responsibilities

| Integration | Primary | Supporting |
|:---|:---|:---|
| Frontend ↔ Backend | Member 2 | Member 1 |
| Backend ↔ AI | Member 2 | Member 3 |
| AI ↔ Knowledge Base | Member 3 | Member 4 |
| End-to-End | Member 4 | All members |

---

## Review Responsibilities

| What | Reviewer |
|:---|:---|
| Frontend PR | Member 1 (primary), Member 2 (API usage) |
| Backend PR | Member 2 (primary), Member 3 (AI integration) |
| AI/RAG PR | Member 3 (primary), Member 4 (knowledge accuracy) |
| Knowledge/Data PR | Member 4 (primary), Member 3 (retrieval impact) |
| Cross-domain PR | All affected domain owners |
