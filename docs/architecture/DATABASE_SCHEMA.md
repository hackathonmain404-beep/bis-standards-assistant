# Database Schema — BIS Intelligent Assistant

> Related: [ARCHITECTURE](ARCHITECTURE.md) | [TECH_STACK](TECH_STACK.md) | [API_CONTRACT](../api/API_CONTRACT.md)

---

## Scope

This document defines the **application database schema** — the data structures used by the backend to manage users, sessions, conversations, and messages.

This is **NOT** the RAG knowledge base schema. For document/chunk/embedding structure, see [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md).

---

## Design Principles

1. **Separation.** Application data (sessions, messages) is stored separately from RAG knowledge data (embeddings, chunks).
2. **Simplicity for MVP.** Start with the minimum viable schema. Expand as features require.
3. **Conversation-first.** The primary data model revolves around sessions and messages.
4. **Traceability.** Messages store both user input and AI responses, including citation metadata.

---

## Entity Relationship

```
User (optional for MVP)
  │
  │ 1:N
  ▼
Session
  │
  │ 1:N
  ▼
Message
  │
  │ 1:N (embedded or linked)
  ▼
Citation
```

---

## Tables

### `users` (Optional — may be deferred past MVP)

> **STATUS: TBD** — User accounts may not be needed for MVP. Include only if authentication is implemented.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID / TEXT | PRIMARY KEY | Unique user identifier |
| `display_name` | TEXT | NULLABLE | User display name |
| `email` | TEXT | UNIQUE, NULLABLE | User email (if auth is implemented) |
| `preferred_language` | TEXT | DEFAULT 'en' | Preferred UI/response language |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now | Account creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT now | Last update time |

---

### `sessions`

A session represents a single conversation thread.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID / TEXT | PRIMARY KEY | Unique session identifier |
| `user_id` | UUID / TEXT | NULLABLE, FK → users.id | Associated user (null if no auth) |
| `title` | TEXT | NULLABLE | Auto-generated or user-set session title |
| `language` | TEXT | DEFAULT 'en' | Session language preference |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now | Session creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT now | Last activity time |
| `is_active` | BOOLEAN | DEFAULT true | Whether the session is active |

**Indexes:**
- `idx_sessions_user_id` on `user_id`
- `idx_sessions_updated_at` on `updated_at`

---

### `messages`

Each message is either a user message or an assistant response within a session.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID / TEXT | PRIMARY KEY | Unique message identifier |
| `session_id` | UUID / TEXT | NOT NULL, FK → sessions.id | Parent session |
| `role` | TEXT | NOT NULL, CHECK ('user', 'assistant', 'system') | Message sender role |
| `content` | TEXT | NOT NULL | Message text content |
| `intent` | TEXT | NULLABLE | Detected intent (for assistant messages) |
| `language` | TEXT | DEFAULT 'en' | Language of this message |
| `metadata` | JSON / TEXT | NULLABLE | Additional structured metadata |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now | Message creation time |

**Indexes:**
- `idx_messages_session_id` on `session_id`
- `idx_messages_created_at` on `created_at`

**Notes:**
- Messages are ordered by `created_at` within a session.
- `metadata` can store additional information such as processing time, model used, retrieval stats.

---

### `citations`

Citations link assistant messages to their source evidence.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `id` | UUID / TEXT | PRIMARY KEY | Unique citation identifier |
| `message_id` | UUID / TEXT | NOT NULL, FK → messages.id | Parent message |
| `citation_index` | INTEGER | NOT NULL | Position in the citation list (1, 2, 3...) |
| `standard_id` | TEXT | NULLABLE | Indian Standard number (e.g., "IS 14543") |
| `document_title` | TEXT | NULLABLE | Title of the source document |
| `section` | TEXT | NULLABLE | Section reference |
| `clause` | TEXT | NULLABLE | Clause reference |
| `snippet` | TEXT | NULLABLE | Relevant text snippet from the source |
| `source_document_id` | TEXT | NULLABLE | Reference to RAG document ID (for linking) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now | Citation creation time |

**Indexes:**
- `idx_citations_message_id` on `message_id`

---

### `app_config` (Optional)

Application-level configuration stored in the database.

| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `key` | TEXT | PRIMARY KEY | Configuration key |
| `value` | TEXT | NOT NULL | Configuration value |
| `description` | TEXT | NULLABLE | Human-readable description |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT now | Last update time |

---

## Separation from RAG Knowledge

| Concern | Application Database | RAG Knowledge Base |
|:---|:---|:---|
| **Purpose** | User sessions, messages, citations | BIS document chunks, embeddings, metadata |
| **Schema** | This document | [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md) |
| **Storage** | SQLite / PostgreSQL (TBD) | Vector DB + Document Store (TBD) |
| **Managed by** | Backend (Member 2) | Knowledge/QA (Member 4) + AI/RAG (Member 3) |
| **Changes with** | User interactions | Knowledge base updates |

---

## MVP Schema Notes

1. **Start minimal.** For MVP, `sessions`, `messages`, and `citations` are the core tables.
2. **Users table is optional for MVP.** If no authentication is implemented, `user_id` can be null.
3. **SQLite is acceptable for MVP.** Single-file database with zero configuration.
4. **Citations can be embedded.** If using a NoSQL or JSON approach, citations can be stored as a JSON array within the message record instead of a separate table.
5. **Schema may evolve.** This is the starting point. Additional tables (e.g., saved reports, feedback) may be added in later phases.

---

## Finalized Architecture Decisions

| Decision | Status | Resolution |
|:---|:---|:---|
| Database engine | **DECIDED** | PostgreSQL via Supabase (see ADR-016) |
| User authentication | **DECIDED** | Supabase Auth with application profile linkage |
| Citations storage | **DECIDED** | Dedicated relational `citations` table with parent message foreign key |
| Migrations tooling | **DECIDED** | Declarative SQL migrations in `supabase/migrations/` |
| Security model | **DECIDED** | PostgreSQL Row Level Security (RLS) with DENY BY DEFAULT |

