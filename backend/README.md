# BIS Intelligent Assistant — Backend Application Layer

This directory and the accompanying `supabase/` directory contain the complete server-side application layer for the **BIS Intelligent Assistant**, built using **Supabase** (PostgreSQL + RLS + Auth + Edge Functions) and Node/TypeScript.

---

## 1. Architectural Role

The Backend functions strictly as the **Secure Application and Orchestration Layer**:
- **Authentication & User Profiles**: Supabase Auth integration, managing user sessions and linking to application profiles.
- **Application Database**: Supabase PostgreSQL storing conversation sessions, messages, citations, and system configuration.
- **Data Protection & Authorization**: Strict PostgreSQL Row Level Security (RLS) policies enforcing a **DENY BY DEFAULT** posture with user isolation.
- **Serverless API Execution**: Small, domain-driven Supabase Edge Functions with input sanitization, rate limiting, and standard error handling.
- **AI/RAG Integration**: Server-to-server HTTP abstraction (`AIServiceClient`) with AbortController timeouts, bounded exponential backoff retries, response schema validation, and mock mode for offline development.
- **Zero Hallucination / Evidence Transport**: Preserves and structures citation evidence from the AI/RAG layer without fabricating standards or clauses.

---

## 2. Directory Structure

```
├── backend/
│   ├── src/
│   │   ├── types.ts            # Public API, AI Service, and DB TypeScript interfaces
│   │   ├── errors.ts           # AppError class and RFC-compliant error formatter
│   │   ├── validation.ts       # Input validation (UUIDs, length limits, language whitelisting)
│   │   ├── request-id.ts       # X-Request-ID extraction and generation
│   │   ├── cors.ts             # Dynamic CORS headers and preflight handling
│   │   ├── rate-limiter.ts     # In-memory sliding-window rate limiter
│   │   ├── logger.ts           # Structured JSON logger with secret redaction
│   │   ├── config.ts           # Environment configuration loader
│   │   ├── ai-validator.ts     # Untrusted downstream AI response validator
│   │   ├── ai-client.ts        # AIServiceClient (Mock & Real HTTP clients)
│   │   ├── supabase-client.ts  # User-scoped & Privileged Supabase clients
│   │   ├── mock-db.ts          # Deterministic in-memory database fallback
│   │   ├── services.ts         # AssistantQueryService, ConversationService, HealthService
│   │   └── server.ts           # Standalone HTTP dev server on port 8000
│   ├── tests/
│   │   ├── validation.test.ts  # Input validation tests (8 tests)
│   │   ├── errors.test.ts      # Error handling tests (4 tests)
│   │   ├── ai-validator.test.ts# Downstream AI validator tests (5 tests)
│   │   ├── ai-client.test.ts   # AI client and timeout/retry tests (5 tests)
│   │   ├── rate-limiter.test.ts# Rate limiter tests (3 tests)
│   │   ├── rls-schema.test.ts  # Migration and RLS SQL integrity tests (3 tests)
│   │   ├── services.test.ts    # Service logic & idempotency tests (5 tests)
│   │   └── api-contract.test.ts# End-to-end HTTP API contract tests (5 tests)
│   ├── openapi.yaml            # Machine-readable OpenAPI 3.1.0 specification
│   ├── package.json            # Node/TypeScript configuration
│   └── .env.example            # Environment variables template
│
└── supabase/
    ├── config.toml             # Supabase project configuration
    ├── seed.sql                # Deterministic seed data with mock fixtures
    ├── migrations/
    │   ├── 20261003160000_initial_schema.sql  # Users, Sessions, Messages, Citations, AppConfig
    │   └── 20261003160500_rls_policies.sql    # Strict RLS deny-by-default policies
    └── functions/
        ├── _shared/            # Shared Edge Function utilities
        ├── chat/               # Edge Function: POST /api/v1/chat
        ├── sessions/           # Edge Function: GET/DELETE /api/v1/sessions
        ├── health/             # Edge Function: GET /api/v1/health
        └── v1/                 # Unified Gateway Edge Function
```

---

## 3. Database Schema & RLS

All tables are defined in `supabase/migrations/`:
- `public.users`: Application profiles linked to `auth.users(id)` with cascade deletion.
- `public.sessions`: Conversation threads with `user_id` foreign key, `title`, `language`, and timestamps.
- `public.messages`: Individual conversation turns (`role IN ('user', 'assistant', 'system')`), with `client_request_id` for idempotency.
- `public.citations`: Grounded source evidence (`standard_id`, `document_title`, `clause`, `section`, `snippet`) linked to assistant messages.
- `public.app_config`: System configuration flags and limits.

### Row Level Security (RLS)
- **Deny by default**: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on all tables.
- **User Isolation**: `auth.uid() = user_id` for sessions. Messages and citations require ownership of the parent session. User A cannot read, modify, or delete User B's sessions or messages.
- **Public Config**: `app_config` has read-only access for `anon` and `authenticated` roles; modifications are restricted to `service_role`.

---

## 4. API Endpoints

Base URL: `/api/v1` (or `/functions/v1/v1` in Supabase)

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| `POST` | `/api/v1/chat` | Send user message, receive grounded response with citations | Optional / Authenticated |
| `GET` | `/api/v1/sessions` | List conversation sessions (supports `?limit=20&offset=0`) | Optional / Authenticated |
| `GET` | `/api/v1/sessions/{id}` | Get full conversation history with citations | Owner only |
| `DELETE` | `/api/v1/sessions/{id}` | Delete conversation session and messages | Owner only |
| `GET` | `/api/v1/health` | Health check assessing database and AI readiness | Public |

Machine-readable OpenAPI specification is maintained in `backend/openapi.yaml` and `docs/api/openapi.yaml`.

---

## 5. Local Development

### Prerequisites
- Node.js v24+
- (Optional) Docker for local Supabase CLI

### Setup
```bash
cd backend
npm install
cp .env.example .env
```

### Running Local Development Server
To run the backend server on `http://localhost:8000`:
```bash
npm run dev
```
In mock mode (`AI_MOCK_MODE=true` and `SUPABASE_MOCK=true`), the server runs completely offline with zero Docker or cloud dependencies, returning deterministic test responses with citations for domestic electric irons (IS 302) and packaged drinking water (IS 14543).

### Running Automated Test Suite
To run all 38 automated unit, contract, and RLS tests:
```bash
npm test
```

---

## 6. Integration Boundaries

- **Frontend**: Connects exclusively via HTTP REST to `/api/v1/*`. Receives standard structured JSON and never receives privileged server-role keys or direct AI provider tokens.
- **AI/RAG Team**: The backend invokes the AI service at `AI_SERVICE_URL/query` adhering to the contract defined in `AI_PIPELINE.md`.
- **Authoritative Data**: The backend transports and persists citations returned by the AI/RAG service, but never fabricates BIS standards or clauses.
