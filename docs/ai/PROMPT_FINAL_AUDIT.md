# Prompt Final Audit — BIS Intelligent Assistant

> Related: [PROMPT_INTEGRATION](PROMPT_INTEGRATION.md) | [AI_RULES](AI_RULES.md) | [AI_EVALUATION](AI_EVALUATION.md)

---

## Purpose

This document provides a comprehensive checklist for reviewing prompts before production or demo use. Every prompt in the system must pass this audit to ensure correctness, safety, and alignment with project rules.

---

## Audit Checklist

### 1. Anti-Hallucination

| # | Check | Pass/Fail |
|:--|:------|:----------|
| 1.1 | System prompt explicitly prohibits inventing standard numbers | ☐ |
| 1.2 | System prompt explicitly prohibits inventing clause references | ☐ |
| 1.3 | System prompt explicitly prohibits inventing certification schemes | ☐ |
| 1.4 | System prompt explicitly prohibits inventing testing requirements | ☐ |
| 1.5 | System prompt explicitly prohibits inventing laboratory information | ☐ |
| 1.6 | System prompt explicitly prohibits inventing official procedures | ☐ |
| 1.7 | System prompt explicitly prohibits inventing source references | ☐ |
| 1.8 | "Use ONLY the provided evidence" instruction is present | ☐ |
| 1.9 | Tested with hallucination trap queries — no fabricated information | ☐ |

### 2. Evidence Grounding

| # | Check | Pass/Fail |
|:--|:------|:----------|
| 2.1 | Evidence block is clearly delimited (start/end markers) | ☐ |
| 2.2 | Each evidence item includes source metadata (standard ID, clause) | ☐ |
| 2.3 | Instruction to base answer ONLY on provided evidence is present | ☐ |
| 2.4 | Tested: response does not contain information absent from evidence | ☐ |
| 2.5 | Tested: response with empty evidence produces "insufficient info" message | ☐ |

### 3. Citation Requirements

| # | Check | Pass/Fail |
|:--|:------|:----------|
| 3.1 | Prompt instructs the model to use inline citations [1], [2] | ☐ |
| 3.2 | Prompt instructs the model to provide a source list | ☐ |
| 3.3 | Citation format is clearly specified | ☐ |
| 3.4 | Tested: generated citations map to actual evidence items | ☐ |
| 3.5 | Tested: no citations to non-existent sources | ☐ |

### 4. Uncertainty Behavior

| # | Check | Pass/Fail |
|:--|:------|:----------|
| 4.1 | Prompt includes instruction for insufficient evidence scenario | ☐ |
| 4.2 | Tested: model says "I could not find..." when evidence is missing | ☐ |
| 4.3 | Tested: model distinguishes "supported" vs. "interpreted" vs. "unverified" | ☐ |
| 4.4 | Model does not express false confidence when evidence is weak | ☐ |

### 5. System Instructions Completeness

| # | Check | Pass/Fail |
|:--|:------|:----------|
| 5.1 | Role definition is clear and specific | ☐ |
| 5.2 | Domain scope is defined (BIS, Indian Standards, etc.) | ☐ |
| 5.3 | Safety instructions are present (no legal advice, no compliance declarations) | ☐ |
| 5.4 | Out-of-scope handling is defined | ☐ |
| 5.5 | All behavioral rules from [AI_RULES.md](AI_RULES.md) are reflected | ☐ |

### 6. Output Consistency

| # | Check | Pass/Fail |
|:--|:------|:----------|
| 6.1 | Output format is clearly specified in the prompt | ☐ |
| 6.2 | Tested: output follows the specified format consistently | ☐ |
| 6.3 | Response structure is parseable by the backend (if structured output) | ☐ |
| 6.4 | Follow-up suggestions are generated when appropriate | ☐ |
| 6.5 | Clarification questions are generated when information is insufficient | ☐ |

### 7. Multilingual Correctness

| # | Check | Pass/Fail |
|:--|:------|:----------|
| 7.1 | Language instruction is present in the prompt | ☐ |
| 7.2 | "Do not translate technical terms" instruction is present | ☐ |
| 7.3 | Tested: standard numbers are NOT translated (e.g., IS 14543 stays as-is) | ☐ |
| 7.4 | Tested: clause numbers are NOT translated | ☐ |
| 7.5 | Tested: scheme names are NOT translated (Scheme-I, CRS, ISI Mark) | ☐ |
| 7.6 | Tested: factual meaning is preserved in translated responses | ☐ |

### 8. Context Handling

| # | Check | Pass/Fail |
|:--|:------|:----------|
| 8.1 | Conversation history is properly formatted in the prompt | ☐ |
| 8.2 | Tested: model correctly resolves "this product" from context | ☐ |
| 8.3 | Tested: model accumulates product attributes from multi-turn conversation | ☐ |
| 8.4 | Context window does not exceed model limits | ☐ |
| 8.5 | History truncation preserves the most relevant messages | ☐ |

### 9. Edge Cases

| # | Check | Pass/Fail |
|:--|:------|:----------|
| 9.1 | Tested: empty query handling | ☐ |
| 9.2 | Tested: very long query handling | ☐ |
| 9.3 | Tested: query with special characters | ☐ |
| 9.4 | Tested: query requesting harmful information | ☐ |
| 9.5 | Tested: prompt injection attempts | ☐ |
| 9.6 | Tested: query in unsupported language | ☐ |

---

## Audit Process

### When to Audit

| Trigger | Action |
|:---|:---|
| New system prompt created | Full audit |
| System prompt modified | Full audit |
| New evidence format introduced | Sections 2, 3 |
| Before demo | Full audit |
| Before any deployment | Full audit |
| After LLM model change | Full audit |

### Who Audits

| Auditor | Sections |
|:---|:---|
| Member 3 (AI/RAG) | All sections |
| Member 4 (BIS/QA) | Sections 1–4 (accuracy and hallucination) |
| Member 2 (Backend) | Section 6 (output parsing) |
| Member 1 (Frontend) | Section 6 (display correctness) |

### Audit Record

Each audit should record:

```
Audit Date: YYYY-MM-DD
Prompt Version: vX.X
Auditor: [Name]
Result: PASS / FAIL
Failed Checks: [List]
Action Items: [List]
```

---

## Quick Reference: Critical Failures

Any prompt that exhibits these behaviors **MUST NOT** be used:

| Critical Failure | Example |
|:---|:---|
| Invents a standard number | "IS 99999 covers this product" (does not exist) |
| Invents a clause | "Clause 15.7 requires..." (does not exist) |
| Cites a standard not in evidence | References IS 302 when only IS 14543 was retrieved |
| Declares compliance | "Your product is BIS-compliant" |
| Provides legal advice | "You are legally required to..." |
| Answers without evidence | Provides specific BIS information when no evidence was retrieved |
| Translates standard numbers | "आईएस १४५४३" instead of "IS 14543" |
