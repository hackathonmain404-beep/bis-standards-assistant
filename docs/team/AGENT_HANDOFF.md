# Agent Handoff — BIS Intelligent Assistant

> Related: [README](../../README.md) | [ARCHITECTURE](../architecture/ARCHITECTURE.md) | [TOPOLOGY_RULES](../architecture/TOPOLOGY_RULES.md) | [BRANCH_OWNERSHIP](BRANCH_OWNERSHIP.md)

---

## Purpose

This document provides rules and guidelines for AI coding agents working on this project. If you are an AI agent (e.g., Copilot, Cursor, Gemini Code Assist, or similar), read this document before making any changes.

---

## Before You Do Anything

### Step 1: Read the Project Overview

1. Read [README.md](../../README.md) — understand what this project is
2. Read [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) — understand how the system is designed
3. Read [TOPOLOGY_RULES.md](../architecture/TOPOLOGY_RULES.md) — understand what goes where

### Step 2: Identify Your Scope

Before making changes, determine **which domain** your task belongs to:

| If your task involves... | Read... | Modify only... |
|:---|:---|:---|
| UI, chat interface, frontend | [UI_SPEC](../frontend/UI_SPEC.md), [API_CONTRACT](../api/API_CONTRACT.md) | `frontend/` |
| API endpoints, backend logic | [API_CONTRACT](../api/API_CONTRACT.md), [DATABASE_SCHEMA](../architecture/DATABASE_SCHEMA.md) | `backend/` |
| RAG pipeline, prompts, retrieval | [AI_PIPELINE](../ai/AI_PIPELINE.md), [AI_RULES](../ai/AI_RULES.md) | `ai/` |
| BIS data, knowledge base, evaluation | [BIS_KNOWLEDGE_SPEC](../bis/BIS_KNOWLEDGE_SPEC.md), [RAG_DATA_SCHEMA](../ai/RAG_DATA_SCHEMA.md) | `data/`, `evaluation/` |

### Step 3: Check the Relevant Contract

| Before changing... | Check... |
|:---|:---|
| Frontend API calls | [API_CONTRACT.md](../api/API_CONTRACT.md) |
| Backend API endpoints | [API_CONTRACT.md](../api/API_CONTRACT.md) |
| Backend → AI integration | [AI_PIPELINE.md](../ai/AI_PIPELINE.md), [PROMPT_INTEGRATION.md](../ai/PROMPT_INTEGRATION.md) |
| AI retrieval logic | [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md) |
| Data processing pipeline | [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md), [BIS_KNOWLEDGE_SPEC](../bis/BIS_KNOWLEDGE_SPEC.md) |

---

## Rules for AI Agents

### 1. Respect Ownership Boundaries

- **DO NOT** modify files outside your assigned domain without explicit instruction.
- If a task requires cross-domain changes, implement only your domain's part and note the dependency.

### 2. Follow the API Contract

- Frontend must consume the API as defined in [API_CONTRACT.md](../api/API_CONTRACT.md).
- Backend must implement the API as defined in [API_CONTRACT.md](../api/API_CONTRACT.md).
- Do not invent new endpoints or change response formats without updating the contract.

### 3. Follow AI Rules

- All AI/RAG changes must comply with [AI_RULES.md](../ai/AI_RULES.md).
- Never implement a prompt that could lead to hallucination of BIS information.
- Always require source citations in generated responses.

### 4. Preserve Documentation

- Do not delete or overwrite documentation without good reason.
- If your changes affect an interface or architecture, **update the relevant documentation**.
- If you change the API, update [API_CONTRACT.md](../api/API_CONTRACT.md).
- If you change the AI pipeline, update [AI_PIPELINE.md](../ai/AI_PIPELINE.md).

### 5. Environment and Secrets

- Never hardcode API keys, passwords, or secrets.
- Use environment variables as defined in [ENV_CONFIG.md](../api/ENV_CONFIG.md).
- Check `.env.example` for available configuration.

### 6. Error Handling

- Follow the error handling patterns in [ERROR_HANDLING.md](../api/ERROR_HANDLING.md).
- Never return raw stack traces to the frontend.
- Never generate an AI response when the retrieval pipeline fails.

### 7. Testing Awareness

- Be aware of the testing strategy in [TESTING.md](../testing/TESTING.md).
- If you add a new feature, consider what tests should exist.
- For AI changes, be aware of hallucination trap tests in [AI_EVALUATION.md](../ai/AI_EVALUATION.md).

### 8. Do Not Guess Unresolved Decisions

- Many technical decisions are marked **STATUS: TBD** in the documentation.
- Do not silently resolve these decisions by implementing something.
- If a TBD decision blocks your task, note it and ask for clarification.

### 9. Document Significant Changes

If you make a significant architectural or design decision:
1. Add it to [DECISIONS.md](../architecture/DECISIONS.md)
2. Follow the ADR format
3. Mark it as decided with context and reasoning

---

## Quick Reference: Key Files

| Purpose | File |
|:---|:---|
| Project overview | [README.md](../../README.md) |
| System architecture | [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) |
| Repository structure | [TOPOLOGY_RULES.md](../architecture/TOPOLOGY_RULES.md) |
| API specification | [API_CONTRACT.md](../api/API_CONTRACT.md) |
| AI pipeline | [AI_PIPELINE.md](../ai/AI_PIPELINE.md) |
| AI behavioral rules | [AI_RULES.md](../ai/AI_RULES.md) |
| RAG data schema | [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md) |
| Prompt design | [PROMPT_INTEGRATION.md](../ai/PROMPT_INTEGRATION.md) |
| Database schema | [DATABASE_SCHEMA.md](../architecture/DATABASE_SCHEMA.md) |
| Error handling | [ERROR_HANDLING.md](../api/ERROR_HANDLING.md) |
| Security | [SECURITY.md](../api/SECURITY.md) |
| Environment config | [ENV_CONFIG.md](../api/ENV_CONFIG.md) |
| Tech stack | [TECH_STACK.md](../architecture/TECH_STACK.md) |
| Open decisions | [DECISIONS.md](../architecture/DECISIONS.md) |
| BIS knowledge structure | [BIS_KNOWLEDGE_SPEC.md](../bis/BIS_KNOWLEDGE_SPEC.md) |
| Source policy | [BIS_SOURCE_POLICY.md](../bis/BIS_SOURCE_POLICY.md) |
| UI specification | [UI_SPEC.md](../frontend/UI_SPEC.md) |
| Testing strategy | [TESTING.md](../testing/TESTING.md) |

---

## Common Mistakes to Avoid

| Mistake | Why It's Wrong | What to Do Instead |
|:---|:---|:---|
| Hardcoding an API key | Security violation | Use environment variables |
| Changing API response format without updating docs | Breaks frontend | Update API_CONTRACT.md first |
| Adding AI logic to the frontend | Architecture violation | AI logic belongs in `ai/` |
| Generating BIS responses without retrieval | Hallucination risk | Always retrieve then generate |
| Ignoring TBD decisions | May conflict with team decisions | Ask for clarification |
| Modifying another domain's files | Ownership violation | Discuss with the owner first |
| Removing existing documentation | Loses context | Preserve and update instead |
| Skipping error handling | Poor UX | Follow ERROR_HANDLING.md |
