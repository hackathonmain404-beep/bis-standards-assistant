# API Contract — BIS Intelligent Assistant

> Related: [ARCHITECTURE](../architecture/ARCHITECTURE.md) | [AI_PIPELINE](../ai/AI_PIPELINE.md) | [DATABASE_SCHEMA](../architecture/DATABASE_SCHEMA.md) | [ERROR_HANDLING](ERROR_HANDLING.md) | [UI_SPEC](../frontend/UI_SPEC.md)

---

## Purpose

This is a **core integration contract**. It defines the HTTP API that the frontend consumes and the backend implements. Both teams must use this document as the shared specification. Changes require agreement from Member 1 (Frontend) and Member 2 (Backend).

---

## General Conventions

| Convention | Value |
|:---|:---|
| **Base URL** | `/api/v1` |
| **Content Type** | `application/json` |
| **Character Encoding** | UTF-8 |
| **Date Format** | ISO 8601 (`2026-10-03T14:30:00Z`) |
| **ID Format** | UUID v4 strings |
| **Error Format** | Standardized error object (see Error Responses) |
| **Pagination** | Cursor-based or offset-based (TBD for endpoints that need it) |

---

## Authentication

> **STATUS: TBD** — Authentication may not be required for MVP.

If implemented, the expected approach is:

| Method | Header |
|:---|:---|
| API Key | `Authorization: Bearer <api_key>` |
| JWT (future) | `Authorization: Bearer <jwt_token>` |

---

## Endpoints

### 1. Chat — Send Message

**Purpose:** Send a user message and receive an AI response.

```
POST /api/v1/chat
```

#### Request

```json
{
  "session_id": "uuid | null",
  "message": "string (required, non-empty)",
  "language": "string (default: 'en')"
}
```

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `session_id` | string (UUID) | No | Existing session ID. If null, a new session is created. |
| `message` | string | Yes | User's message text. Must be non-empty. |
| `language` | string | No | Response language code. Default: `"en"`. |

#### Response — Success (200)

```json
{
  "session_id": "uuid",
  "message_id": "uuid",
  "response": {
    "text": "string — the AI's answer with [1] inline citations",
    "intent": "string — detected intent (e.g., PRODUCT_DISCOVERY)",
    "citations": [
      {
        "index": 1,
        "standard_id": "IS 14543:2016",
        "document_title": "Packaged Drinking Water — Specification",
        "section": "4. Requirements",
        "clause": "4.2",
        "snippet": "The water shall conform to the chemical requirements..."
      }
    ],
    "needs_clarification": false,
    "clarification_questions": [],
    "follow_up_suggestions": [
      "Would you like to know about testing requirements?",
      "Would you like to find recognized testing laboratories?"
    ]
  },
  "metadata": {
    "processing_time_ms": 2300,
    "created_at": "2026-10-03T14:30:00Z"
  }
}
```

#### Response Fields

| Field | Type | Description |
|:---|:---|:---|
| `session_id` | string | Session ID (newly created or existing) |
| `message_id` | string | Unique ID for this message exchange |
| `response.text` | string | AI-generated response with inline citation markers |
| `response.intent` | string | Classified intent of the query |
| `response.citations` | array | Source citations referenced in the response |
| `response.citations[].index` | integer | Citation number (matches [N] in text) |
| `response.citations[].standard_id` | string | Standard number and year |
| `response.citations[].document_title` | string | Document title |
| `response.citations[].section` | string | Section reference |
| `response.citations[].clause` | string | Clause reference |
| `response.citations[].snippet` | string | Relevant text excerpt |
| `response.needs_clarification` | boolean | Whether the system needs more information |
| `response.clarification_questions` | array | Questions to ask the user |
| `response.follow_up_suggestions` | array | Suggested next questions |

#### Error Responses

See [ERROR_HANDLING.md](ERROR_HANDLING.md) for the complete error specification.

| Status | Code | When |
|:---|:---|:---|
| 400 | `INVALID_REQUEST` | Missing or invalid message |
| 404 | `SESSION_NOT_FOUND` | Invalid session_id |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `AI_SERVICE_UNAVAILABLE` | AI pipeline or LLM unavailable |

---

### 2. Sessions — List Sessions

**Purpose:** Retrieve a list of conversation sessions.

```
GET /api/v1/sessions
```

#### Query Parameters

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| `limit` | integer | No | Maximum sessions to return (default: 20, max: 100) |
| `offset` | integer | No | Offset for pagination (default: 0) |

#### Response — Success (200)

```json
{
  "sessions": [
    {
      "id": "uuid",
      "title": "Electric steam iron compliance",
      "language": "en",
      "created_at": "2026-10-03T14:00:00Z",
      "updated_at": "2026-10-03T14:30:00Z",
      "message_count": 6
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

---

### 3. Sessions — Get Session History

**Purpose:** Retrieve full conversation history for a session.

```
GET /api/v1/sessions/{session_id}
```

#### Response — Success (200)

```json
{
  "session": {
    "id": "uuid",
    "title": "Electric steam iron compliance",
    "language": "en",
    "created_at": "2026-10-03T14:00:00Z",
    "updated_at": "2026-10-03T14:30:00Z"
  },
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "I manufacture a domestic electric steam iron.",
      "created_at": "2026-10-03T14:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Based on your product description...",
      "intent": "PRODUCT_DISCOVERY",
      "citations": [ ... ],
      "created_at": "2026-10-03T14:00:05Z"
    }
  ]
}
```

#### Error Responses

| Status | Code | When |
|:---|:---|:---|
| 404 | `SESSION_NOT_FOUND` | Session ID does not exist |

---

### 4. Sessions — Delete Session

**Purpose:** Delete a conversation session and its messages.

```
DELETE /api/v1/sessions/{session_id}
```

#### Response — Success (200)

```json
{
  "deleted": true,
  "session_id": "uuid"
}
```

---

### 5. Health Check

**Purpose:** Check if the API is operational.

```
GET /api/v1/health
```

#### Response — Success (200)

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

## Error Response Format

All error responses follow this standard format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "details": {}
  }
}
```

| Field | Type | Description |
|:---|:---|:---|
| `error.code` | string | Machine-readable error code |
| `error.message` | string | Human-readable description |
| `error.details` | object | Additional context (optional) |

### Error Codes

| Code | HTTP Status | Description |
|:---|:---|:---|
| `INVALID_REQUEST` | 400 | Request validation failed |
| `EMPTY_MESSAGE` | 400 | Message field is empty |
| `SESSION_NOT_FOUND` | 404 | Session ID does not exist |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `AI_SERVICE_UNAVAILABLE` | 503 | AI pipeline not available |
| `LLM_ERROR` | 503 | LLM provider error |
| `RETRIEVAL_ERROR` | 503 | Vector store / retrieval error |

---

## Request Validation Rules

| Field | Validation |
|:---|:---|
| `message` | Non-empty string. Maximum length: 5000 characters. |
| `session_id` | Valid UUID format (if provided). |
| `language` | Supported language code: `en`, `hi` (expand as multilingual support grows). |
| `limit` | Integer, 1–100. |
| `offset` | Integer, ≥ 0. |

---

## Future Endpoints (Not for MVP)

| Endpoint | Purpose | Phase |
|:---|:---|:---|
| `POST /api/v1/products/discover` | Structured product compliance discovery | Phase 2 |
| `GET /api/v1/standards/{standard_id}` | Direct standard information lookup | Phase 2 |
| `GET /api/v1/labs` | Laboratory search | Phase 2 |
| `POST /api/v1/auth/login` | User authentication | Phase 2/3 |
| `POST /api/v1/feedback` | User feedback on responses | Phase 2 |

---

## Open Decisions

| Decision | Status |
|:---|:---|
| Authentication mechanism for MVP | **STATUS: TBD** |
| Response streaming (SSE) for chat endpoint | **STATUS: TBD** |
| Pagination style (cursor vs. offset) | **STATUS: TBD** |
| Rate limiting thresholds | **STATUS: TBD** |
| Maximum message length | **STATUS: TBD** — Proposed: 5000 characters |
