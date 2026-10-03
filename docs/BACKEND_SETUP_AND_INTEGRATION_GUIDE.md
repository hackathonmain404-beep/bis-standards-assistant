# Supabase Backend Setup & Future Integration Guide

> **Current Phase Status**:  
> 🟢 **Backend**: Standalone, hardened, production-ready, and independently verified.  
> 🔴 **Frontend Connection**: **NOT CONNECTED** (Prepared for future phase).  
> 🔴 **Real AI/RAG Connection**: **NOT CONNECTED** (Prepared for future phase; running with `MockAIService`).

---

## 1. Executive Summary & Purpose

This guide is the authoritative reference for setting up, running, testing, and troubleshooting the **BIS Intelligent Assistant Supabase Backend**. 

It is written specifically for any developer (backend, frontend, or AI/RAG) cloning this repository for the first time. It provides:
1. Complete step-by-step local setup instructions without requiring a connected frontend or real AI model.
2. Safe database migration and Row Level Security (RLS) policies.
3. Automated test suites and diagnostic tooling (`npm run diagnose`).
4. Strict API and architectural contracts for **Future Frontend Integration** and **Future AI/RAG Integration**.

---

## 2. Prerequisites & Compatibility

Before starting, ensure your system has the following tools installed and verified:

| Requirement | Why Needed | Required? | How to Verify | Minimum Version |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js** | Backend runtime & test runner | Yes | `node --version` | `v20.0.0+` (Tested on `v24.20.0`) |
| **npm** | Package manager & script runner | Yes | `npm --version` | `v10.0.0+` |
| **Git** | Version control & branch tracking | Yes | `git --version` | `v2.40.0+` |
| **Supabase CLI** | Local Postgres, migrations & Edge Functions | Optional for Cloud; Recommended for local DB | `supabase --version` | `v1.150.0+` |
| **Docker** | Required only if running Supabase CLI locally | Optional (Only for local Supabase) | `docker --version` | `v24.0.0+` |
| **cURL** | Standalone API testing without frontend | Yes | `curl --version` | Any standard release |

---

## 3. Environment Variable Architecture

Environment variables are partitioned strictly into **Public (Client-Safe)**, **Server-Only (Protected)**, and **Future Integration Placeholders**.

### 3.1 Classification Matrix

| Variable Name | Purpose | Classification | Safe for Browser? | Where Configured |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Local HTTP server port | Backend Server | ❌ NO | `backend/.env` |
| `NODE_ENV` | Environment (`development`/`production`) | Backend Server | ❌ NO | `backend/.env` |
| `SUPABASE_URL` | Supabase project URL | Public / Shared | ✅ YES | `backend/.env`, Frontend `.env` |
| `SUPABASE_ANON_KEY` | Public anonymous client key (RLS-enforced) | Public / Shared | ✅ YES | `backend/.env`, Frontend `.env` |
| `SUPABASE_SERVICE_ROLE_KEY`| Privileged service key (Bypasses RLS) | **SERVER-ONLY** | ❌ **CRITICAL: NEVER EXPOSE** | `backend/.env`, Edge Function secrets |
| `AI_MOCK_MODE` | Forces `MockAIService` (Standalone safety) | Backend Server | ❌ NO | `backend/.env` (Must be `true` now) |
| `AI_SERVICE_URL` | Endpoint for future real AI/RAG agent | **FUTURE ONLY** | ❌ NO | `backend/.env` (Placeholder) |
| `AI_SERVICE_SECRET` | Authentication bearer token for future AI | **FUTURE ONLY** | ❌ **CRITICAL: NEVER EXPOSE** | `backend/.env` (Placeholder) |
| `ALLOWED_ORIGINS` | Permitted CORS origins (comma-separated) | Backend Server | ❌ NO | `backend/.env` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting sliding window in ms | Backend Server | ❌ NO | `backend/.env` |
| `RATE_LIMIT_MAX_REQUESTS` | Allowed requests per window | Backend Server | ❌ NO | `backend/.env` |

### 3.2 Security Rules for Secrets
- 🚨 **NEVER** pass `SUPABASE_SERVICE_ROLE_KEY` or `AI_SERVICE_SECRET` to the frontend or browser.
- 🚨 **NEVER** commit active `.env` files into source control. Always maintain `.env.example`.
- Frontend applications in future phases will **ONLY** receive `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

---

## 4. After Cloning the Repository (Zero-to-Running in 3 Minutes)

Follow this exact sequence after cloning the repository:

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```
*Expected Output*: `added X packages, and audited Y packages in Zs`.

### Step 2: Configure Environment Variables
Copy the template to your local environment file:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```ini
PORT=8000
NODE_ENV=development
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# STANDALONE BACKEND RULES — KEEP DISCONNECTED
AI_MOCK_MODE=true
AI_SERVICE_URL=http://localhost:8001
AI_SERVICE_SECRET=dev-secret-placeholder

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
```

### Step 3: Run the Diagnostic Tool
Validate that your runtime, database connectivity, and mock AI services are fully operational:
```bash
npm run diagnose
```
*Expected Output*:
```text
============================================================
BIS Intelligent Assistant — Backend Diagnostic Tool
============================================================

✅ [PASS] Node.js Runtime                : v24.x (compatible >= v20.0.0)
✅ [PASS] SUPABASE_URL                   : Valid format
✅ [PASS] SUPABASE_ANON_KEY              : Client key present
✅ [PASS] SUPABASE_SERVICE_ROLE_KEY      : Server secret present
✅ [PASS] AI/RAG Disconnection Rule      : AI_MOCK_MODE=true (Standalone mode strictly enforced)
✅ [PASS] Database Connectivity          : Successfully queried public.app_config table
✅ [PASS] Mock AI Engine                 : Responsive: [DEMO TEST RESPONSE]
✅ [PASS] Readiness Probe (/api/v1/ready) : Ready: true, Database: connected, AI: ready (mock)

------------------------------------------------------------
STATUS: BACKEND READY FOR LOCAL RUNNING AND FUTURE INTEGRATION
============================================================
```

### Step 4: Run the Complete Test Suite
Execute the 53 automated unit, contract, multi-user RLS, and security tests:
```bash
npm test
```
*Expected Output*: `ℹ pass 53 / fail 0`.

### Step 5: Start the Local Backend Server
```bash
npm run dev
```
*Expected Output*:
```text
{"level":"INFO","endpoint":"server","message":"BIS Intelligent Assistant Backend running on http://localhost:8000"}
```

---

## 5. Database Architecture & Migrations

All database structures are defined via deterministic, forward-only SQL migrations in `supabase/migrations/`.

### 5.1 Applied Migrations

1. `20261003160000_initial_schema.sql`:
   - `profiles`: User profile linking to `auth.users(id)`.
   - `sessions`: Conversation sessions owned by `user_id` or anonymous.
   - `messages`: Conversation turns (`user`, `assistant`, `system`), including `client_request_id` for idempotency.
   - `citations`: Verifiable BIS document references linked to assistant messages.
   - `saved_items`: User bookmarks for standards, clauses, and laboratories.
   - `app_config`: Key-value application configuration and feature flags.

2. `20261003160500_rls_policies.sql`:
   - Enforces `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` on all tables.
   - Restricts session, message, and bookmark access strictly to authenticated record owners (`auth.uid() = user_id`).
   - Grants public read access to `app_config` while denying write access to unprivileged roles.

3. `20261004000000_audit_and_request_tracking.sql`:
   - `assistant_requests`: 16-state lifecycle tracking for auditability, latency measurement, and idempotency tracking.
   - `audit_logs`: Immutable, append-only security event log (`CONVERSATION_CREATED`, `ASSISTANT_COMPLETED`, `CONVERSATION_DELETED`, `AUTH_EVENT`).
   - Default deny policies on `audit_logs` preventing modification or deletion by standard users.

### 5.2 How to Apply Migrations

#### Option A: Supabase Cloud Console (Recommended for Remote DB)
1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor**.
3. Copy and run the contents of each migration file in sequence:
   - `20261003160000_initial_schema.sql`
   - `20261003160500_rls_policies.sql`
   - `20261004000000_audit_and_request_tracking.sql`
   - *(Optional)* `supabase/seed.sql` for initial configuration parameters.

#### Option B: Supabase CLI (For Local Development)
```bash
# Start local Supabase containers (requires Docker)
supabase start

# Apply pending migrations
supabase migration up

# Verify migration status
supabase migration list
```

### 5.3 Database Safety Rules
- 🛑 **NEVER** edit an already-applied migration. Create a new timestamped migration instead.
- 🛑 **NEVER** run destructive queries (`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`) without explicit written sign-off.
- 🛑 **RESET RULE**: `supabase db reset` must **ONLY** be run on local development databases. Never run reset commands on staging or production.

---

## 6. Row Level Security (RLS) & Multi-User Isolation

The backend enforces a **Deny by Default** security model.

```text
auth.users (Supabase Auth)
    ↓
profiles (user_id = auth.uid())
    ↓
sessions (user_id = auth.uid())
    ↓
messages (session_id IN (sessions where user_id = auth.uid()))
```

### 6.1 RLS Verification Matrix

| Actor | Session Created by User A | Session Created by User B | Anonymous Session |
| :--- | :--- | :--- | :--- |
| **Anonymous User** | ❌ `403 Forbidden` / No Rows | ❌ `403 Forbidden` / No Rows | ✅ Read/Write (Session owner is null) |
| **User A** | ✅ Read / Write / Delete | ❌ `403 Forbidden` (Blocked by RLS & Service) | ❌ Cannot hijack |
| **User B** | ❌ `403 Forbidden` (Blocked by RLS & Service) | ✅ Read / Write / Delete | ❌ Cannot hijack |
| **Service Role** | Privileged Admin Read (Server-Side Only) | Privileged Admin Read (Server-Side Only) | Privileged Admin Read |

*Automated test proof*: Verified via `backend/tests/multi-user-rls.test.ts` (5/5 tests passing).

---

## 7. Edge Functions & API Foundation

The backend provides dual execution boundaries:
1. **Node.js Express Server** (`backend/src/server.ts`): Optimized for local development, Docker, and fast testing.
2. **Supabase Edge Functions** (`supabase/functions/v1/`): Distributed Deno-based serverless execution boundary.

Both boundaries share the identical architecture, request validators, error mappers, circuit breaker, and application services (`_shared/`).

### 7.1 Running Edge Functions Locally
```bash
# From workspace root
supabase functions serve v1 --env-file backend/.env --no-verify-jwt
```

---

## 8. Mock AI Service & Circuit Breaker

### 8.1 Why Mock AI?
In this phase, **real LLM providers and external RAG services are strictly disconnected**. The backend uses `MockAIServiceClient` to return structured, contract-compliant responses without incurring API costs, latency fluctuations, or network dependencies.

> ⚠️ **MOCK DATA NOTICE**:  
> All responses generated by `MockAIServiceClient` are marked with `[DEMO TEST DATA]` prefixes. They are designed for structural contract validation and UI prototyping only. **They do not constitute official BIS certifications or standards advice.**

### 8.2 Circuit Breaker Abstraction (`AICircuitBreaker`)
The backend includes an in-memory circuit breaker to protect against downstream AI outages:
- **`CLOSED`**: Normal operation. All requests forwarded to AI service.
- **`OPEN`**: Tripped after 5 consecutive failures. Downstream calls fail-fast with `503 AI_UNAVAILABLE` without hammering the downstream server.
- **`HALF_OPEN`**: After 30 seconds cooldown, trial requests are allowed through. Success resets to `CLOSED`; failure immediately re-opens the circuit.

---

## 9. API Reference & Contract Examples

All endpoints accept and return JSON conforming to `docs/api/API_CONTRACT.md`.

### 9.1 Health Check Probe
- **Method**: `GET`
- **Path**: `/health` or `/api/v1/health`
- **Auth**: None (Public)

**cURL Command**:
```bash
curl -X GET http://localhost:8000/api/v1/health
```

**Response (`200 OK`)**:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "components": {
    "database": "healthy",
    "ai_service": "healthy",
    "vector_store": "healthy"
  }
}
```

---

### 9.2 Readiness Probe
- **Method**: `GET`
- **Path**: `/ready` or `/api/v1/ready`
- **Auth**: None (Public)

**cURL Command**:
```bash
curl -X GET http://localhost:8000/api/v1/ready
```

**Response (`200 OK`)**:
```json
{
  "ready": true,
  "status": "ready",
  "database": "connected",
  "ai_service": "ready (mock)",
  "version": "0.1.0"
}
```

---

### 9.3 Ask Assistant (Chat Query)
- **Method**: `POST`
- **Path**: `/api/v1/chat`
- **Auth**: Optional (Supports both anonymous and authenticated Bearer tokens)

**cURL Command (New Conversation Session)**:
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "X-Client-Request-Id: idemp-req-001" \
  -d '{
    "message": "What is the standard for packaged drinking water?",
    "language": "en"
  }'
```

**Response (`200 OK`)**:
```json
{
  "session_id": "8f8b3c61-419b-4394-bb97-f58c757c23f1",
  "message_id": "a73bc701-d419-4a0e-bc28-09dc9080e7d5",
  "response": {
    "text": "[DEMO TEST RESPONSE] Packaged drinking water (other than packaged natural mineral water) is governed by Indian Standard IS 14543:2016.",
    "intent": "STANDARDS_SEARCH",
    "citations": [
      {
        "index": 1,
        "standard_id": "IS 14543:2016",
        "document_title": "Packaged Drinking Water Specification",
        "section": "Clause 3.2",
        "clause": "3.2 Requirements for Hygienic Packaging",
        "snippet": "Packaged drinking water shall be filled in hermetically sealed containers..."
      }
    ],
    "needs_clarification": false,
    "clarification_questions": [],
    "follow_up_suggestions": [
      "What are the testing requirements for IS 14543?",
      "Which laboratories are certified to test drinking water?"
    ]
  },
  "metadata": {
    "processing_time_ms": 14,
    "created_at": "2026-10-04T00:30:00.000Z"
  }
}
```

---

### 9.4 List Sessions
- **Method**: `GET`
- **Path**: `/api/v1/sessions?limit=10&offset=0`
- **Auth**: Authenticated (Returns caller's sessions) or Anonymous (Returns active public sessions)

**cURL Command**:
```bash
curl -X GET "http://localhost:8000/api/v1/sessions?limit=10&offset=0" \
  -H "Authorization: Bearer <user-jwt-token>"
```

**Response (`200 OK`)**:
```json
{
  "sessions": [
    {
      "id": "8f8b3c61-419b-4394-bb97-f58c757c23f1",
      "title": "What is the standard for packaged drinking water?",
      "language": "en",
      "created_at": "2026-10-04T00:30:00.000Z",
      "updated_at": "2026-10-04T00:30:00.000Z",
      "message_count": 0
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

---

### 9.5 Get Session Conversation History
- **Method**: `GET`
- **Path**: `/api/v1/sessions/:id`
- **Auth**: Enforces ownership isolation (`403 Forbidden` if accessed by non-owner)

**cURL Command**:
```bash
curl -X GET http://localhost:8000/api/v1/sessions/8f8b3c61-419b-4394-bb97-f58c757c23f1 \
  -H "Authorization: Bearer <user-jwt-token>"
```

---

### 9.6 Delete Session
- **Method**: `DELETE`
- **Path**: `/api/v1/sessions/:id`
- **Auth**: Enforces ownership isolation

**cURL Command**:
```bash
curl -X DELETE http://localhost:8000/api/v1/sessions/8f8b3c61-419b-4394-bb97-f58c757c23f1 \
  -H "Authorization: Bearer <user-jwt-token>"
```

**Response (`200 OK`)**:
```json
{
  "deleted": true,
  "session_id": "8f8b3c61-419b-4394-bb97-f58c757c23f1"
}
```

---

## 10. Future Frontend Connection Guide (Phase A)

> 🚨 **IMPORTANT**: DO NOT CONNECT THE FRONTEND NOW.  
> This section is the exact implementation contract for the frontend team when integration commences.

### 10.1 What the Frontend Developer Needs
1. `NEXT_PUBLIC_SUPABASE_URL` = `https://<ref>.supabase.co`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<public-anon-key>`
3. `NEXT_PUBLIC_BACKEND_API_URL` = `http://localhost:8000/api/v1` (Local dev) or `https://<ref>.supabase.co/functions/v1` (Edge Functions)

### 10.2 Authentication Flow
The frontend authenticates users directly against Supabase Auth:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sign in user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePassword123!',
});

// Extract access token for backend requests
const token = data.session?.access_token;
```

### 10.3 Calling Backend Endpoints from Frontend
All requests made by authenticated users pass the access token in the standard `Authorization` header:
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Client-Request-Id': crypto.randomUUID(), // Recommended for idempotency
  },
  body: JSON.stringify({
    message: 'Which standards apply to electronic toys?',
    session_id: activeSessionId, // or omit for a brand new conversation
    language: 'en',
  }),
});

const data = await response.json();
```

### 10.4 Frontend Integration Readiness Checklist
- [ ] Backend running and passing `/api/v1/health` and `/api/v1/ready`.
- [ ] Frontend `.env.local` configured with Supabase URL, Anon Key, and Backend URL.
- [ ] `X-Client-Request-Id` UUID passed on chat form submit to prevent double-submits.
- [ ] Errors handled by inspecting `error.code` (`INVALID_REQUEST`, `SESSION_NOT_FOUND`, `AUTH_REQUIRED`, `FORBIDDEN`, `RATE_LIMITED`, `AI_UNAVAILABLE`).
- [ ] Citations rendered using `citations` array with standard ID, document title, and clause.

---

## 11. Future AI/RAG Connection Guide (Phase B)

> 🚨 **IMPORTANT**: DO NOT CONNECT THE REAL AI/RAG AGENT NOW.  
> The backend communicates with AI through the `AIServiceClient` interface. Replacing the mock with the real AI requires zero code changes to business logic or database persistence.

### 11.1 AI/RAG Service Responsibilities vs Backend Responsibilities

| Responsibility | Backend Service | AI / RAG Service |
| :--- | :--- | :--- |
| User Authentication & Sessions | ✅ Owns sessions, messages, and RLS | ❌ Agnostic to users and credentials |
| Request Tracking & Latency | ✅ Tracks `assistant_requests` | ❌ Only tracks model processing time |
| BIS Document Embeddings & Chunking | ❌ **Strictly Prohibited** in Backend | ✅ Owns vector database & indexing |
| Intent Classification & Reasoning | ❌ **No hardcoded rules** in Backend | ✅ Classifies queries and retrieves BIS clauses |
| Citation Integrity & Validation | ✅ Enforces structure & rejects malformed data | ✅ Formats exact clauses, standard IDs, and titles |

### 11.2 Upstream AI Request Contract
When `RealAIServiceClient` is enabled, the backend issues an HTTP POST to `${AI_SERVICE_URL}/query` with:
```json
{
  "session_id": "8f8b3c61-419b-4394-bb97-f58c757c23f1",
  "query": "What are the test requirements for IS 14543?",
  "conversation_history": [
    {
      "role": "user",
      "content": "What is the standard for packaged drinking water?"
    },
    {
      "role": "assistant",
      "content": "Packaged drinking water is governed by IS 14543:2016."
    }
  ],
  "language": "en"
}
```

### 11.3 Downstream AI Expected Response Contract
The AI/RAG service must return a JSON response matching:
```json
{
  "response_text": "Under IS 14543:2016, packaged drinking water must undergo bacteriological tests...",
  "intent": "TESTING_LABORATORIES",
  "citations": [
    {
      "index": 1,
      "standard_id": "IS 14543:2016",
      "document_title": "Packaged Drinking Water",
      "section": "Clause 4.1",
      "clause": "Table 1 - Microbiological Requirements",
      "snippet": "Total coliform count shall be nil per 100 ml...",
      "source_document_id": "doc-is-14543"
    }
  ],
  "needs_clarification": false,
  "clarification_questions": [],
  "follow_up_suggestions": [
    "Which labs are accredited for microbiological testing under IS 14543?"
  ],
  "metadata": {
    "model": "bis-rag-pipeline-v1",
    "retrieved_chunks": 4
  }
}
```

### 11.4 Switching from Mock AI to Real AI in 60 Seconds
When the AI/RAG agent is deployed and ready:
1. Update `backend/.env`:
   ```ini
   AI_MOCK_MODE=false
   AI_SERVICE_URL=https://ai-rag-service.internal/api/v1
   AI_SERVICE_SECRET=your-secure-internal-bearer-token
   ```
2. Restart backend:
   ```bash
   npm run dev
   ```
3. Verify connection via readiness probe:
   ```bash
   curl http://localhost:8000/api/v1/ready
   ```
4. If the real AI is degraded or fails, rollback instantly by setting `AI_MOCK_MODE=true`.

---

## 12. End-to-End Future Integration Sequence

When executing future integration, follow this strict, ordered sequence:

```text
STEP 1: Verify Backend Independently (Pass 53/53 tests + npm run diagnose)
   ↓
STEP 2: Verify Frontend Independently (Mocking API responses if needed)
   ↓
STEP 3: Verify AI/RAG Independently (Unit tests & prompt evaluation)
   ↓
STEP 4: Connect Frontend → Backend (Test auth, session creation, chat)
   ↓
STEP 5: Connect Backend → AI/RAG (Enable RealAIServiceClient, verify citations)
   ↓
STEP 6: Full E2E Test (User signs in -> asks question -> receives verified BIS citations)
```

---

## 13. Troubleshooting Decision Tree

```text
Backend won't start?
 ├── Missing .env file? ───────────► Run `cp .env.example .env`
 ├── Port 8000 in use? ────────────► Change `PORT=8001` in .env
 └── Node version incompatible? ──► Upgrade to Node.js v20.0.0 or higher

Database queries fail?
 ├── "relation does not exist"? ──► Apply migrations (see Section 5.2)
 ├── 401 Unauthorized? ───────────► Check SUPABASE_ANON_KEY and URL in .env
 └── 403 Forbidden? ──────────────► Check RLS policies; verify auth token

API returns 401 Unauthorized?
 ├── Authorization header missing? ► Pass `Bearer <token>`
 └── Token expired? ──────────────► Refresh user session in Supabase Auth

Assistant query fails?
 ├── AI_MOCK_MODE=false? ─────────► Set `AI_MOCK_MODE=true` to isolate from AI
 ├── Circuit breaker OPEN? ───────► Wait 30s for cooldown or check /ready
 └── Malformed input? ────────────► Validate JSON structure against API contract
```

---

## 14. "Am I Ready?" Final Verification Checklist

Run through this checklist before tagging any release or handing off to the frontend/AI teams:

- [x] Dependencies installed (`npm install` completed with 0 errors).
- [x] Environment configured (`.env` populated with valid Supabase keys).
- [x] Migrations 1, 2, and 3 applied to database.
- [x] Standalone Mock AI enforced (`AI_MOCK_MODE=true`).
- [x] RLS policies enabled and tested across multiple simulated users.
- [x] Health check passes (`GET /api/v1/health` returns status `healthy`).
- [x] Readiness check passes (`GET /api/v1/ready` returns ready `true`).
- [x] All 53 automated tests pass (`npm test`).
- [x] Diagnostic tool passes (`npm run diagnose`).
- [x] Frontend is completely disconnected.
- [x] Real AI/RAG is completely disconnected.
- [x] No secrets committed to git.
