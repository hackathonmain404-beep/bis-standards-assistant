# Roadmap — BIS Intelligent Assistant

> Related: [PRODUCT_SPEC](PRODUCT_SPEC.md) | [ARCHITECTURE](../architecture/ARCHITECTURE.md) | [TECH_STACK](../architecture/TECH_STACK.md)

---

## Overview

This roadmap defines the phased delivery plan for the BIS Intelligent Assistant. It prioritizes a reliable, demonstrable MVP before expanding scope.

**Guiding principle:** A small system that works accurately and provides source-backed answers is more valuable than a large system that hallucinates.

---

## Phase 1 — MVP (Core Prototype)

**Goal:** A working end-to-end prototype demonstrating the core product concept — natural-language interaction with BIS information, grounded in retrieved evidence.

### Deliverables

| Area | Deliverable | Priority |
|:---|:---|:---|
| **Knowledge Base** | Curated BIS knowledge for selected product categories (3–5 standards), chunked with metadata | **P0** |
| **AI/RAG** | Working RAG pipeline: query understanding → retrieval → grounded generation | **P0** |
| **AI/RAG** | Anti-hallucination guardrails and source citation in responses | **P0** |
| **Backend** | Chat API endpoint with session/context management | **P0** |
| **Frontend** | Chat interface with message display and source citation UI | **P0** |
| **Integration** | End-to-end: user query → backend → AI → knowledge → response → UI | **P0** |
| **AI/RAG** | Product → Standard discovery for selected categories | **P0** |
| **AI/RAG** | Context-aware multi-turn conversation | **P1** |
| **AI/RAG** | Clarification question generation when information is insufficient | **P1** |
| **Frontend** | Compliance journey display (standard → testing → certification) | **P1** |
| **Backend** | Conversation history persistence | **P1** |
| **Evaluation** | Golden test dataset for selected product categories | **P1** |

### Exit Criteria

- [ ] User can ask a BIS question and receive a grounded, source-cited answer
- [ ] User can describe a product and receive relevant standard recommendations with explanations
- [ ] System clearly indicates when it cannot find relevant evidence
- [ ] System does not hallucinate standard numbers, clauses, or schemes
- [ ] End-to-end demo flow runs without errors

---

## Phase 2 — Enhanced Capabilities

**Goal:** Broaden coverage, improve AI quality, and add important secondary features.

### Deliverables

| Area | Deliverable | Priority |
|:---|:---|:---|
| **Knowledge Base** | Expanded knowledge base — additional product categories and standards | **P0** |
| **AI/RAG** | Improved retrieval accuracy (hybrid search, reranking) | **P0** |
| **AI/RAG** | Certification and licensing process guidance | **P0** |
| **AI/RAG** | Testing requirement extraction and display | **P1** |
| **Knowledge Base** | Laboratory directory integration | **P1** |
| **AI/RAG** | Hindi language support | **P1** |
| **Frontend** | Product input wizard (guided attribute entry) | **P1** |
| **Frontend** | Enhanced citation inspector (expandable source cards) | **P1** |
| **Backend** | API hardening — input validation, rate limiting, error handling | **P1** |
| **Evaluation** | Expanded evaluation dataset and automated testing | **P2** |

### Exit Criteria

- [ ] Certification guidance available for covered standards
- [ ] Testing requirements surfaced for covered standards
- [ ] Laboratory information available where data exists
- [ ] Hindi responses maintain accuracy and preserve technical terminology
- [ ] Retrieval accuracy improved over Phase 1 baseline

---

## Phase 3 — Production Readiness (Future)

**Goal:** Harden the system for broader use and add advanced features.

### Potential Deliverables

| Area | Deliverable |
|:---|:---|
| **AI/RAG** | Additional Indian language support |
| **AI/RAG** | Advanced compliance journey — full guided workflow |
| **Knowledge Base** | QCO (Quality Control Order) tracking and integration |
| **Knowledge Base** | Hallmarking knowledge module |
| **Knowledge Base** | Consumer-focused information module |
| **Frontend** | Compliance report generation |
| **Frontend** | Responsive mobile experience |
| **Backend** | User authentication and profile management |
| **Backend** | Saved conversations and compliance reports |
| **Infrastructure** | Production deployment pipeline |
| **Infrastructure** | Monitoring and observability |

---

## Technical Milestones

```
M1: Knowledge base ready for MVP standards
        ↓
M2: RAG pipeline returning relevant chunks for test queries
        ↓
M3: Backend API serving chat responses
        ↓
M4: Frontend displaying responses with citations
        ↓
M5: End-to-end integration complete
        ↓
M6: Evaluation pass on golden test dataset
        ↓
M7: Demo-ready prototype
```

---

## Dependencies

| Dependency | Blocks | Status |
|:---|:---|:---|
| BIS source documents acquired and processed | AI/RAG, Evaluation | **STATUS: TBD** — Team needs to confirm which documents are available |
| Technology stack finalized | All development | **STATUS: TBD** — See [TECH_STACK.md](../architecture/TECH_STACK.md) |
| API contract agreed | Frontend ↔ Backend integration | **STATUS: TBD** — See [API_CONTRACT.md](../api/API_CONTRACT.md) |
| AI service interface agreed | Backend ↔ AI integration | **STATUS: TBD** — See [AI_PIPELINE.md](../ai/AI_PIPELINE.md) |
| RAG data schema agreed | AI ↔ Knowledge Base | **STATUS: TBD** — See [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md) |
| MVP product categories selected | Knowledge Base, Evaluation | **STATUS: TBD** — Team needs to select 3–5 initial categories |

---

## Priority Legend

| Priority | Meaning |
|:---|:---|
| **P0** | Must have for this phase |
| **P1** | Should have — high value, implement if time allows |
| **P2** | Nice to have — defer if necessary |

---

## Important Notes

1. **No unrealistic timelines.** This roadmap describes priority and sequence, not calendar dates.
2. **MVP scope is intentionally narrow.** Reliable accuracy on a small set of standards is more valuable than poor accuracy on many.
3. **Phase transitions require team review.** Do not proceed to the next phase until exit criteria are met.
4. **Dependencies must be resolved before implementation begins.** See [DECISIONS.md](../architecture/DECISIONS.md) for open decisions.
