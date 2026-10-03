# AI Evaluation — BIS Intelligent Assistant

> Related: [AI_PIPELINE](AI_PIPELINE.md) | [AI_RULES](AI_RULES.md) | [TESTING](../testing/TESTING.md) | [BIS_SOURCE_POLICY](../bis/BIS_SOURCE_POLICY.md)

---

## Purpose

This document defines how AI quality is measured. It covers retrieval accuracy, generation quality, citation correctness, hallucination detection, and the structure for evaluation test cases.

---

## Evaluation Dimensions

| Dimension | What It Measures | Priority |
|:---|:---|:---|
| **Retrieval Accuracy** | Are the correct documents/chunks retrieved? | **CRITICAL** |
| **Relevance** | Are the retrieved chunks relevant to the query? | **CRITICAL** |
| **Groundedness** | Is the generated answer supported by retrieved evidence? | **CRITICAL** |
| **Citation Accuracy** | Do cited standard numbers and clauses actually exist? | **CRITICAL** |
| **Hallucination Rate** | How often does the system invent standards/clauses/requirements? | **CRITICAL** |
| **Product-to-Standard Mapping** | Does the system find the correct standard for a product? | HIGH |
| **Answer Completeness** | Does the answer address the user's question fully? | HIGH |
| **Answer Clarity** | Is the answer understandable to the target user? | MEDIUM |
| **Multilingual Quality** | Is the translated response accurate and natural? | MEDIUM |
| **Response Latency** | How quickly does the system respond? | MEDIUM |
| **Failure Handling** | Does the system handle missing data gracefully? | HIGH |
| **Context Awareness** | Does multi-turn context improve answer quality? | MEDIUM |

---

## Evaluation Metrics

### Retrieval Metrics

| Metric | Definition | Target |
|:---|:---|:---|
| **Recall@K** | Proportion of relevant chunks found in top K results | ≥ 0.80 |
| **Precision@K** | Proportion of top K results that are relevant | ≥ 0.60 |
| **MRR (Mean Reciprocal Rank)** | Average of 1/rank of the first relevant result | ≥ 0.70 |

### Generation Metrics

| Metric | Definition | Target |
|:---|:---|:---|
| **Groundedness Score** | % of answer claims supported by retrieved evidence | ≥ 0.95 |
| **Hallucination Rate** | % of responses containing fabricated BIS information | **0%** |
| **Citation Accuracy** | % of citations that map to real documents/clauses | **100%** |
| **Answer Relevance** | Does the answer address the actual question? | ≥ 0.85 |

### Product-to-Standard Metrics

| Metric | Definition | Target |
|:---|:---|:---|
| **Standard Match Accuracy** | Does the system find the correct standard for a product? | ≥ 0.80 |
| **WHY Explanation Quality** | Does the system explain why the standard is relevant? | Qualitative review |

### Operational Metrics

| Metric | Definition | Target |
|:---|:---|:---|
| **Response Latency (P50)** | Median response time | < 5 seconds |
| **Response Latency (P95)** | 95th percentile response time | < 15 seconds |
| **Error Rate** | % of queries that result in system errors | < 2% |

---

## Evaluation Test Case Structure

Each evaluation test case follows this format:

### Test Case Template

```yaml
test_id: "TC-001"
category: "product_to_standard"  # See categories below
query: "I manufacture a domestic electric steam iron operating at 230V."
language: "en"
conversation_history: []  # Empty for single-turn; populated for multi-turn

# Expected Results
expected:
  intent: "PRODUCT_DISCOVERY"
  relevant_standards:
    - standard_id: "IS 302-2-3"
      reason: "Specific safety standard for electric irons"
    - standard_id: "IS 302-1"
      reason: "General safety standard for household appliances"
  must_mention: ["IS 302-2-3", "electric iron", "safety"]
  must_not_mention: []  # Standards/claims that should NOT appear
  should_cite_sources: true
  acceptable_uncertainty: false  # Should NOT say "I don't know"

# Evaluation Results (filled during testing)
results:
  retrieved_chunks: []
  generated_answer: ""
  citations: []
  citation_accuracy: null  # 0.0 - 1.0
  groundedness: null  # 0.0 - 1.0
  standard_match: null  # true/false
  hallucination_detected: null  # true/false
  latency_ms: null
  result: null  # PASS / FAIL / PARTIAL
  notes: ""
```

### Test Case Categories

| Category | Description |
|:---|:---|
| `standard_query` | Direct questions about a specific standard |
| `product_to_standard` | Product description → standard discovery |
| `certification_guidance` | Certification scheme and process questions |
| `testing_requirements` | Testing-related queries |
| `lab_discovery` | Laboratory finding queries |
| `hallmarking` | Hallmarking-related queries |
| `consumer_query` | Consumer-oriented BIS questions |
| `clause_explanation` | Clause-level understanding queries |
| `multi_turn` | Context-dependent follow-up queries |
| `clarification` | Queries that should trigger clarification |
| `insufficient_evidence` | Queries where the system should report insufficient evidence |
| `hallucination_trap` | Queries designed to induce hallucination (should NOT hallucinate) |
| `out_of_scope` | Non-BIS queries (should be declined) |
| `multilingual` | Non-English queries |

---

## Hallucination-Specific Tests

These tests are designed to verify that the system does NOT hallucinate:

### Hallucination Trap Examples

| Test | Query | Expected Behavior |
|:---|:---|:---|
| Non-existent standard | "What are the requirements of IS 99999?" | Should say standard not found |
| Plausible but fake standard | "Tell me about IS 8723-Part 6 for solar panels" | Should say cannot verify (if not in KB) |
| Invented clause request | "Explain clause 99.1 of IS 14543" | Should say clause not found |
| Product with no standard | "What BIS standard covers quantum computers?" | Should say no standard found |
| Leading question | "Confirm that IS 302 requires 500V testing" | Should verify against evidence, not confirm blindly |

---

## Evaluation Process

### Manual Evaluation (MVP)

1. **Create golden test dataset** — 50+ test cases across all categories
2. **Run each test case** through the pipeline
3. **Record results** in the test case template
4. **Calculate metrics** across the dataset
5. **Flag failures** for investigation

### Automated Evaluation (Future)

1. **Automated test runner** — Execute test cases and compare with expected results
2. **LLM-as-judge** — Use an LLM to evaluate groundedness and relevance (with human spot-checking)
3. **CI integration** — Run evaluation on every knowledge base or pipeline change

---

## Golden Test Dataset Requirements

| Requirement | Minimum |
|:---|:---|
| Total test cases | 50+ |
| Product-to-standard cases | 10+ |
| Hallucination trap cases | 10+ |
| Multi-turn cases | 5+ |
| Insufficient evidence cases | 5+ |
| Per covered product category | 5+ cases |

### Who Creates Test Cases

| Category | Primary Author |
|:---|:---|
| Standard queries, product-to-standard, certification | Member 4 (BIS/QA) |
| Hallucination traps, edge cases | Member 3 (AI/RAG) + Member 4 |
| Multi-turn, clarification | Member 3 (AI/RAG) |
| UI/integration scenarios | Member 1 (Frontend) + Member 2 (Backend) |

---

## Evaluation Reporting

After each evaluation run, produce a summary:

```
Evaluation Report — [Date]
═══════════════════════════

Total test cases:        XX
Passed:                  XX
Failed:                  XX
Partial:                 XX

Retrieval Recall@10:     X.XX
Citation Accuracy:       X.XX%
Groundedness Score:      X.XX
Hallucination Rate:      X.XX%
Standard Match Accuracy: X.XX%

Failed Cases:
- TC-XXX: [description of failure]
- TC-XXX: [description of failure]

Action Items:
- [Item 1]
- [Item 2]
```

---

## Open Decisions

| Decision | Status |
|:---|:---|
| LLM-as-judge evaluation criteria | **STATUS: TBD** |
| Automated evaluation framework | **STATUS: TBD** |
| Evaluation frequency | **STATUS: TBD** |
| Groundedness scoring method | **STATUS: TBD** |
