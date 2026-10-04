# BIS Intelligent Assistant

> **AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers**

[![Backend CI / Tests](https://img.shields.io/badge/Tests-58%20Passing-brightgreen)](backend/tests)
[![Backend Status](https://img.shields.io/badge/Backend-Hardened%20%26%20Integration--Ready-success)](backend/)
[![AI Integration Status](https://img.shields.io/badge/AI%20Mode-Mock%20Engine%20(Decoupled)-blue)](backend/src/ai-client.ts)
[![Frontend Status](https://img.shields.io/badge/Frontend-Decoupled%20(Future%20Phase)-orange)](frontend/)

---

## Current Development Status

| Component | Status | Description |
|:---|:---:|:---|
| **Backend Engine** | 🟢 **Ready** | Standalone Node.js native TypeScript service on port 8000 + Supabase Edge Functions |
| **Database & Security** | 🟢 **Ready** | PostgreSQL with Row Level Security (RLS), migrations, and audit logging |
| **Test Suite** | 🟢 **58/58 Passing** | Unit, integration, concurrency, idempotency, and API contract test coverage |
| **AI / RAG Integration** | 🟡 **Mock Mode** | `AI_MOCK_MODE=true` strictly enforced; resilient adapter with circuit breaker |
| **Frontend Integration**| ⚪ **Next Phase** | API contracts defined; client is disconnected during backend hardening |

---

## Problem Statement

The Bureau of Indian Standards (BIS) publishes thousands of Indian Standards and operates numerous conformity assessment services — product certification (ISI Mark), Compulsory Registration Scheme (CRS), hallmarking, and laboratory recognition. The information exists across multiple portals and documents, but it is **large, technical, fragmented, and difficult to navigate quickly**.

Users — especially MSMEs, startups, manufacturers, researchers, and consumers — struggle to:
- Identify which Indian Standard applies to their specific product
- Understand certification requirements, testing procedures, and applicable schemes
- Interpret technical BIS clauses, standards terminology, and quality control orders (QCOs)
- Locate recognized testing laboratories and compliance pathways

---

## Solution

The **BIS Intelligent Assistant** is a domain-specific compliance assistant that allows users to query BIS information using **natural language**.

The assistant provides **evidence-backed, source-referenced answers** — never hallucinating standards, clauses, or mandatory certification requirements.

```text
User Question / Product Description
        ↓
Input Validation & Rate Limiting (Zod + Sliding Window)
        ↓
Auth Context Extraction (User-Scoped RLS Client)
        ↓
Idempotency & Concurrency Check (In-Flight Promise Lock)
        ↓
AI Adapter (Mock Engine or Real Service with Circuit Breaker)
        ↓
Response Sanitization & Citation Verification
        ↓
PostgreSQL Persistence (Sessions, Messages, Citations, Audit Logs)
        ↓
Standardized Response with Follow-Ups & Source Citations
```

---

## Key Backend Capabilities

- **Natural Language Standards Discovery**: Answers compliance queries with precise Indian Standard citations (IS numbers, clauses, and titles).
- **Dual-Client Security Model**: Queries are executed with user-scoped clients respecting PostgreSQL Row Level Security (RLS), while server-side audit logs remain tamper-proof.
- **Concurrency-Safe Idempotency**: Employs an in-memory lock (`inFlightRequests`) and database deduplication via `client_request_id` to prevent duplicate AI invocations during network retries.
- **Resilience & Circuit Breaker**: Wraps external model calls in a 3-state circuit breaker (`CLOSED`, `OPEN`, `HALF_OPEN`) with configurable failure thresholds and automatic cooldown.
- **Audit & Request Tracking**: Tracks every request across an end-to-end lifecycle (`RECEIVED` → `AUTHORIZED` → `AI_PENDING` → `AI_COMPLETED` → `COMPLETED`) with immutable audit logs.
- **Dual Runtime Support**: Operates both as a lightweight native Node.js HTTP server (port 8000) and as Supabase Edge Functions.

---

## High-Level Architecture

```text
                           CLIENT / BROWSER
                                  │
                                  ▼
               ┌──────────────────────────────────────┐
               │    Local Node.js Server / Edge API   │
               │         (Port 8000 / Native HTTP)    │
               └──────────────────┬───────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   CORS & Auth    │    │  Rate Limiting   │    │  Zod Validation  │
│ (Supabase JWT /  │    │ (Sliding Window  │    │(Chat, Pagination,│
│  Guest Access)   │    │  User & IP Keys) │    │  UUIDs, AI Data) │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
               ┌──────────────────────────────────────┐
               │      Application Service Layer       │
               │   • AssistantQueryService (Chat)     │
               │   • ConversationService (Sessions)   │
               │   • HealthService (Health & Ready)   │
               └──────────────────┬───────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│   AI Service Adapter Layer      │       │     Supabase / PostgreSQL       │
│ • MockAIServiceClient (Active)  │       │ • sessions (User RLS)           │
│ • RealAIServiceClient (Adapter) │       │ • messages & citations (RLS)    │
│ • AICircuitBreaker (Resilience) │       │ • assistant_requests & audit    │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

For full details, see [docs/architecture/BACKEND_ARCHITECTURE.md](docs/architecture/BACKEND_ARCHITECTURE.md).

---

## Repository Structure

```text
bis/
├── backend/                       ← ACTIVE: Standalone Node.js backend
│   ├── src/
│   │   ├── services/              ← Modular business logic services
│   │   │   ├── assistant-query.service.ts  ← Chat orchestration & concurrency
│   │   │   ├── conversation.service.ts     ← Sessions & history management
│   │   │   └── health.service.ts           ← Liveness & readiness probes
│   │   ├── ai-client.ts           ← Mock and Real AI service clients
│   │   ├── ai-validator.ts        ← AI response schema validator
│   │   ├── auth.ts                ← JWT extraction & user resolution
│   │   ├── circuit-breaker.ts     ← Fault tolerance circuit breaker
│   │   ├── config.ts              ← 12-factor environment config
│   │   ├── cors.ts                ← CORS preflight & headers
│   │   ├── diagnose.ts            ← Automated backend diagnostic tool
│   │   ├── errors.ts              ← AppError & standardized error envelopes
│   │   ├── logger.ts              ← Structured JSON logger
│   │   ├── mock-db.ts             ← In-memory mock database for offline tests
│   │   ├── rate-limiter.ts        ← Sliding-window user/IP rate limiter
│   │   ├── request-id.ts          ← Distributed tracing request IDs
│   │   ├── server.ts              ← Native Node.js HTTP server (Port 8000)
│   │   ├── services.ts            ← Backwards-compatible service facade
│   │   ├── supabase-client.ts     ← Dual-client factory (User vs Server)
│   │   ├── types.ts               ← TypeScript interfaces & contracts
│   │   └── validation.ts          ← Zod input validation schemas
│   ├── tests/                     ← 58 automated unit & integration tests
│   ├── package.json
│   └── tsconfig.json
├── supabase/                      ← ACTIVE: Supabase database & Edge Functions
│   ├── migrations/                ← Postgres SQL migrations
│   │   ├── 20261003160000_initial_schema.sql
│   │   ├── 20261003160500_rls_policies.sql
│   │   └── 20261004000000_audit_and_request_tracking.sql
│   ├── seed.sql                   ← Seed test data
│   └── functions/                 ← Supabase Edge Functions (chat, health, etc.)
├── docs/                          ← Comprehensive system documentation
│   ├── architecture/              ← BACKEND_ARCHITECTURE.md, TECH_STACK.md, etc.
│   ├── api/                       ← API_CONTRACT.md, openapi.yaml, etc.
│   ├── product/                   ← PRODUCT_SPEC.md, USER_FLOWS.md
│   └── BACKEND_SETUP_AND_INTEGRATION_GUIDE.md  ← Complete step-by-step guide
├── frontend/                      ← (Future Phase) React/Next.js frontend application
└── ai/                            ← (Future Phase) Python/LangChain RAG pipeline
```

---

## Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: `v20.0.0+` (Tested on `v24.20.0`)
- **npm**: `v10.0.0+`
- **Git**

### 2. Environment Configuration
Navigate to the `backend/` directory and configure `.env`:
```bash
cd backend
cp .env.example .env
```

Verify your `.env` variables:
```ini
PORT=8000
NODE_ENV=development
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
AI_MOCK_MODE=true
```

> [!IMPORTANT]
> `AI_MOCK_MODE=true` must remain enabled during the current phase to keep the backend decoupled from external AI services.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run System Diagnostics
Verify runtime compatibility, Supabase database access, and mock engine readiness:
```bash
npm run diagnose
```

### 5. Run the Automated Test Suite
Execute the 58 automated tests using native Node.js `--experimental-strip-types`:
```bash
npm test
```

### 6. Start the Backend Server
```bash
npm run dev
```
The server will start listening at `http://localhost:8000`.

---

## API Endpoints & Testing

All endpoints support both `/api/v1/*` and direct route formats:

| Method | Endpoint | Auth Required | Description |
|:---:|:---|:---:|:---|
| `GET` | `/health` or `/api/v1/health` | No | System health check (database, mock AI, vector store) |
| `GET` | `/ready` or `/api/v1/ready` | No | Kubernetes/container readiness probe |
| `POST` | `/chat` or `/api/v1/chat` | Optional (Guest supported) | Submit compliance query and get cited response |
| `GET` | `/sessions` or `/api/v1/sessions` | Optional | List conversation sessions (isolated per user) |
| `GET` | `/sessions/:id` or `/api/v1/sessions/:id`| Optional | Fetch conversation history with standard citations |
| `DELETE` | `/sessions/:id` or `/api/v1/sessions/:id`| Required if user-owned | Delete a conversation thread safely |

### Example cURL Queries

#### Health Check
```bash
curl -X GET http://localhost:8000/api/v1/health
```

#### Submit a BIS Inquiry
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which Indian Standard applies to domestic electric steam irons?",
    "language": "en"
  }'
```

#### Response Example
```json
{
  "session_id": "5663133a-6aa2-423e-8340-125d598fdb7f",
  "message_id": "662da2cf-a61b-4016-a0cf-9d795d466413",
  "response": {
    "text": "For household electrical appliances such as electric irons, the applicable safety specification is IS 302 (Part 2/Sec 3):2007 read in conjunction with IS 302-1 [1]. Compliance is mandatory under Quality Control Orders (QCOs) [2].",
    "intent": "PRODUCT_DISCOVERY",
    "citations": [
      {
        "index": 1,
        "standard_id": "IS 302 (Part 2/Sec 3):2007",
        "document_title": "Safety of Household and Similar Electrical Appliances — Particular Requirements: Electric Irons",
        "section": "1. Scope",
        "clause": "1.1",
        "snippet": "This standard deals with the safety of electric dry irons and steam irons.",
        "source_document_id": "doc-is-302-2-3"
      }
    ],
    "needs_clarification": false,
    "follow_up_suggestions": [
      "What testing procedures are mandated under IS 302?",
      "How do I find a BIS-recognized laboratory for testing electric irons?"
    ]
  },
  "metadata": {
    "processing_time_ms": 124,
    "created_at": "2026-10-04T05:08:54.716Z"
  }
}
```

---

## Documentation Guide

| Category | Primary References | Description |
|:---|:---|:---|
| **Backend & Integration** | [BACKEND_SETUP_AND_INTEGRATION_GUIDE.md](docs/BACKEND_SETUP_AND_INTEGRATION_GUIDE.md)<br>[BACKEND_ARCHITECTURE.md](docs/architecture/BACKEND_ARCHITECTURE.md) | Authoritative guide for setup, RLS, testing, and future integrations |
| **API Specifications** | [API_CONTRACT.md](docs/api/API_CONTRACT.md)<br>[openapi.yaml](docs/api/openapi.yaml)<br>[ERROR_HANDLING.md](docs/api/ERROR_HANDLING.md) | Complete OpenAPI spec, error codes, and payload contracts |
| **Database & Security** | [DATABASE_SCHEMA.md](docs/architecture/DATABASE_SCHEMA.md)<br>[SECURITY.md](docs/api/SECURITY.md) | PostgreSQL tables, migrations, RLS policies, and token rules |
| **Product & Planning** | [PRODUCT_SPEC.md](docs/product/PRODUCT_SPEC.md)<br>[USER_FLOWS.md](docs/product/USER_FLOWS.md)<br>[ROADMAP.md](docs/product/ROADMAP.md) | Functional scope, personas, user journeys, and delivery phases |
| **AI / RAG Pipeline** | [AI_PIPELINE.md](docs/ai/AI_PIPELINE.md)<br>[AI_RULES.md](docs/ai/AI_RULES.md)<br>[RAG_DATA_SCHEMA.md](docs/ai/RAG_DATA_SCHEMA.md) | Prompt templates, citation constraints, and vector schema |
| **Testing Strategy** | [TESTING.md](docs/testing/TESTING.md) | Test suites, multi-user isolation scenarios, and CI commands |

---

## Quick Links for Developers

- **Backend Developers**: [BACKEND_SETUP_AND_INTEGRATION_GUIDE.md](docs/BACKEND_SETUP_AND_INTEGRATION_GUIDE.md) → [BACKEND_ARCHITECTURE.md](docs/architecture/BACKEND_ARCHITECTURE.md) → [API_CONTRACT.md](docs/api/API_CONTRACT.md)
- **Frontend Developers (Future)**: [API_CONTRACT.md](docs/api/API_CONTRACT.md) → [openapi.yaml](docs/api/openapi.yaml) → [UI_SPEC.md](docs/frontend/UI_SPEC.md)
- **AI/RAG Engineers (Future)**: [AI_PIPELINE.md](docs/ai/AI_PIPELINE.md) → [AI_RULES.md](docs/ai/AI_RULES.md) → [RAG_DATA_SCHEMA.md](docs/ai/RAG_DATA_SCHEMA.md)
- **AI Coding Agents**: [AGENT_HANDOFF.md](docs/team/AGENT_HANDOFF.md)

---

*This project is developed as part of a hackathon initiative. All BIS-related information used by the system must come from authorized sources. The assistant is an information and decision-support tool — not a legal authority or replacement for the Bureau of Indian Standards.*
