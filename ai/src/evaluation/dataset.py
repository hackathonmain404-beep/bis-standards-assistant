"""
Golden Benchmark Dataset — BIS Intelligent Assistant Evaluation
Defines comprehensive evaluation test cases covering product-to-standard mapping,
standard lookups, hallucination traps, ambiguity/clarification, and domain boundaries.
Follows docs/ai/AI_EVALUATION.md.
"""

from __future__ import annotations

from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ExpectedOutcome(BaseModel):
    """Expected evaluation criteria for a test case."""
    model_config = ConfigDict(frozen=True, extra="forbid")

    intent: Optional[str] = Field(None, description="Expected canonical intent string")
    relevant_standards: List[str] = Field(default_factory=list, description="Standards that should be matched")
    must_mention: List[str] = Field(default_factory=list, description="Keywords or phrases that must appear")
    must_not_mention: List[str] = Field(default_factory=list, description="Prohibited phrases (prevent hallucination)")
    should_cite_sources: bool = Field(True, description="Whether citations are expected in the response")
    expect_clarification: bool = Field(False, description="Whether query should trigger clarification request")
    expect_refusal: bool = Field(False, description="Whether query should be declined as out-of-scope")
    expect_insufficient_evidence: bool = Field(False, description="Whether query triggers insufficient evidence path")


class EvaluationTestCase(BaseModel):
    """Standard evaluation test case matching docs/ai/AI_EVALUATION.md."""
    model_config = ConfigDict(frozen=True, extra="forbid")

    test_id: str = Field(..., description="Unique test case identifier (e.g. 'TC-001')")
    category: str = Field(..., description="Evaluation category")
    query: str = Field(..., description="Natural language query under evaluation")
    language: str = Field(default="en", description="Query language")
    conversation_history: List[Dict[str, str]] = Field(default_factory=list, description="Conversational context")
    expected: ExpectedOutcome = Field(..., description="Ground truth expectations")


# Authoritative Golden Dataset
GOLDEN_BENCHMARK_DATASET: List[EvaluationTestCase] = [
    # ── Category 1: Product to Standard Mapping ────────────────────────────────
    EvaluationTestCase(
        test_id="TC-001",
        category="product_to_standard",
        query="I manufacture a domestic electric steam iron operating at 230V, what standard applies?",
        expected=ExpectedOutcome(
            intent="PRODUCT_DISCOVERY",
            relevant_standards=["IS 302 (Part 2/Sec 3):2007", "IS 302-1"],
            must_mention=["302", "electric iron", "safety"],
            must_not_mention=["IS 14543"],
            should_cite_sources=True,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-002",
        category="product_to_standard",
        query="Which Indian standard applies to commercial packaged drinking water bottles?",
        expected=ExpectedOutcome(
            intent="PRODUCT_DISCOVERY",
            relevant_standards=["IS 14543:2016"],
            must_mention=["IS 14543", "packaged drinking water"],
            must_not_mention=["IS 302"],
            should_cite_sources=True,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-003",
        category="product_to_standard",
        query="What standard is applicable for manufacturing electric dry irons?",
        expected=ExpectedOutcome(
            intent="PRODUCT_DISCOVERY",
            relevant_standards=["IS 302 (Part 2/Sec 3):2007"],
            must_mention=["302", "iron"],
            should_cite_sources=True,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-004",
        category="product_to_standard",
        query="Electric iron rated at 440V three-phase",
        expected=ExpectedOutcome(
            relevant_standards=["IS 302 (Part 2/Sec 3):2007"],
            must_mention=["voltage"],
            should_cite_sources=True,
        ),
    ),

    # ── Category 2: Direct Standard Queries ────────────────────────────────────
    EvaluationTestCase(
        test_id="TC-005",
        category="standard_query",
        query="What is the scope of IS 14543:2016 for packaged drinking water?",
        expected=ExpectedOutcome(
            intent="STANDARD_QUERY",
            relevant_standards=["IS 14543:2016"],
            must_mention=["IS 14543", "packaged drinking water"],
            should_cite_sources=True,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-006",
        category="standard_query",
        query="Tell me about IS 302 (Part 2/Sec 3):2007.",
        expected=ExpectedOutcome(
            intent="STANDARD_QUERY",
            relevant_standards=["IS 302 (Part 2/Sec 3):2007"],
            must_mention=["302", "electric iron"],
            should_cite_sources=True,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-007",
        category="standard_query",
        query="What are the general requirements under IS 14543?",
        expected=ExpectedOutcome(
            relevant_standards=["IS 14543:2016"],
            must_mention=["14543"],
            should_cite_sources=True,
        ),
    ),

    # ── Category 3: Clause-Level Explanations ──────────────────────────────────
    EvaluationTestCase(
        test_id="TC-008",
        category="clause_explanation",
        query="What does Clause 8.1 in IS 302-2-3 deal with?",
        expected=ExpectedOutcome(
            intent="CLAUSE_EXPLANATION",
            relevant_standards=["IS 302 (Part 2/Sec 3):2007"],
            must_mention=["8.1", "live parts"],
            should_cite_sources=True,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-009",
        category="clause_explanation",
        query="Explain Clause 4.2 in IS 14543.",
        expected=ExpectedOutcome(
            intent="CLAUSE_EXPLANATION",
            relevant_standards=["IS 14543:2016"],
            must_mention=["4.2"],
            should_cite_sources=True,
        ),
    ),

    # ── Category 4: Testing & Certification Guidance ───────────────────────────
    EvaluationTestCase(
        test_id="TC-010",
        category="testing_requirements",
        query="What testing requirements apply to packaged drinking water under IS 14543?",
        expected=ExpectedOutcome(
            intent="TESTING_REQUIREMENTS",
            relevant_standards=["IS 14543:2016"],
            must_mention=["14543", "test"],
            should_cite_sources=True,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-011",
        category="certification_guidance",
        query="How do I apply for a BIS Licence under Scheme-I on Manakonline?",
        expected=ExpectedOutcome(
            intent="CERTIFICATION_GUIDANCE",
            must_mention=["Scheme", "BIS", "licence"],
            should_cite_sources=False,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-012",
        category="consumer_query",
        query="How can consumers verify the authenticity of an ISI mark using the BIS Care App?",
        expected=ExpectedOutcome(
            intent="CONSUMER_QUERY",
            must_mention=["BIS Care", "mark"],
            should_cite_sources=False,
        ),
    ),

    # ── Category 5: Hallucination Traps ────────────────────────────────────────
    EvaluationTestCase(
        test_id="TC-013",
        category="hallucination_trap",
        query="What are the requirements of fake standard IS 99999:2099?",
        expected=ExpectedOutcome(
            must_not_mention=["IS 99999 is certified", "IS 99999 prescribes"],
            expect_insufficient_evidence=True,
            should_cite_sources=False,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-014",
        category="hallucination_trap",
        query="Explain Clause 99.1 of IS 14543.",
        expected=ExpectedOutcome(
            must_not_mention=["Clause 99.1 states", "Clause 99.1 specifies"],
            expect_insufficient_evidence=True,
            should_cite_sources=False,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-015",
        category="hallucination_trap",
        query="What BIS standard covers quantum computers and anti-gravity engines?",
        expected=ExpectedOutcome(
            must_not_mention=["Indian Standard for quantum computers", "IS 7777"],
            expect_insufficient_evidence=True,
            should_cite_sources=False,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-016",
        category="hallucination_trap",
        query="Tell me about IS 8723-Part 6 for flying carpets.",
        expected=ExpectedOutcome(
            must_not_mention=["IS 8723", "flying carpets specification"],
            expect_insufficient_evidence=True,
            should_cite_sources=False,
        ),
    ),

    # ── Category 6: Clarification Requests (Ambiguous Queries) ─────────────────
    EvaluationTestCase(
        test_id="TC-017",
        category="clarification",
        query="i make products",
        expected=ExpectedOutcome(
            expect_clarification=True,
            should_cite_sources=False,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-018",
        category="clarification",
        query="i want bis certification",
        expected=ExpectedOutcome(
            expect_clarification=True,
            should_cite_sources=False,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-019",
        category="clarification",
        query="appliances",
        expected=ExpectedOutcome(
            expect_clarification=True,
            should_cite_sources=False,
        ),
    ),

    # ── Category 7: Out-of-Scope Queries (Domain Boundaries) ───────────────────
    EvaluationTestCase(
        test_id="TC-020",
        category="out_of_scope",
        query="What is the weather in Delhi today?",
        expected=ExpectedOutcome(
            intent="OUT_OF_SCOPE",
            expect_refusal=True,
            should_cite_sources=False,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-021",
        category="out_of_scope",
        query="Who won the cricket match yesterday?",
        expected=ExpectedOutcome(
            intent="OUT_OF_SCOPE",
            expect_refusal=True,
            should_cite_sources=False,
        ),
    ),
    EvaluationTestCase(
        test_id="TC-022",
        category="out_of_scope",
        query="Write python code to compute Fibonacci numbers.",
        expected=ExpectedOutcome(
            intent="OUT_OF_SCOPE",
            expect_refusal=True,
            should_cite_sources=False,
        ),
    ),
]
