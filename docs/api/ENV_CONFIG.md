# Environment Configuration — BIS Intelligent Assistant

> Related: [SECURITY](SECURITY.md) | [TECH_STACK](../architecture/TECH_STACK.md) | [ARCHITECTURE](../architecture/ARCHITECTURE.md)

---

## Purpose

This document defines all environment variables used by the application. It serves as the specification for the `.env.example` file. **No real secrets, API keys, passwords, or tokens are included in this document.**

---

## Environment File Convention

| File | Purpose | Committed to Git |
|:---|:---|:---|
| `.env` | Actual configuration with real values | **NO** (in `.gitignore`) |
| `.env.example` | Template with placeholder values | **YES** |

---

## Variable Definitions

### Application

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `APP_NAME` | Application display name | Optional | `BIS Intelligent Assistant` | Backend |
| `APP_VERSION` | Application version | Optional | `0.1.0` | Backend |
| `APP_ENV` | Environment mode | Required | `development` / `production` | Backend |
| `APP_PORT` | Backend server port | Required | `8000` | Backend |
| `APP_HOST` | Backend server host | Optional | `0.0.0.0` | Backend |
| `APP_DEBUG` | Enable debug mode | Optional | `true` / `false` | Backend |
| `APP_SECRET_KEY` | Application secret for session signing | Required | `your-secret-key-here` | Backend |

### Frontend

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `FRONTEND_PORT` | Frontend dev server port | Optional | `3000` | Frontend |
| `VITE_API_BASE_URL` | Backend API base URL (Vite convention) | Required | `http://localhost:8000/api/v1` | Frontend |

> **Note:** Frontend environment variable naming depends on the chosen framework. Vite uses `VITE_` prefix. Create React App uses `REACT_APP_` prefix. Adjust accordingly.

### Supabase / Application Database

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `SUPABASE_URL` | Supabase API URL | Required | `http://127.0.0.1:54321` | Backend, Frontend |
| `SUPABASE_ANON_KEY` | Public client anonymous key | Required | `your-anon-key` | Backend, Frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged service-role key | Required (server) | `your-service-role-key` | Backend |
| `SUPABASE_MOCK` | Fallback in-memory DB for offline/zero-Docker dev | Optional | `false` / `true` | Backend |

### AI / RAG Orchestration Service Integration

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `AI_SERVICE_URL` | Downstream AI/RAG engine endpoint | Required | `http://127.0.0.1:8001` | Backend |
| `AI_SERVICE_KEY` | Server-to-server authorization bearer secret | Optional | `your-secret-token` | Backend |
| `AI_MOCK_MODE` | Enable deterministic mock assistant responses | Optional | `true` / `false` | Backend |
| `AI_TIMEOUT_MS` | AI HTTP query timeout in milliseconds | Optional | `30000` | Backend |


### LLM Provider

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `LLM_PROVIDER` | LLM provider name | Required | `gemini` / `openai` / `ollama` | AI |
| `LLM_API_KEY` | API key for LLM provider | Required* | `your-api-key-here` | AI |
| `LLM_MODEL` | Model identifier | Required | `gemini-2.0-flash` / `gpt-4o-mini` | AI |
| `LLM_TEMPERATURE` | Generation temperature | Optional | `0.2` | AI |
| `LLM_MAX_TOKENS` | Maximum response tokens | Optional | `2048` | AI |
| `LLM_TIMEOUT` | API call timeout (seconds) | Optional | `30` | AI |

> *`LLM_API_KEY` is required for cloud providers, not for local models (Ollama).

### Embedding Model

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `EMBEDDING_PROVIDER` | Embedding provider | Required | `gemini` / `openai` / `local` | AI |
| `EMBEDDING_API_KEY` | API key for embedding provider | Required* | `your-api-key-here` | AI |
| `EMBEDDING_MODEL` | Embedding model identifier | Required | `text-embedding-3-small` | AI |
| `EMBEDDING_DIMENSIONS` | Vector dimensions | Optional | `1536` | AI |

> *May be the same as `LLM_API_KEY` if using the same provider.

### Vector Store

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `VECTOR_STORE_TYPE` | Vector store backend | Required | `chroma` / `faiss` / `qdrant` | AI |
| `VECTOR_STORE_PATH` | Path for embedded vector stores | Optional | `./data/vector_store` | AI |
| `VECTOR_STORE_HOST` | Host for client-server vector stores | Optional | `localhost` | AI |
| `VECTOR_STORE_PORT` | Port for client-server vector stores | Optional | `6333` | AI |

### RAG Configuration

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `RAG_TOP_K` | Number of chunks to retrieve | Optional | `10` | AI |
| `RAG_SIMILARITY_THRESHOLD` | Minimum relevance score | Optional | `0.5` | AI |
| `RAG_MAX_CONTEXT_CHUNKS` | Max chunks sent to LLM | Optional | `5` | AI |
| `RAG_MAX_HISTORY_TURNS` | Max conversation turns for context | Optional | `10` | AI |

### CORS

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | Required | `http://localhost:3000` | Backend |

### Logging

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `LOG_LEVEL` | Logging verbosity | Optional | `INFO` / `DEBUG` / `WARNING` | Backend, AI |
| `LOG_FILE` | Log file path | Optional | `./logs/app.log` | Backend |

### Rate Limiting

| Variable | Purpose | Required | Example | Used By |
|:---|:---|:---|:---|:---|
| `RATE_LIMIT_CHAT` | Chat endpoint rate limit | Optional | `20/minute` | Backend |
| `RATE_LIMIT_GENERAL` | General API rate limit | Optional | `60/minute` | Backend |

---

## `.env.example` Template

```bash
# ============================================
# BIS Intelligent Assistant — Environment Config
# ============================================
# Copy this file to .env and fill in real values.
# NEVER commit .env to the repository.
# ============================================

# --- Application ---
APP_NAME=BIS Intelligent Assistant
APP_VERSION=0.1.0
APP_ENV=development
APP_PORT=8000
APP_HOST=0.0.0.0
APP_DEBUG=true
APP_SECRET_KEY=change-this-to-a-random-secret-key

# --- Frontend ---
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:8000/api/v1

# --- Database ---
DATABASE_URL=sqlite:///./app.db
DATABASE_ECHO=false

# --- LLM Provider ---
LLM_PROVIDER=gemini
LLM_API_KEY=your-llm-api-key-here
LLM_MODEL=gemini-2.0-flash
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=2048
LLM_TIMEOUT=30

# --- Embedding Model ---
EMBEDDING_PROVIDER=gemini
EMBEDDING_API_KEY=your-embedding-api-key-here
EMBEDDING_MODEL=text-embedding-004
EMBEDDING_DIMENSIONS=768

# --- Vector Store ---
VECTOR_STORE_TYPE=chroma
VECTOR_STORE_PATH=./data/vector_store

# --- RAG Configuration ---
RAG_TOP_K=10
RAG_SIMILARITY_THRESHOLD=0.5
RAG_MAX_CONTEXT_CHUNKS=5
RAG_MAX_HISTORY_TURNS=10

# --- CORS ---
CORS_ALLOWED_ORIGINS=http://localhost:3000

# --- Logging ---
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log

# --- Rate Limiting ---
RATE_LIMIT_CHAT=20/minute
RATE_LIMIT_GENERAL=60/minute
```

---

## Security Reminders

1. **`.env` must be in `.gitignore`.** This is non-negotiable.
2. **Never put real API keys in `.env.example`.** Use descriptive placeholders.
3. **Never log environment variables** that contain secrets.
4. **Rotate keys immediately** if they are accidentally committed.

---

## Open Decisions

| Decision | Status |
|:---|:---|
| Exact LLM provider and model | **STATUS: TBD** |
| Exact embedding model | **STATUS: TBD** |
| Exact vector store type | **STATUS: TBD** |
| Database type (SQLite vs. PostgreSQL) | **STATUS: TBD** |
| Frontend framework (affects env var prefix) | **STATUS: TBD** |
