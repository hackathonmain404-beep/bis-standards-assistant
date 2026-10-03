# Error Handling — BIS Intelligent Assistant

> Related: [API_CONTRACT](API_CONTRACT.md) | [AI_PIPELINE](../ai/AI_PIPELINE.md) | [AI_RULES](../ai/AI_RULES.md) | [SECURITY](SECURITY.md)

---

## Purpose

This document defines how the system handles errors at every layer — from invalid user input to AI pipeline failures. It specifies both **user-facing behavior** (what the user sees) and **internal behavior** (what gets logged).

---

## Error Categories

| Category | Source | Example |
|:---|:---|:---|
| **Input Validation** | Frontend / Backend | Empty query, invalid session ID |
| **Business Logic** | Backend | Session not found, rate limit exceeded |
| **AI Pipeline** | AI Orchestration | Intent detection failure, retrieval failure |
| **External Service** | LLM Provider, Vector Store | API timeout, service unavailable |
| **BIS Knowledge** | Knowledge Base | No relevant evidence found |
| **Infrastructure** | Database, Network | Database connection failure |

---

## Error Handling by Scenario

### 1. Invalid Request

| Trigger | Empty message, malformed JSON, invalid parameters |
|:---|:---|
| **HTTP Status** | 400 |
| **Error Code** | `INVALID_REQUEST` or `EMPTY_MESSAGE` |
| **User-Facing Message** | "Please enter a valid question." |
| **Internal Logging** | Log request details (excluding sensitive data) |
| **Action** | Return error immediately. Do not call AI pipeline. |

---

### 2. Empty Query

| Trigger | User submits blank or whitespace-only message |
|:---|:---|
| **HTTP Status** | 400 |
| **Error Code** | `EMPTY_MESSAGE` |
| **User-Facing Message** | "Please enter a question to get started." |
| **Internal Logging** | Log as validation error |
| **Action** | Return error immediately. |

---

### 3. No Search Results (Retrieval Returns Empty)

| Trigger | Vector search returns no chunks above the relevance threshold |
|:---|:---|
| **HTTP Status** | 200 (this is not an error — it's a valid "no results" response) |
| **User-Facing Message** | "I could not find relevant BIS information for your query in my current knowledge base. This may be because no specific standard exists for this topic, or the relevant information is not yet in my knowledge base. You may want to contact BIS directly for the latest information." |
| **Internal Logging** | Log query, retrieval attempt, zero results |
| **Action** | Return a helpful response WITHOUT calling the LLM with empty evidence. |

---

### 4. No Reliable BIS Evidence

| Trigger | Retrieved chunks exist but all are below the relevance confidence threshold |
|:---|:---|
| **HTTP Status** | 200 |
| **User-Facing Message** | "I found some potentially related information, but I'm not confident it directly addresses your question. Here's what I found: [partial info]. I recommend verifying with BIS for specific guidance." |
| **Internal Logging** | Log query, retrieved chunks, relevance scores |
| **Action** | Optionally present low-confidence results with strong qualifiers. |

---

### 5. RAG Pipeline Failure

| Trigger | An exception occurs in the retrieval or processing pipeline |
|:---|:---|
| **HTTP Status** | 503 |
| **Error Code** | `RETRIEVAL_ERROR` |
| **User-Facing Message** | "I'm having trouble searching my knowledge base right now. Please try again in a moment." |
| **Internal Logging** | Log full exception, stack trace, query context |
| **Action** | Return error. Do not attempt to generate a response without retrieval. |

---

### 6. LLM Failure

| Trigger | LLM API call fails (timeout, rate limit, API error) |
|:---|:---|
| **HTTP Status** | 503 |
| **Error Code** | `LLM_ERROR` |
| **User-Facing Message** | "I'm unable to generate a response right now. Please try again shortly." |
| **Internal Logging** | Log LLM error details, API response, timeout duration |
| **Action** | Return error. Do NOT fall back to an ungrounded response. |

---

### 7. Database Failure

| Trigger | Application database (sessions, messages) is unavailable |
|:---|:---|
| **HTTP Status** | 500 |
| **Error Code** | `INTERNAL_ERROR` |
| **User-Facing Message** | "Something went wrong on our end. Please try again." |
| **Internal Logging** | Log database error, connection details (no credentials) |
| **Action** | Return error. Session and message persistence may fail. |

---

### 8. External Service Failure

| Trigger | Any external service (embedding API, third-party API) fails |
|:---|:---|
| **HTTP Status** | 503 |
| **Error Code** | `AI_SERVICE_UNAVAILABLE` |
| **User-Facing Message** | "One of our services is temporarily unavailable. Please try again in a moment." |
| **Internal Logging** | Log which service failed, error details, response time |
| **Action** | Return error with appropriate fallback message. |

---

### 9. Timeout

| Trigger | Processing exceeds the configured timeout |
|:---|:---|
| **HTTP Status** | 504 or 503 |
| **Error Code** | `TIMEOUT` |
| **User-Facing Message** | "Your request took too long to process. Please try again or simplify your question." |
| **Internal Logging** | Log timeout duration, which stage was running, query details |
| **Action** | Cancel processing. Return timeout error. |

**Timeout thresholds:**

| Stage | Threshold (TBD) |
|:---|:---|
| Total request timeout | 30 seconds |
| Retrieval timeout | 10 seconds |
| LLM generation timeout | 20 seconds |

---

### 10. Unsupported Language

| Trigger | User selects or sends message in an unsupported language |
|:---|:---|
| **HTTP Status** | 400 |
| **Error Code** | `UNSUPPORTED_LANGUAGE` |
| **User-Facing Message** | "This language is not currently supported. Please try English." |
| **Internal Logging** | Log requested language |
| **Action** | Return error. Do not attempt to process in the unsupported language. |

---

### 11. Invalid Source / Citation

| Trigger | Post-generation validation finds a citation that doesn't match the knowledge base |
|:---|:---|
| **HTTP Status** | 200 (response is still returned) |
| **User-Facing Behavior** | The invalid citation is **removed** from the response. The response text may be adjusted. |
| **Internal Logging** | Log the invalid citation, the query, the LLM output |
| **Action** | Remove invalid citation. Log as a quality issue. Flag for evaluation review. |

---

### 12. Session Not Found

| Trigger | Request references a session_id that doesn't exist |
|:---|:---|
| **HTTP Status** | 404 |
| **Error Code** | `SESSION_NOT_FOUND` |
| **User-Facing Message** | "This conversation could not be found. Starting a new conversation." |
| **Internal Logging** | Log the invalid session_id |
| **Action** | Return error. Frontend should offer to start a new session. |

---

### 13. Rate Limiting

| Trigger | User exceeds configured request rate |
|:---|:---|
| **HTTP Status** | 429 |
| **Error Code** | `RATE_LIMITED` |
| **User-Facing Message** | "You're sending too many requests. Please wait a moment before trying again." |
| **Headers** | `Retry-After: <seconds>` |
| **Internal Logging** | Log client identifier, request count |

---

## Logging Standards

### What to Log

| Always Log | Never Log |
|:---|:---|
| Error code and type | API keys or secrets |
| Timestamp | User passwords |
| Request path and method | Full raw user PII (if auth exists) |
| Processing stage where error occurred | LLM API keys |
| Relevant context (query text, session ID) | |
| Stack trace (for 500 errors) | |
| Response time | |

### Log Levels

| Level | When |
|:---|:---|
| `ERROR` | System failures (500, 503), database errors, LLM failures |
| `WARN` | Invalid citations removed, low-confidence results, rate limiting |
| `INFO` | Normal request/response cycle, session creation |
| `DEBUG` | Retrieval details, prompt content, LLM response details |

---

## Frontend Error Display

| Error Type | Frontend Behavior |
|:---|:---|
| Validation error (400) | Show inline validation message |
| Not found (404) | Show "not found" message with recovery action |
| Rate limited (429) | Show "please wait" message with countdown |
| Server error (500) | Show generic error message with retry button |
| Service unavailable (503) | Show "service unavailable" with retry button |
| No results (200 with no evidence) | Show the AI's "insufficient evidence" response normally |

---

## Critical Rule

**No error scenario should result in a hallucinated response.** If any component fails, the system must fail gracefully and honestly rather than generating ungrounded information.
