# Branch Ownership — BIS Intelligent Assistant

> Related: [GIT_WORKFLOW](GIT_WORKFLOW.md) | [TEAM_PLAN](TEAM_PLAN.md) | [TOPOLOGY_RULES](../architecture/TOPOLOGY_RULES.md)

---

## Purpose

This document maps **branches to directories to team members**, ensuring clear ownership and minimizing merge conflicts. The primary goal is: **MINIMIZE MERGE CONFLICTS.**

---

## Branch → Directory → Owner Mapping

| Branch | Primary Directory | Owner | Secondary Files |
|:---|:---|:---|:---|
| `frontend` | `frontend/` | Member 1 | `docs/frontend/` |
| `backend` | `backend/` | Member 2 | `docs/api/` |
| `ai-rag` | `ai/` | Member 3 | `docs/ai/` |
| `bis-data-qa` | `data/`, `evaluation/` | Member 4 | `docs/bis/`, `docs/testing/` |

---

## Directory Ownership Map

### Exclusive Ownership

These directories should **only** be modified by the designated owner (via their branch):

| Directory | Owner | Branch |
|:---|:---|:---|
| `frontend/src/` | Member 1 | `frontend` |
| `frontend/public/` | Member 1 | `frontend` |
| `backend/app/` | Member 2 | `backend` |
| `ai/pipeline/` | Member 3 | `ai-rag` |
| `ai/prompts/` | Member 3 | `ai-rag` |
| `data/raw/` | Member 4 | `bis-data-qa` |
| `data/processed/` | Member 4 | `bis-data-qa` |
| `data/metadata/` | Member 4 | `bis-data-qa` |
| `evaluation/` | Member 4 | `bis-data-qa` |

### Shared Files

These files may be modified by multiple members and require coordination:

| File / Directory | Who Can Modify | PR Required From |
|:---|:---|:---|
| `README.md` | Any member | At least 1 other member |
| `shared/schemas/` | Any member | All affected members |
| `.env.example` | Any member | At least 1 other member |
| `.gitignore` | Any member | At least 1 other member |
| `docs/product/` | Any member | At least 1 other member |
| `docs/architecture/` | Member 2, Member 3 | At least 1 other member |
| `docs/team/` | Any member | At least 1 other member |

### Shared Contract Files

These files define **interfaces between layers** and have special rules:

| Contract File | Primary Author | Must Be Reviewed By |
|:---|:---|:---|
| `docs/api/API_CONTRACT.md` | Member 2 | Member 1 (consumer) |
| `docs/ai/AI_PIPELINE.md` (service interface) | Member 3 | Member 2 (consumer) |
| `docs/ai/RAG_DATA_SCHEMA.md` | Member 3 | Member 4 (provider) |
| `docs/ai/PROMPT_INTEGRATION.md` | Member 3 | Member 2 (integrator) |

**Rule:** Changes to contract files must be reviewed and approved by both the provider and consumer sides before implementation changes.

---

## Rules for Cross-Domain Changes

### When You Need to Touch Another Domain

1. **Discuss first.** Talk to the domain owner before making changes.
2. **Create a PR.** Never push directly to another domain's files.
3. **Get explicit approval.** The domain owner must approve the PR.
4. **Keep changes minimal.** Only modify what is strictly necessary.
5. **Document why.** Explain in the PR why a cross-domain change was needed.

### Common Cross-Domain Scenarios

| Scenario | Resolution |
|:---|:---|
| Frontend needs a new API field | Member 1 proposes change to `API_CONTRACT.md` → Member 2 reviews and implements |
| Backend needs a new AI response field | Member 2 proposes change to AI service interface → Member 3 reviews and implements |
| AI needs a new metadata field on chunks | Member 3 proposes change to `RAG_DATA_SCHEMA.md` → Member 4 reviews and updates data pipeline |
| A shared schema needs updating | Author proposes change → all affected members review |

---

## Conflict Prevention Checklist

| # | Practice | Description |
|:--|:---------|:------------|
| 1 | **Stay in your lane** | Primarily modify files in your owned directories |
| 2 | **Sync often** | Pull from `develop` into your branch at least daily |
| 3 | **Agree on interfaces first** | Define API contracts and schemas before coding |
| 4 | **Small, focused PRs** | Smaller PRs are easier to review and less likely to conflict |
| 5 | **Communicate changes** | If you must change a shared file, tell the team |
| 6 | **Use feature branches** | Isolate large features in their own branches |
| 7 | **Resolve conflicts immediately** | Don't let conflicts accumulate |
| 8 | **Test after merging** | Verify your code works after pulling latest `develop` |

---

## Visual Summary

```
┌─────────────────────────────────────────────────────────────┐
│                       REPOSITORY                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  frontend/   │  │  backend/    │  │    ai/       │      │
│  │              │  │              │  │              │      │
│  │  MEMBER 1    │  │  MEMBER 2    │  │  MEMBER 3    │      │
│  │  Branch:     │  │  Branch:     │  │  Branch:     │      │
│  │  frontend    │  │  backend     │  │  ai-rag      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  data/       │  │  shared/     │                        │
│  │  evaluation/ │  │              │                        │
│  │              │  │  ALL MEMBERS │                        │
│  │  MEMBER 4    │  │  (with PR)   │                        │
│  │  Branch:     │  │              │                        │
│  │  bis-data-qa │  │              │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  docs/                                           │      │
│  │  Each member owns their domain's docs            │      │
│  │  Shared docs require multi-member review         │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```
