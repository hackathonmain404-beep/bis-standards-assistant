# Backend Architecture & System Design Guide

> **Target Audience**: Developers, architects, and team members who want to understand how the BIS Intelligent Assistant Backend works under the hood.  
> **Repository Scope**: `backend/` and `supabase/`  
> **Current Phase Status**: 🟢 Standalone Backend Engine (Frontend and Real AI/RAG are cleanly decoupled).

---

## 1. Executive Summary & Purpose

The **BIS Intelligent Assistant Backend** is the secure orchestrator of the entire platform. It sits between user-facing clients (Frontend) and AI/Knowledge services (RAG & BIS data).

Its primary responsibilities are:
1. **Security & Identity**: Enforcing strict Row Level Security (RLS) in Postgres and verifying JWT tokens.
2. **Session & Conversation Management**: Storing message turns, conversation threads, and verifiable BIS standard citations.
3. **Safe AI Orchestration**: Decoupling the application from external AI providers using an **Adapter Pattern** and protecting it with an in-memory **Circuit Breaker**.
4. **Auditability & Observability**: Tracking every assistant request across a 16-state lifecycle and writing immutable audit logs.
5. **Resilience & Protection**: Enforcing sliding-window rate limiting, input sanitization, and structured error responses.

---

## 2. High-Level Architecture Diagram

Here is how data flows from an incoming HTTP request through the backend system:

```text
                             HTTP Request (REST / JSON)
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │          CORS & Rate Limiter          │
                     │  (Blocks DDoS, IP / User Throttling)  │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │       Authentication (Supabase)       │
                     │ (Extracts & verifies Bearer JWT token)│
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │     Input Validation & Sanitization   │
                     │  (UUID checks, max 5000 chars, JSON)  │
                     └───────────────────┬───────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │       Application Service Layer       │
                     │ (AssistantQueryService / Conversation)│
                     └───────┬───────────────────────┬───────┘
                             │                       │
             Database Writes │                       │ Calls AI Client
             & RLS Check     │                       │ via Circuit Breaker
                             ▼                       ▼
              ┌─────────────────────┐ ┌─────────────────────────────┐
              │  Supabase Postgres  │ │    MockAIServiceClient      │
              │  (Tables & RLS)     │ │ (Future: RealAIServiceClient)│
              │                     │ └──────────────┬──────────────┘
              │ - sessions          │                │ Returns raw
              │ - messages          │                │ response
              │ - citations         │                ▼
              │ - assistant_requests│ ┌─────────────────────────────┐
              │ - audit_logs        │ │     AI Response Validator   │
              │ - app_config        │ │(Rejects malformed citations)│
              └─────────────────────┘ └──────────────┬──────────────┘
                             ▲                       │
                             └───────────────────────┘
                              Persists Turn & Citations
```

---

## 3. Directory Layout & File Responsibilities

All backend application code is organized cleanly inside `backend/src/` (for Node.js) and `supabase/functions/` (for serverless Edge Functions).

```text
d:\bis\
├── backend/
│   ├── src/
│   │   ├── server.ts              # HTTP server entrypoint & router (Node/Express)
│   │   ├── config.ts              # Environment variable loader & fallback defaults
│   │   ├── types.ts               # Core TypeScript interfaces (API, AI, Database)
│   │   ├── auth.ts                # Server-side JWT authentication & user resolution
│   │   ├── cors.ts                # Cross-Origin Resource Sharing (CORS) handler
│   │   ├── validation.ts          # Request payload validators & input sanitization
│   │   ├── errors.ts              # Standardized machine-readable AppError classes
│   │   ├── logger.ts              # Structured JSON logging with PII/secret redaction
│   │   ├── rate-limiter.ts        # Sliding-window rate limiting (Memory-based)
│   │   ├── supabase-client.ts     # Supabase client factory (Anon vs Service Role)
│   │   ├── services.ts            # Core business logic (Assistant & Conversations)
│   │   ├── ai-client.ts           # AI service adapter & Circuit Breaker abstraction
│   │   ├── ai-validator.ts        # Untrusted downstream AI response validator
│   │   ├── mock-db.ts             # In-memory mock database for offline testing
│   │   └── diagnose.ts            # Self-healing diagnostic CLI tool (npm run diagnose)
│   └── tests/                     # 53 automated unit, contract, and RLS tests
│
├── supabase/
│   ├── migrations/                # Deterministic SQL migrations (Tables, RLS)
│   ├── functions/
│   │   ├── _shared/               # Shared logic between Edge Functions & Node server
│   │   └── v1/index.ts            # Supabase serverless edge execution boundary
│   └── seed.sql                   # Deterministic development seed data
```

---

## 4. Deep Dive: The Core Modules

### 4.1 Server & Routing (`server.ts`)
- **What it does**: Listens on port `8000` (Node.js runtime).
- **Key mechanism**: Handlers are lightweight controllers. They parse the HTTP request, invoke CORS and rate limiters, delegate to the `services.ts` application layer, and format standard responses using `formatResponse()` or `formatErrorResponse()`.

### 4.2 Application Services (`services.ts`)
This is the heart of the backend. It contains three decoupled classes:
1. `AssistantQueryService`:
   - Checks session ownership or creates a new session.
   - Enforces **Idempotency**: checks if `client_request_id` was already processed; if so, returns the cached response immediately.
   - Records request lifecycle in `assistant_requests` (`AUTHORIZED` → `AI_PENDING` → `AI_COMPLETED` → `COMPLETED`).
   - Invokes `AIServiceClient` to get answers and citations.
   - Persists the user message, assistant response, and all structured BIS citations in Postgres.
   - Logs an audit event in `audit_logs` (`ASSISTANT_COMPLETED`).
2. `ConversationService`:
   - Lists user sessions with pagination (`limit` & `offset`).
   - Retrieves full conversation history with structured citations.
   - Deletes sessions and linked messages safely, logging a `CONVERSATION_DELETED` audit event.
   - **Enforces strict object ownership**: User A cannot view or delete User B's sessions.
3. `HealthService`:
   - Probes live database connectivity (`public.app_config`).
   - Probes AI engine availability via `aiClient.healthCheck()`.

### 4.3 Supabase Client Architecture (`supabase-client.ts`)
The backend strictly separates two types of database clients:
- **User-Scoped Client (`createUserClient(authToken)`)**:
  - Bound to the authenticated user's JWT.
  - **Enforces Row Level Security (RLS)** in Postgres.
  - If User A attempts to query User B's row, Postgres returns 0 rows.
- **Privileged Server Client (`createServerClient()`)**:
  - Uses `SUPABASE_SERVICE_ROLE_KEY`.
  - **Bypasses RLS** for internal system jobs (health checks, writing audit logs, inserting system configuration).
  - 🚨 **CRITICAL**: The service role key is NEVER exposed to the frontend or browser.

### 4.4 The AI Adapter & Circuit Breaker (`ai-client.ts`)
The backend does NOT depend on a real AI or LLM provider being online.
- **The Interface (`AIServiceClient`)**:
  Both the Mock and the Real AI implement the exact same methods:
  ```typescript
  interface AIServiceClient {
    queryAssistant(request: AIServiceRequest, requestId?: string): Promise<AIServiceResponse>;
    healthCheck(): Promise<boolean>;
  }
  ```
- **`MockAIServiceClient` (Currently Active)**:
  - Generates realistic answers for Indian Standards (e.g. `IS 14543` for packaged drinking water, `IS 302` for electric irons).
  - Explicitly prefixes text with `[DEMO TEST DATA]` to prevent misrepresentation of official standards.
- **`AICircuitBreaker`**:
  Protects the backend from hanging or crashing if downstream AI experiences downtime:
  - `CLOSED`: Normal operation.
  - `OPEN`: After 5 consecutive failures, downstream calls fail fast with `503 AI_UNAVAILABLE` for 30 seconds.
  - `HALF_OPEN`: After 30 seconds cooldown, trial requests test if AI has recovered.

### 4.5 Downstream AI Validator (`ai-validator.ts`)
- **Philosophy**: **Treat all AI output as untrusted downstream data.**
- Validates that AI responses contain a non-empty `response_text`.
- Inspects and sanitizes each citation item (`standard_id`, `document_title`, `section`, `clause`, `snippet`).
- Discards malformed or incomplete citation structures without crashing the application.

---

## 5. Request Lifecycle Walkthrough (`POST /api/v1/chat`)

Here is what happens step-by-step when a user asks a question:

```text
1. Client POST /api/v1/chat
   │
2. Rate Limiter: Verifies client hasn't exceeded 20 req/min.
   │
3. Auth Module: Extracts "Authorization: Bearer <jwt>" (if present).
   │
4. Input Validator: Checks message length (1 - 5000 chars), sanitizes null bytes.
   │
5. Session Ownership Check:
   - If session_id provided: verifies caller owns the session (403 if stolen).
   - If no session_id: generates a new session UUID and creates record.
   │
6. Request Tracker: Inserts row into `assistant_requests` (Status: "AUTHORIZED").
   │
7. Idempotency Check:
   - If client_request_id matches an existing message in this session,
     skips AI call and returns cached response.
   │
8. Persist User Message: Inserts user prompt into `messages` table.
   │
9. Load History: Retrieves 10 most recent conversation turns for context.
   │
10. AI Engine Invocation:
    - Tracker updates to "AI_PENDING".
    - aiClient.queryAssistant() executes (Mock or Real).
    - aiValidator validates schema and sanitizes citations.
    - Tracker updates to "AI_COMPLETED".
   │
11. Persist Assistant Message: Inserts response into `messages` table.
   │
12. Persist Citations: Inserts citation rows into `citations` table linked to message.
   │
13. Audit & Tracking Completion:
    - Tracker updates to "COMPLETED" with latency_ms recorded.
    - Inserts event into `audit_logs` ("ASSISTANT_COMPLETED").
   │
14. Client Response: Returns contract-compliant JSON response.
```

---

## 6. Database Schema & Security (Postgres + RLS)

All database entities are managed via deterministic migrations in `supabase/migrations/`:

```text
 ┌────────────────┐         ┌────────────────┐
 │   auth.users   │ 1     1 │     users      │
 │ (Supabase Auth)├─────────┤  (Profiles)    │
 └───────┬────────┘         └───────┬────────┘
         │                          │
         │ 1                        │ 1
         │                          │
         │ N                        │ N
 ┌───────┴────────┐         ┌───────┴────────┐
 │ assistant_     │         │    sessions    │
 │    requests    │         │ (Conversations)│
 └────────────────┘         └───────┬────────┘
                                    │
                                    │ 1
                                    │
                                    │ N
                            ┌───────┴────────┐
                            │    messages    │
                            │ (Turns/Chat)   │
                            └───────┬────────┘
                                    │
                                    │ 1
                                    │
                                    │ N
                            ┌───────┴────────┐
                            │   citations    │
                            │ (BIS Standards)│
                            └────────────────┘
```

### Table Definitions & Roles

| Table Name | Primary Purpose | Key Security Policy |
| :--- | :--- | :--- |
| `users` | User profile data linked to `auth.users(id)` | Only owner can read/update (`auth.uid() = id`) |
| `sessions` | Conversation sessions | Only owner can access (`auth.uid() = user_id`) |
| `messages` | Conversation turns (`user`, `assistant`, `system`) | Only readable if parent session is owned by user |
| `citations` | Official standard citations (clauses, titles) | Only readable if parent message is owned by user |
| `app_config` | System parameters & feature flags | Read-only to public/anon; write-restricted to admin |
| `assistant_requests` | 16-state lifecycle tracking & latency metrics | Managed server-side; read/write denied to clients |
| `audit_logs` | Append-only security audit events | Deny all client mutations; append-only via server |

---

## 7. Error Handling & Machine-Readable Codes

The backend uses custom `AppError` exceptions that automatically map to clean HTTP status codes and machine-readable error codes:

| Error Code | HTTP Status | Meaning |
| :--- | :--- | :--- |
| `INVALID_REQUEST` | `400 Bad Request` | Missing field, malformed JSON, or invalid UUID |
| `EMPTY_MESSAGE` | `400 Bad Request` | User prompt was empty or whitespace only |
| `AUTH_REQUIRED` | `401 Unauthorized` | Missing or expired Bearer JWT token |
| `FORBIDDEN` | `403 Forbidden` | User attempted to read/delete another user's session |
| `SESSION_NOT_FOUND`| `404 Not Found` | Conversation session UUID does not exist |
| `RATE_LIMITED` | `429 Too Many Requests` | Threshold exceeded (includes `Retry-After` header) |
| `AI_UNAVAILABLE` | `503 Service Unavailable`| AI service unreachable or circuit breaker tripped |
| `INTERNAL_ERROR` | `500 Internal Server Error`| Unexpected server fault (Sanitized in response) |

---

## 8. Dual-Boundary Execution Architecture

One of the unique strengths of this backend is its **Dual-Boundary Architecture**:

```text
                      Shared Business Logic
                      (supabase/functions/_shared/)
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       Local Dev & Docker               Cloud Serverless
       (backend/src/server.ts)          (supabase/functions/v1/)
       Runtime: Node.js 20+             Runtime: Deno / Supabase Edge
       Port: 8000                       URL: https://<project>.supabase.co
```

- When developing locally, running `npm run dev` starts the Node.js server in milliseconds without needing Docker.
- When deploying to production, the exact same logic deploys to distributed Supabase Edge Functions with zero modifications.

---

## 9. Quick Developer Cheat Sheet

| Task | Command | Where it Runs |
| :--- | :--- | :--- |
| **Run Diagnostic Tool** | `npm run diagnose` | Root or `backend/` |
| **Run 53 Automated Tests** | `npm test` | Root or `backend/` |
| **Start Local Server** | `npm run dev` | Root or `backend/` |
| **Health Check** | `GET http://localhost:8000/api/v1/health` | Browser or cURL |
| **Readiness Check** | `GET http://localhost:8000/api/v1/ready` | Browser or cURL |
| **Switch to Real AI Later** | Set `AI_MOCK_MODE=false` in `backend/.env` | `backend/.env` |

---

## 10. Summary FAQ

### Q1: Where does conversation history get saved?
**Answer**: In the `sessions`, `messages`, and `citations` tables in your Supabase Postgres database. Every turn is persisted before returning the response to the client.

### Q2: What prevents User A from seeing User B's chats?
**Answer**: Two layers of defense:
1. **Application Layer (`services.ts`)**: Checks `session.user_id === caller.id` and immediately throws a `403 Forbidden` error if IDs do not match.
2. **Database Layer (RLS)**: PostgreSQL policies reject queries that do not match `auth.uid() = user_id`.

### Q3: Is the real AI connected right now?
**Answer**: **No.** In accordance with the current phase rules, the backend runs with `AI_MOCK_MODE=true`. It uses `MockAIServiceClient` to return deterministic, structured responses without incurring OpenAI/Gemini costs or network dependencies. When the AI team is ready, switching to real AI only takes setting `AI_MOCK_MODE=false`.

### Q4: How are secrets protected?
**Answer**: The `SUPABASE_SERVICE_ROLE_KEY` and future `AI_SERVICE_SECRET` are kept strictly in `backend/.env` (which is gitignored). The logger automatically redacts sensitive keywords (`[REDACTED]`), and errors sanitize stack traces before sending responses to clients.
