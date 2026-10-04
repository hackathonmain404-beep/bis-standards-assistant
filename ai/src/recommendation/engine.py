"""
Product → Standard Recommendation Engine — BIS Intelligent Assistant
Evaluates manufacturer product specifications and maps them to applicable
Indian Standards (IS), mandatory Quality Control Orders (QCOs), and Scheme-I / CRS compliance requirements.
Follows docs/bis/BIS_KNOWLEDGE_SPEC.md Section 5 and docs/ai/AI_PIPELINE.md Stage 3.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from ai.src.understanding.entities import ExtractedEntities, EntityExtractor
from ai.src.recommendation.qco_registry import (
    QCORegistry,
    ProductStandardRecord,
    ApplicableScheme,
)


MANDATORY_REGULATORY_DISCLAIMER = (
    "Disclaimer: Standard recommendations provided by this assistant are for informational guidance. "
    "Manufacturers must verify official statutory applicability against published Quality Control Orders "
    "and BIS Product Certification Manuals on https://bis.gov.in and https://manakonline.in."
)


class RecommendationMatch(BaseModel):
    """Specific standard recommended for a product, with justification and regulatory status."""
    model_config = ConfigDict(frozen=True, extra="forbid")

    standard_number: str = Field(..., description="Indian Standard code (e.g. 'IS 302 (Part 2/Sec 3):2007')")
    standard_title: str = Field(..., description="Official title of the standard")
    is_primary: bool = Field(True, description="Whether this is the primary product specification standard")
    scheme: str = Field(..., description="Applicable BIS conformity assessment scheme")
    is_mandatory: bool = Field(True, description="Whether certification is legally compulsory under QCO")
    qco_details: Optional[str] = Field(None, description="Governing Quality Control Order")
    justification: str = Field(..., description="Plain-language explanation of why this standard applies")
    matched_scope_clauses: List[str] = Field(default_factory=list, description="Scope clauses validating application")
    related_standards: List[str] = Field(default_factory=list, description="Mandatory companion or test method standards")
    attribute_fit: Dict[str, str] = Field(default_factory=dict, description="Evaluation of voltage, phase, or use parameters")


class ProductRecommendationResult(BaseModel):
    """Consolidated recommendation output delivered to the user or downstream LLM synthesizer."""
    model_config = ConfigDict(frozen=True, extra="forbid")

    found: bool = Field(..., description="Whether matching standards were identified")
    product_identified: Optional[str] = Field(None, description="Identified product category name")
    recommendations: List[RecommendationMatch] = Field(default_factory=list, description="Recommended standards")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence in match (0.0 to 1.0)")
    suggested_next_steps: List[str] = Field(default_factory=list, description="Actionable compliance milestones")
    regulatory_disclaimer: str = Field(MANDATORY_REGULATORY_DISCLAIMER, description="Mandatory legal disclaimer")


class ProductRecommendationEngine:
    """
    Intelligent recommendation engine linking product descriptions and specifications
    to Indian Standards and certification mandates.
    """

    def __init__(self, retriever: Optional[Any] = None) -> None:
        """
        Args:
            retriever: Optional HybridRetriever instance to look up live clause snippets from the ingested corpus.
        """
        self.retriever = retriever

    def recommend(
        self,
        query: str,
        entities: Optional[ExtractedEntities] = None,
    ) -> ProductRecommendationResult:
        """
        Evaluates a user query or manufacturer description and produces standard recommendations.
        """
        # 1. Extract entities if not pre-computed
        if entities is None:
            entities = EntityExtractor.extract(query)

        # 2. Identify target product record
        record: Optional[ProductStandardRecord] = None

        # Try from extracted product mentions
        if entities.product_mentions:
            for mention in entities.product_mentions:
                record = QCORegistry.find_by_product_name(mention)
                if record:
                    break

        # If not found by entity extractor mentions, try matching raw query
        if not record:
            record = QCORegistry.find_by_product_name(query)

        # If still not found, check if a standard number was provided that maps to a product
        if not record and entities.standard_numbers:
            for std_num in entities.standard_numbers:
                record = QCORegistry.find_by_standard_number(std_num)
                if record:
                    break

        # 3. Handle Unsupported / Unknown Product
        if not record:
            return self._build_unsupported_result(query, entities)

        # 4. Evaluate Technical Attributes Fit (e.g., Voltage, Phase, Intended Use)
        attr_fit = self._evaluate_attribute_fit(record, entities.attributes)

        # 5. Fetch Scope Clause Evidence if retriever is available
        matched_scope_clauses = self._resolve_scope_clauses(record)

        # 6. Formulate Justification
        justification = (
            f"{record.canonical_name} is governed by Indian Standard {record.primary_standard}. "
            f"{record.scope_summary} "
        )
        if record.is_mandatory and record.qco_order_name:
            justification += (
                f"Certification under {record.scheme.value} is compulsory pursuant to the "
                f"'{record.qco_order_name}' issued by {record.qco_ministry}."
            )

        # 7. Build Primary Recommendation Match
        primary_match = RecommendationMatch(
            standard_number=record.primary_standard,
            standard_title=record.standard_title,
            is_primary=True,
            scheme=record.scheme.value,
            is_mandatory=record.is_mandatory,
            qco_details=record.qco_order_name,
            justification=justification,
            matched_scope_clauses=matched_scope_clauses,
            related_standards=record.related_standards,
            attribute_fit=attr_fit,
        )

        recommendations = [primary_match]

        # 8. Add Companion Safety Standards if applicable (e.g. IS 302-1 for electrical appliances)
        for rel in record.related_standards:
            if "IS 302-1" in rel:
                recommendations.append(
                    RecommendationMatch(
                        standard_number=rel,
                        standard_title="Safety of Household and Similar Electrical Appliances - General Requirements",
                        is_primary=False,
                        scheme=record.scheme.value,
                        is_mandatory=record.is_mandatory,
                        qco_details=record.qco_order_name,
                        justification=(
                            f"{rel} specifies general electrical, mechanical, and fire safety requirements. "
                            f"It must be applied in conjunction with {record.primary_standard}."
                        ),
                        matched_scope_clauses=["Clause 1 Scope (General Safety)"],
                        related_standards=[record.primary_standard],
                        attribute_fit={"application": "General safety umbrella standard"},
                    )
                )

        # 9. Next Steps
        steps = [
            f"Review technical requirements in {record.primary_standard} Clause 1 (Scope) and core safety requirements.",
            f"Verify that factory manufacturing and in-house testing facilities comply with BIS Scheme-I (ISI Mark) guidelines.",
            f"Submit an online application for BIS Licence through the Manakonline portal (www.manakonline.in).",
        ]
        if record.is_mandatory:
            steps.append(
                f"Ensure compliance prior to manufacturing or sale, as this product is under mandatory QCO enforcement."
            )

        confidence = 0.95 if entities.product_mentions or entities.standard_numbers else 0.85
        if "out_of_scope_warning" in attr_fit:
            confidence = 0.50

        return ProductRecommendationResult(
            found=True,
            product_identified=record.canonical_name,
            recommendations=recommendations,
            confidence_score=confidence,
            suggested_next_steps=steps,
            regulatory_disclaimer=MANDATORY_REGULATORY_DISCLAIMER,
        )

    def _evaluate_attribute_fit(
        self,
        record: ProductStandardRecord,
        attributes: Dict[str, str],
    ) -> Dict[str, str]:
        """
        Checks extracted voltage, phase, or use against standard rated limits.
        """
        fit: Dict[str, str] = {}
        if not attributes:
            fit["status"] = "Standard rated parameters assumed (no specific operational limits provided in query)."
            return fit

        # Voltage check
        if "voltage" in attributes and "max_voltage" in record.rated_limits:
            v_val_match = re.search(r"(\d+)", attributes["voltage"])
            limit_val_match = re.search(r"(\d+)", record.rated_limits["max_voltage"])
            if v_val_match and limit_val_match:
                user_v = int(v_val_match.group(1))
                max_v = int(limit_val_match.group(1))
                if user_v <= max_v:
                    fit["voltage"] = f"Rated voltage {user_v}V is within permissible limit (<= {max_v}V)."
                else:
                    fit["voltage"] = (
                        f"WARNING: Specified voltage {user_v}V exceeds standard scope (max {max_v}V). "
                        f"Higher voltage or industrial equipment may require separate industrial standards."
                    )
                    fit["out_of_scope_warning"] = "Voltage parameter exceeds standard scope."

        # Phase check
        if "phase" in attributes and "phase" in record.rated_limits:
            fit["phase"] = f"Phase requirement '{attributes['phase']}' evaluated against standard specification."

        # Intended use check
        if "intended_use" in attributes:
            fit["intended_use"] = f"Intended use '{attributes['intended_use']}' matches product category."

        return fit

    def _resolve_scope_clauses(self, record: ProductStandardRecord) -> List[str]:
        """
        Uses retriever if available to fetch scope clauses, or returns default authoritative clause pointers.
        """
        if self.retriever:
            try:
                results = self.retriever.retrieve(
                    f"{record.primary_standard} Clause 1 Scope",
                    top_k=2,
                )
                clauses = []
                for res in results:
                    cl_num = getattr(res.chunk, "clause", None) or getattr(res.chunk, "clause_number", None)
                    if cl_num and "1" in cl_num:
                        clauses.append(f"Clause {cl_num} ({res.chunk.section_title})")
                if clauses:
                    return list(dict.fromkeys(clauses))
            except Exception:
                pass

        # Authoritative defaults
        return ["Clause 1.1 Scope & Field of Application"]

    def _build_unsupported_result(
        self,
        query: str,
        entities: ExtractedEntities,
    ) -> ProductRecommendationResult:
        """
        Constructs a polite, non-hallucinatory response when a product is not in the knowledge base.
        """
        steps = [
            "Visit the official BIS Standards portal at https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails",
            "Search the Product Certification Manuals on Manakonline (www.manakonline.in)",
            "Contact your nearest BIS Branch Office or send an inquiry to the BIS Standards Promotion Department.",
        ]
        return ProductRecommendationResult(
            found=False,
            product_identified=None,
            recommendations=[],
            confidence_score=0.0,
            suggested_next_steps=steps,
            regulatory_disclaimer=MANDATORY_REGULATORY_DISCLAIMER,
        )
