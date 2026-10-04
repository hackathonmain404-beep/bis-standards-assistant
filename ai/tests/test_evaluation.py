"""
Automated Benchmarking & Evaluation Test Suite — BIS Intelligent Assistant
Validates Hallucination Rate, Citation Accuracy, Product-to-Standard Matching,
and Clarification/Refusal boundaries matching docs/ai/AI_EVALUATION.md.
"""

import pytest

from ai.src.evaluation.dataset import GOLDEN_BENCHMARK_DATASET, EvaluationTestCase
from ai.src.evaluation.evaluator import EvaluationRunner, EvaluationSummaryReport
from ai.src.service.pipeline import BISPipeline
from ai.src.service.api import get_pipeline


@pytest.fixture(scope="module")
def pipeline():
    return get_pipeline()


def test_golden_dataset_structure():
    """Verify golden dataset satisfies coverage criteria from AI_EVALUATION.md."""
    assert len(GOLDEN_BENCHMARK_DATASET) >= 20

    categories = {tc.category for tc in GOLDEN_BENCHMARK_DATASET}
    assert "product_to_standard" in categories
    assert "standard_query" in categories
    assert "hallucination_trap" in categories
    assert "clarification" in categories
    assert "out_of_scope" in categories


def test_hallucination_traps_zero_tolerance(pipeline):
    """Verify that hallucination trap queries never invent fake standards or clauses."""
    trap_cases = [tc for tc in GOLDEN_BENCHMARK_DATASET if tc.category == "hallucination_trap"]
    assert len(trap_cases) >= 4

    for tc in trap_cases:
        res = EvaluationRunner.evaluate_case(tc, pipeline)
        assert res.must_not_mentions_passed is True, f"Failed on {tc.test_id}: {res.notes}"
        assert res.passed is True, f"Trap case {tc.test_id} failed: {res.notes}"


def test_clarification_accuracy(pipeline):
    """Verify that 100% of ambiguous queries prompt for clarification."""
    clarification_cases = [tc for tc in GOLDEN_BENCHMARK_DATASET if tc.category == "clarification"]
    assert len(clarification_cases) >= 3

    for tc in clarification_cases:
        res = EvaluationRunner.evaluate_case(tc, pipeline)
        assert res.clarification_match is True, f"Failed clarification for {tc.test_id}: {res.notes}"


def test_refusal_accuracy(pipeline):
    """Verify that non-BIS queries are refused without hallucinations."""
    refusal_cases = [tc for tc in GOLDEN_BENCHMARK_DATASET if tc.category == "out_of_scope"]
    assert len(refusal_cases) >= 3

    for tc in refusal_cases:
        res = EvaluationRunner.evaluate_case(tc, pipeline)
        assert res.refusal_match is True, f"Failed refusal for {tc.test_id}: {res.notes}"


def test_benchmark_suite_performance(pipeline):
    """
    Executes the entire golden benchmark dataset and enforces quality thresholds:
    - Hallucination Rate == 0%
    - Citation Accuracy >= 90%
    - Standard Match Accuracy >= 80%
    - Pass Rate >= 85%
    """
    report: EvaluationSummaryReport = EvaluationRunner.run_suite(pipeline)

    print("\n" + report.format_markdown_report())

    assert report.hallucination_rate == 0.0, f"Hallucination detected! Rate: {report.hallucination_rate}"
    assert report.citation_accuracy >= 0.90, f"Citation accuracy below threshold: {report.citation_accuracy}"
    assert report.standard_match_accuracy >= 0.80, f"Standard match accuracy below threshold: {report.standard_match_accuracy}"
    assert report.clarification_accuracy == 1.0, f"Clarification accuracy below 100%: {report.clarification_accuracy}"
    assert report.refusal_accuracy == 1.0, f"Refusal accuracy below 100%: {report.refusal_accuracy}"
    assert report.pass_rate >= 0.85, f"Overall pass rate below threshold: {report.pass_rate}"
