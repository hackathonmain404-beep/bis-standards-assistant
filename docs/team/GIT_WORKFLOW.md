# Git Workflow — BIS Intelligent Assistant

> Related: [BRANCH_OWNERSHIP](BRANCH_OWNERSHIP.md) | [TEAM_PLAN](TEAM_PLAN.md)

---

## Branch Model

### Core Branches

| Branch | Purpose | Protected | Merge From |
|:---|:---|:---|:---|
| `main` | Stable, demo-ready code | Yes | `develop` only |
| `develop` | Integration branch — latest working code | Yes | Domain branches |

### Domain Branches

| Branch | Owner | Merges Into | Primary Files |
|:---|:---|:---|:---|
| `frontend` | Member 1 | `develop` | `frontend/` |
| `backend` | Member 2 | `develop` | `backend/` |
| `ai-rag` | Member 3 | `develop` | `ai/` |
| `bis-data-qa` | Member 4 | `develop` | `data/`, `evaluation/` |

### Feature Branches

For larger features within a domain, create feature branches from the domain branch:

```
frontend/feature-citation-panel
backend/feature-session-api
ai-rag/feature-hybrid-search
bis-data-qa/feature-electrical-standards
```

**Convention:** `<domain>/<feature-description>`

---

## Branch Flow

```
main
  ↑ (merge when stable/demo-ready)
develop
  ↑ (merge via PR + review)
  ├── frontend
  │     └── frontend/feature-xxx
  ├── backend
  │     └── backend/feature-xxx
  ├── ai-rag
  │     └── ai-rag/feature-xxx
  └── bis-data-qa
        └── bis-data-qa/feature-xxx
```

---

## Pull Request Process

### Creating a PR

1. Push your changes to your domain branch (or feature branch)
2. Open a PR targeting `develop`
3. Fill in the PR description:
   - What changed
   - Why it changed
   - Which files were modified
   - Any interface changes
4. Request review from appropriate reviewers

### PR Requirements

| Requirement | Mandatory |
|:---|:---|
| Descriptive title | Yes |
| Description of changes | Yes |
| No merge conflicts with `develop` | Yes |
| Reviewer approval | Yes (at least 1) |
| Tests pass (when tests exist) | Yes |
| Documentation updated (if interface changes) | Yes |

### Who Reviews What

| PR Domain | Required Reviewers |
|:---|:---|
| `frontend/` changes | Member 1 (self-review) + 1 other |
| `backend/` changes | Member 2 (self-review) + 1 other |
| `ai/` changes | Member 3 (self-review) + 1 other |
| `data/`, `evaluation/` changes | Member 4 (self-review) + 1 other |
| Shared files (`shared/`, docs, README) | At least 2 members |
| Cross-domain changes | All affected domain owners |

---

## Merge Policy

### Into `develop`

| Rule | Description |
|:---|:---|
| **Merge method** | Merge commit (preserve history) or squash merge (cleaner history) — team should decide |
| **Reviewer approval** | At least 1 approval required |
| **Conflicts** | Must be resolved before merge |
| **Tests** | Must pass (when CI exists) |

### Into `main`

| Rule | Description |
|:---|:---|
| **When** | Code is stable and demo-ready |
| **Merge method** | Merge commit from `develop` |
| **Reviewer approval** | Team consensus |
| **Testing** | End-to-end testing completed |
| **Documentation** | Up to date |

---

## Commit Conventions

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | Usage |
|:---|:---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, no logic change |
| `refactor` | Code restructuring, no feature change |
| `test` | Adding or updating tests |
| `chore` | Build, config, tooling changes |

### Scopes

| Scope | For |
|:---|:---|
| `frontend` | Frontend changes |
| `backend` | Backend changes |
| `ai` | AI/RAG changes |
| `data` | Knowledge base / data changes |
| `eval` | Evaluation changes |
| `docs` | Documentation changes |
| `shared` | Shared schema/contract changes |

### Examples

```
feat(frontend): add citation card component
fix(backend): handle empty session_id in chat endpoint
feat(ai): implement hybrid retrieval with BM25
docs(api): update chat endpoint response schema
chore(data): add electrical standards processing script
test(eval): add hallucination trap test cases
```

---

## Conflict Handling

### Prevention

1. **Stay in your domain.** Most conflicts arise from touching the same files.
2. **Agree on shared interfaces first.** Changes to API contracts, schemas, and shared code should be agreed before implementation.
3. **Sync with `develop` regularly.** Pull from `develop` into your domain branch frequently.
4. **Communicate cross-domain changes.** If you need to touch another domain's files, discuss first.

### Resolution

1. **Pull latest `develop`** into your branch.
2. **Resolve conflicts locally** — prefer the newer change unless it breaks something.
3. **Test after resolution** — ensure your code and the merged code both work.
4. **If conflicting with another member's work** — discuss and resolve together.

---

## Release / Demo Strategy

### Demo Build

1. All domain branches merged into `develop`
2. End-to-end testing on `develop`
3. Fix any integration issues
4. Merge `develop` into `main`
5. Tag the release: `v0.1.0-demo`

### Tagging Convention

```
v<major>.<minor>.<patch>[-label]
```

Examples:
- `v0.1.0-mvp` — First MVP
- `v0.2.0` — Phase 2 release
- `v0.1.1` — Bug fix release

---

## Quick Reference

| Action | Command |
|:---|:---|
| Create feature branch | `git checkout -b frontend/feature-name frontend` |
| Sync with develop | `git pull origin develop` |
| Push changes | `git push origin <branch>` |
| Create PR | Via GitHub UI or `gh pr create` |
| Tag release | `git tag -a v0.1.0-mvp -m "MVP release"` |

---

## Open Decisions

| Decision | Status |
|:---|:---|
| Merge method (squash vs. merge commit) | **STATUS: TBD** |
| CI/CD pipeline (GitHub Actions) | **STATUS: TBD** |
| Branch protection rules on GitHub | **STATUS: TBD** |
