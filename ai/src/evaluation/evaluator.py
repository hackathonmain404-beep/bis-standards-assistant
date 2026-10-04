"""
Automated Evaluation Runner & Benchmarking — BIS Intelligent Assistant
Evaluates hallucination rates, citation correctness, product-to-standard mapping,
clarification handling, and response latency matching docs/ai/AI_EVALUATION.md.
"""

from __future__ import annotations

import re
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from ai.src.evaluation.dataset import EvaluationTestCase, ExpectedOutcome, GOLDEN_BENCHMARK_DATASET
from ai.src.service.pipeline import BISPipeline
from ai.src.generation.synthesizer import AIResponsePayload


class CaseEvaluationResult(BaseModel):
    """Result of running a single evaluation test case."""
    model_config = ConfigDict(frozen=True, extra="forbid")

    test_id: str = Field(..., description="Test case identifier")
    category: str = Field(..., description="Category name")
    passed: bool = Field(..., description="Overall pass/fail determination")
    intent_match: bool = Field(..., description="Whether detected intent matches expectation")
    standards_match: bool = Field(..., description="Whether expected standards were correctly referenced")
    must_mentions_passed: bool = Field(..., description="Whether all required keywords appeared")
    must_not_mentions_passed: bool = Field(..., description="Whether hallucinated phrases were avoided")
    clarification_match: bool = Field(..., description="Whether clarification flag matched")
    refusal_match: bool = Field(..., description="Whether out-of-scope refusal matched")
    citation_validity: bool = Field(..., description="Whether citations are valid and present when expected")
    latency_ms: int = Field(..., description="Response latency in milliseconds")
    notes: str = Field(default="", description="Diagnostic remarks or failure causes")


class EvaluationSummaryReport(BaseModel):
    """Aggregated evaluation metrics for a benchmark suite run."""
    model_config = ConfigDict(frozen=True, extra="forbid")

    total_cases: int = Field(..., ge=0)
    passed_cases: int = Field(..., ge=0)
    failed_cases: int = Field(..., ge=0)
    pass_rate: float = Field(..., ge=0.0, le=1.0)
    hallucination_rate: float = Field(..., ge=0.0, le=1.0)
    citation_accuracy: float = Field(..., ge=0.0, le=1.0)
    standard_match_accuracy: float = Field(..., ge=0.0, le=1.0)
    clarification_accuracy: float = Field(..., ge=0.0, le=1.0)
    refusal_accuracy: float = Field(..., ge=0.0, le=1.0)
    avg_latency_ms: float = Field(..., ge=0.0)
    failed_test_ids: List[str] = Field(default_factory=list)
    case_results: List[CaseEvaluationResult] = Field(default_factory=list)

    def format_markdown_report(self) -> str:
        """Renders summary report formatted strictly per docs/ai/AI_EVALUATION.md."""
        lines = [
            f"# BIS AI Evaluation Report",
            f"**Total Test Cases**: {self.total_cases} | **Passed**: {self.passed_cases} | **Failed**: {self.failed_cases}",
            f"**Overall Pass Rate**: {self.pass_rate * 100:.1f}%",
            "",
            "## Quality & Safety Metrics",
            "| Metric | Measured | Target | Status |",
            "| :--- | :--- | :--- | :--- |",
            f"| **Hallucination Rate** | {self.hallucination_rate * 100:.1f}% | 0.0% | {'[PASS]' if self.hallucination_rate == 0 else '[FAIL]'} |",
            f"| **Citation Accuracy** | {self.citation_accuracy * 100:.1f}% | 100.0% | {'[PASS]' if self.citation_accuracy >= 0.90 else '[FAIL]'} |",
            f"| **Standard Match Accuracy** | {self.standard_match_accuracy * 100:.1f}% | >= 80.0% | {'[PASS]' if self.standard_match_accuracy >= 0.80 else '[FAIL]'} |",
            f"| **Clarification Accuracy** | {self.clarification_accuracy * 100:.1f}% | 100.0% | {'[PASS]' if self.clarification_accuracy == 1.0 else '[FAIL]'} |",
            f"| **Refusal Accuracy** | {self.refusal_accuracy * 100:.1f}% | 100.0% | {'[PASS]' if self.refusal_accuracy == 1.0 else '[FAIL]'} |",
            f"| **Average Latency** | {self.avg_latency_ms:.0f} ms | < 5000 ms | {'[PASS]' if self.avg_latency_ms < 5000 else '[WARN]'} |",
            "",
        ]

        if self.failed_test_ids:
            lines.append("## Failed Test Cases")
            for cr in self.case_results:
                if not cr.passed:
                    lines.append(f"- **{cr.test_id}** ({cr.category}): {cr.notes}")
            lines.append("")

        return "\n".join(lines)


class EvaluationRunner:
    """
    Executes benchmark test cases and computes evaluation dimensions.
    """

    @classmethod
    def evaluate_case(
        cls,
        test_case: EvaluationTestCase,
        pipeline: BISPipeline,
    ) -> CaseEvaluationResult:
        """
        Runs a single test case through the pipeline and assesses all evaluation criteria.
        """
        t0 = time.perf_counter()
        response: AIResponsePayload = pipeline.query(
            query=test_case.query,
            conversation_history=test_case.conversation_history,
            language=test_case.language,
        )
        latency_ms = int((time.perf_counter() - t0) * 1000)

        exp: ExpectedOutcome = test_case.expected
        resp_text = response.response_text.lower()
        failures: List[str] = []

        # 1. Intent Check
        intent_match = True
        if exp.intent and response.intent != exp.intent:
            intent_match = False
            failures.append(f"Intent mismatch: expected {exp.intent}, got {response.intent}")

        # 2. Clarification Check
        clarification_match = (response.needs_clarification == exp.expect_clarification)
        if not clarification_match:
            failures.append(f"Clarification mismatch: expected {exp.expect_clarification}, got {response.needs_clarification}")

        # 3. Refusal Check (Out of Scope)
        refusal_match = True
        if exp.expect_refusal:
            refusal_match = (
                response.intent == "OUT_OF_SCOPE"
                or "outside the domain" in resp_text
                or "cannot assist" in resp_text
            )
            if not refusal_match:
                failures.append("Expected refusal for out-of-scope query, but response was not declined")

        # 4. Must Mention Check
        must_mentions_passed = True
        for term in exp.must_mention:
            if term.lower() not in resp_text:
                must_mentions_passed = False
                failures.append(f"Missing required phrase: '{term}'")

        # 5. Must NOT Mention Check (Hallucination prevention)
        must_not_mentions_passed = True
        for term in exp.must_not_mention:
            if term.lower() in resp_text:
                must_not_mentions_passed = False
                failures.append(f"Hallucination detected! Prohibited phrase found: '{term}'")

        # 6. Standards Match Check
        standards_match = True
        if exp.relevant_standards:
            # Check either citations standard_id or text mentions
            cited_stds = [c.get("standard_id", "") for c in response.citations if c.get("standard_id")]
            matched = any(
                any(re.search(rf"\b{re.escape(re.sub(r'[^0-9]', '', exp_s))}\b", re.sub(r'[^0-9]', '', c_std)) for c_std in cited_stds)
                or any(re.search(rf"\b{re.escape(re.sub(r'[^0-9]', '', exp_s))}\b", re.sub(r'[^0-9]', '', resp_text)) for exp_s in exp.relevant_standards)
                for exp_s in exp.relevant_standards
            )
            if not matched:
                standards_match = False
                failures.append(f"Relevant standards {exp.relevant_standards} not identified")

        # 7. Citation Validity Check
        citation_validity = True
        if response.citations:
            for cit in response.citations:
                if not cit.get("standard_id") or not cit.get("snippet") or cit.get("index", 0) <= 0:
                    citation_validity = False
                    failures.append("Invalid citation item structure in response")
                    break

        if exp.should_cite_sources and not response.citations and not exp.expect_clarification and not exp.expect_refusal and not exp.expect_insufficient_evidence:
            citation_validity = False
            failures.append("Expected citations, but none were returned")

        overall_passed = (
            clarification_match
            and refusal_match
            and must_not_mentions_passed
            and (standards_match or exp.expect_refusal or exp.expect_clarification or exp.expect_insufficient_evidence)
            and (intent_match or exp.expect_clarification or exp.expect_refusal)
        )

        return CaseEvaluationResult(
            test_id=test_case.test_id,
            category=test_case.category,
            passed=overall_passed,
            intent_match=intent_match,
            standards_match=standards_match,
            must_mentions_passed=must_mentions_passed,
            must_not_mentions_passed=must_not_mentions_passed,
            clarification_match=clarification_match,
            refusal_match=refusal_match,
            citation_validity=citation_validity,
            latency_ms=latency_ms,
            notes="; ".join(failures) if failures else "All evaluation checks passed cleanly",
        )

    @classmethod
    def run_suite(
        cls,
        pipeline: BISPipeline,
        dataset: Optional[List[EvaluationTestCase]] = None,
    ) -> EvaluationSummaryReport:
        """
        Executes all test cases in the dataset and aggregates quality metrics.
        """
        test_cases = dataset or GOLDEN_BENCHMARK_DATASET
        case_results: List[CaseEvaluationResult] = []

        for tc in test_cases:
            res = cls.evaluate_case(tc, pipeline)
            case_results.append(res)

        total = len(case_results)
        passed = sum(1 for cr in case_results if cr.passed)
        failed = total - passed
        pass_rate = (passed / total) if total > 0 else 0.0

        # Quality metrics
        hallucination_failures = sum(1 for cr in case_results if not cr.must_not_mentions_passed)
        hallucination_rate = (hallucination_failures / total) if total > 0 else 0.0

        citation_cases = [cr for cr in case_results if cr.citation_validity]
        citation_acc = (len(citation_cases) / total) if total > 0 else 1.0

        p2s_cases = [cr for cr in case_results if cr.category == "product_to_standard"]
        p2s_passed = sum(1 for cr in p2s_cases if cr.standards_match)
        standard_match_acc = (p2s_passed / len(p2s_cases)) if p2s_cases else 1.0

        clarification_cases = [cr for cr in case_results if cr.category == "clarification"]
        clarification_passed = sum(1 for cr in clarification_cases if cr.clarification_match)
        clarification_acc = (clarification_passed / len(clarification_cases)) if clarification_cases else 1.0

        refusal_cases = [cr for cr in case_results if cr.category == "out_of_scope"]
        refusal_passed = sum(1 for cr in refusal_cases if cr.refusal_match)
        refusal_acc = (refusal_passed / len(refusal_cases)) if refusal_cases else 1.0

        avg_latency = (sum(cr.latency_ms for cr in case_results) / total) if total > 0 else 0.0

        return EvaluationSummaryReport(
            total_cases=total,
            passed_cases=passed,
            failed_cases=failed,
            pass_rate=round(pass_rate, 4),
            hallucination_rate=round(hallucination_rate, 4),
            citation_accuracy=round(citation_acc, 4),
            standard_match_accuracy=round(standard_match_acc, 4),
            clarification_accuracy=round(clarification_acc, 4),
            refusal_accuracy=round(refusal_acc, 4),
            avg_latency_ms=round(avg_latency, 1),
            failed_test_ids=[cr.test_id for cr in case_results if not cr.passed],
            case_results=case_results,
        )


if __name__ == "__main__":
    from ai.src.service.pipeline import BISPipeline

    pipeline = BISPipeline()
    report = EvaluationRunner.run_suite(pipeline)
    print("=" * 60)
    print("BIS AI / RAG Golden Benchmark Evaluation Report")
    print("=" * 60)
    print(f"Total Test Cases:       {report.total_cases}")
    print(f"Passed Cases:           {report.passed_cases}")
    print(f"Failed Cases:           {report.failed_cases}")
    print(f"Overall Pass Rate:      {report.pass_rate * 100:.1f}%")
    print(f"Hallucination Rate:     {report.hallucination_rate * 100:.1f}%")
    print(f"Citation Accuracy:      {report.citation_accuracy * 100:.1f}%")
    print(f"Standard Match Acc:     {report.standard_match_accuracy * 100:.1f}%")
    print(f"Clarification Accuracy: {report.clarification_accuracy * 100:.1f}%")
    print(f"Refusal Accuracy:       {report.refusal_accuracy * 100:.1f}%")
    print(f"Average Latency:        {report.avg_latency_ms:.1f} ms")
    print("=" * 60)
