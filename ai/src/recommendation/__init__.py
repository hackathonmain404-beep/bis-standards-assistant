"""
Product Recommendation Engine — BIS Intelligent Assistant
Maps product inquiries and technical specifications to mandatory and applicable Indian Standards (IS),
Quality Control Orders (QCOs), and certification schemes.
"""

from ai.src.recommendation.qco_registry import (
    ApplicableScheme,
    ProductStandardRecord,
    QCORegistry,
)
from ai.src.recommendation.engine import (
    ProductRecommendationEngine,
    ProductRecommendationResult,
    RecommendationMatch,
)

__all__ = [
    "ApplicableScheme",
    "ProductStandardRecord",
    "QCORegistry",
    "ProductRecommendationEngine",
    "ProductRecommendationResult",
    "RecommendationMatch",
]
