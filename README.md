# BIS Intelligent Assistant

> **AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers**

---

## Problem Statement

The Bureau of Indian Standards (BIS) publishes thousands of Indian Standards and operates numerous services — product certification, hallmarking, laboratory recognition, conformity assessment, and more. The information exists, but it is **large, technical, fragmented across documents and portals, and difficult to navigate quickly**.

Users — especially MSMEs, startups, researchers, students, and consumers — struggle to:

- Identify which Indian Standard applies to their product
- Understand certification requirements and applicable schemes
- Navigate licensing and testing procedures
- Find recognized testing laboratories
- Interpret technical BIS clauses and terminology

## Solution

The **BIS Intelligent Assistant** is a domain-specific AI Compliance Copilot that allows users to interact with BIS information using **natural language**. Users do not need to know exact standard numbers, technical terminology, or document locations.

The assistant provides **evidence-backed, source-referenced answers** — never inventing standards, clauses, or certification requirements.

### Core User Journey

```
Product Description / Question
        ↓
  Understand User Intent
        ↓
  Understand Product / Context
        ↓
  Retrieve BIS Knowledge
        ↓
  Identify Relevant Evidence
        ↓
  Generate Grounded Response
        ↓
  Show Sources / Clauses
        ↓
  Guide User to Next Step
```

## Key Capabilities

| Capability | Description |
|:---|:---|
| **BIS Q&A** | Answer natural-language questions about Indian Standards and BIS services |
| **Product → Standard Discovery** | User describes a product; system finds relevant standards with explanations |
| **Certification Guidance** | Explain applicable BIS certification schemes and requirements |
| **Licensing Process Guidance** | Walk users through certification/licensing procedures |
| **Testing Requirement Guidance** | Identify applicable testing requirements |
| **Laboratory Discovery** | Help find relevant recognized testing laboratories |
| **Consumer Support** | Answer consumer queries on BIS marks, hallmarking, certification |
| **Hallmarking Guidance** | Answer hallmarking-related questions |
| **Multilingual Interaction** | Support selected Indian languages while preserving technical terminology |
| **Source-Backed Answers** | Every answer traceable to standard/clause/document references |

## Target Users

- **MSMEs & Startups** — navigating BIS compliance for the first time
- **Industry Professionals** — quickly finding applicable standards and requirements
- **Consumers** — understanding BIS marks, hallmarking, certified products
- **Students & Researchers** — studying Indian Standards and conformity assessment

## High-Level Architecture

```
                    USER
                      ↓
                  FRONTEND
                      ↓
                 BACKEND API
                      ↓
              AI ORCHESTRATION
                      ↓
                RAG / RETRIEVAL
                      ↓
            BIS KNOWLEDGE BASE
                      ↓
              RELEVANT EVIDENCE
                      ↓
               LLM GENERATION
                      ↓
            SOURCE / CITATIONS
                      ↓
               FINAL RESPONSE
```

See [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) for detailed system design.

## Project Structure

```
bis/
├── README.md                      ← You are here
├── docs/
│   ├── product/                   ← Product & planning docs
│   │   ├── PRODUCT_SPEC.md
│   │   ├── USER_FLOWS.md
│   │   ├── ROADMAP.md
│   │   └── DEMO_SCRIPT.md
│   ├── architecture/              ← Architecture & technical design
│   │   ├── ARCHITECTURE.md
│   │   ├── TECH_STACK.md
│   │   ├── DATABASE_SCHEMA.md
│   │   ├── TOPOLOGY_RULES.md
│   │   └── DECISIONS.md
│   ├── ai/                        ← AI/RAG documentation
│   │   ├── AI_PIPELINE.md
│   │   ├── AI_RULES.md
│   │   ├── RAG_DATA_SCHEMA.md
│   │   ├── AI_EVALUATION.md
│   │   ├── PROMPT_INTEGRATION.md
│   │   └── PROMPT_FINAL_AUDIT.md
│   ├── bis/                       ← BIS knowledge & source policy
│   │   ├── BIS_KNOWLEDGE_SPEC.md
│   │   └── BIS_SOURCE_POLICY.md
│   ├── api/                       ← API, security, config
│   │   ├── API_CONTRACT.md
│   │   ├── ERROR_HANDLING.md
│   │   ├── SECURITY.md
│   │   └── ENV_CONFIG.md
│   ├── frontend/                  ← Frontend/UI specification
│   │   └── UI_SPEC.md
│   ├── team/                      ← Team & collaboration
│   │   ├── TEAM_PLAN.md
│   │   ├── GIT_WORKFLOW.md
│   │   ├── BRANCH_OWNERSHIP.md
│   │   └── AGENT_HANDOFF.md
│   └── testing/                   ← Testing strategy
│       └── TESTING.md
├── frontend/                      ← (Future) Frontend source code
├── backend/                       ← (Future) Backend source code
├── ai/                            ← (Future) AI/RAG source code
├── data/                          ← (Future) BIS knowledge data
└── evaluation/                    ← (Future) Evaluation datasets
```

## Development Status

**Current Phase:** Documentation & Planning

Implementation has not yet started. The documentation in `docs/` represents the project blueprint.

## Documentation Guide

| Category | Documents | Purpose |
|:---|:---|:---|
| Product | [PRODUCT_SPEC](docs/product/PRODUCT_SPEC.md), [USER_FLOWS](docs/product/USER_FLOWS.md), [ROADMAP](docs/product/ROADMAP.md), [DEMO_SCRIPT](docs/product/DEMO_SCRIPT.md) | What we're building and why |
| Architecture | [ARCHITECTURE](docs/architecture/ARCHITECTURE.md), [TECH_STACK](docs/architecture/TECH_STACK.md), [DATABASE_SCHEMA](docs/architecture/DATABASE_SCHEMA.md), [TOPOLOGY_RULES](docs/architecture/TOPOLOGY_RULES.md), [DECISIONS](docs/architecture/DECISIONS.md) | How the system is designed |
| AI/RAG | [AI_PIPELINE](docs/ai/AI_PIPELINE.md), [AI_RULES](docs/ai/AI_RULES.md), [RAG_DATA_SCHEMA](docs/ai/RAG_DATA_SCHEMA.md), [AI_EVALUATION](docs/ai/AI_EVALUATION.md), [PROMPT_INTEGRATION](docs/ai/PROMPT_INTEGRATION.md), [PROMPT_FINAL_AUDIT](docs/ai/PROMPT_FINAL_AUDIT.md) | AI behavior, retrieval, evaluation |
| BIS Knowledge | [BIS_KNOWLEDGE_SPEC](docs/bis/BIS_KNOWLEDGE_SPEC.md), [BIS_SOURCE_POLICY](docs/bis/BIS_SOURCE_POLICY.md) | Knowledge structure and source rules |
| API/Backend | [API_CONTRACT](docs/api/API_CONTRACT.md), [ERROR_HANDLING](docs/api/ERROR_HANDLING.md), [SECURITY](docs/api/SECURITY.md), [ENV_CONFIG](docs/api/ENV_CONFIG.md) | Backend interfaces and policies |
| Frontend | [UI_SPEC](docs/frontend/UI_SPEC.md) | User interface specification |
| Team | [TEAM_PLAN](docs/team/TEAM_PLAN.md), [GIT_WORKFLOW](docs/team/GIT_WORKFLOW.md), [BRANCH_OWNERSHIP](docs/team/BRANCH_OWNERSHIP.md), [AGENT_HANDOFF](docs/team/AGENT_HANDOFF.md) | Collaboration and process |
| Testing | [TESTING](docs/testing/TESTING.md) | Test strategy and scenarios |

## Quick Links

- **Start here if you are a new developer:** [TEAM_PLAN](docs/team/TEAM_PLAN.md) → [ARCHITECTURE](docs/architecture/ARCHITECTURE.md) → [API_CONTRACT](docs/api/API_CONTRACT.md)
- **Start here if you are an AI coding agent:** [AGENT_HANDOFF](docs/team/AGENT_HANDOFF.md)
- **Frontend developer:** [UI_SPEC](docs/frontend/UI_SPEC.md) → [API_CONTRACT](docs/api/API_CONTRACT.md) → [USER_FLOWS](docs/product/USER_FLOWS.md)
- **Backend developer:** [API_CONTRACT](docs/api/API_CONTRACT.md) → [DATABASE_SCHEMA](docs/architecture/DATABASE_SCHEMA.md) → [ERROR_HANDLING](docs/api/ERROR_HANDLING.md)
- **AI/RAG developer:** [AI_PIPELINE](docs/ai/AI_PIPELINE.md) → [AI_RULES](docs/ai/AI_RULES.md) → [RAG_DATA_SCHEMA](docs/ai/RAG_DATA_SCHEMA.md)
- **BIS Knowledge/QA:** [BIS_KNOWLEDGE_SPEC](docs/bis/BIS_KNOWLEDGE_SPEC.md) → [BIS_SOURCE_POLICY](docs/bis/BIS_SOURCE_POLICY.md) → [AI_EVALUATION](docs/ai/AI_EVALUATION.md)

---

*This project is developed as part of a hackathon initiative. All BIS-related information used by the system must come from authorized sources. The assistant is an information and decision-support tool — not a legal authority or replacement for BIS.*
