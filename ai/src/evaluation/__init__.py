"""
Evaluation & Benchmarking Engine — BIS Intelligent Assistant
Automated evaluation dataset, metrics calculators, hallucination detection,
and benchmarking suite matching docs/ai/AI_EVALUATION.md.
"""

from ai.src.evaluation.dataset import (
    EvaluationTestCase,
    ExpectedOutcome,
    GOLDEN_BENCHMARK_DATASET,
)
from ai.src.evaluation.evaluator import (
    CaseEvaluationResult,
    EvaluationSummaryReport,
    EvaluationRunner,
)

__all__ = [
    "EvaluationTestCase",
    "ExpectedOutcome",
    "GOLDEN_BENCHMARK_DATASET",
    "CaseEvaluationResult",
    "EvaluationSummaryReport",
    "EvaluationRunner",
]
