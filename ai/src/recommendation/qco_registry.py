"""
QCO & Product Standards Registry — BIS Intelligent Assistant
Authoritative catalog of Indian Standards, Quality Control Orders (QCOs),
and BIS Certification Schemes for high-priority product categories.
Follows docs/bis/BIS_KNOWLEDGE_SPEC.md and docs/ai/AI_PIPELINE.md.
"""

from __future__ import annotations

import re
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ApplicableScheme(str, Enum):
    """Authoritative BIS Conformity Assessment Schemes."""
    SCHEME_I_ISI = "Scheme-I (ISI Mark)"
    SCHEME_II_CRS = "Scheme-II (Compulsory Registration Scheme - CRS)"
    SCHEME_IV = "Scheme-IV (Certificate of Conformity - CoC)"
    VOLUNTARY = "Voluntary Certification Scheme"


class ProductStandardRecord(BaseModel):
    """
    Authoritative record mapping a regulated product to its Indian Standards and regulatory status.
    """
    model_config = ConfigDict(frozen=True, extra="forbid")

    product_id: str = Field(..., description="Unique slug for the product category")
    canonical_name: str = Field(..., description="Official BIS product name")
    aliases: List[str] = Field(..., description="Known query phrases, synonyms, and variations")
    primary_standard: str = Field(..., description="Primary Indian Standard code (e.g., 'IS 14543:2016')")
    standard_title: str = Field(..., description="Official title of the primary Indian Standard")
    related_standards: List[str] = Field(default_factory=list, description="Related safety or test method standards")
    scheme: ApplicableScheme = Field(..., description="Conformity assessment scheme required by BIS")
    is_mandatory: bool = Field(True, description="Whether certification is compulsory under law")
    qco_order_name: Optional[str] = Field(None, description="Title of the governing Quality Control Order")
    qco_ministry: Optional[str] = Field(None, description="Ministry or government body issuing the QCO")
    effective_date: Optional[str] = Field(None, description="Effective enforcement date of mandatory order")
    scope_summary: str = Field(..., description="Summary of covered product variants and operational conditions")
    rated_limits: Dict[str, str] = Field(default_factory=dict, description="Standard operating limits (voltage, use, etc.)")
    testing_summary: str = Field(..., description="Key technical and safety tests required")


# Authoritative Seed Registry for MVP Categories
_REGISTRY_RECORDS: List[ProductStandardRecord] = [
    ProductStandardRecord(
        product_id="electric_iron",
        canonical_name="Electric Iron (Dry / Steam)",
        aliases=[
            "electric iron",
            "electric irons",
            "steam iron",
            "steam irons",
            "dry iron",
            "dry irons",
            "electric steam iron",
            "electric dry iron",
            "iron for clothes",
            "clothes iron",
            "garment iron",
        ],
        primary_standard="IS 302 (Part 2/Sec 3):2007",
        standard_title="Safety of Household and Similar Electrical Appliances - Particular Requirements - Electric Irons",
        related_standards=["IS 302-1:2008"],
        scheme=ApplicableScheme.SCHEME_I_ISI,
        is_mandatory=True,
        qco_order_name="Electrical Appliances (Quality Control) Order, 2023",
        qco_ministry="Ministry of Commerce and Industry / DPIIT",
        effective_date="2024-01-01",
        scope_summary="Covers electric dry irons and steam irons, including cordless types, for household and similar use, having a rated voltage not exceeding 250 V single-phase a.c.",
        rated_limits={
            "max_voltage": "250V",
            "phase": "single-phase",
            "intended_use": "household and domestic",
        },
        testing_summary="Protection against electric shock (Clause 8.1), Thermostatic temperature control (Clause 11.2), Heating & abnormal operation (Clause 19), Moisture resistance (Clause 15).",
    ),
    ProductStandardRecord(
        product_id="packaged_drinking_water",
        canonical_name="Packaged Drinking Water (Other than Natural Mineral Water)",
        aliases=[
            "packaged drinking water",
            "drinking water",
            "packaged water",
            "bottled water",
            "mineral water bottle",
            "packaged water 20 litre",
            "water bottle for sale",
            "bottled drinking water",
        ],
        primary_standard="IS 14543:2016",
        standard_title="Packaged Drinking Water (Other Than Packaged Natural Mineral Water) — Specification",
        related_standards=["IS 10500:2012", "IS 3025", "IS 15410"],
        scheme=ApplicableScheme.SCHEME_I_ISI,
        is_mandatory=True,
        qco_order_name="Food Safety and Standards (Prohibition and Restrictions on Sales) Regulations & Mandatory BIS QCO",
        qco_ministry="Ministry of Health and Family Welfare / FSSAI & DPIIT",
        effective_date="2001-03-29",
        scope_summary="Prescribes requirements and methods of sampling and test for packaged drinking water other than packaged natural mineral water, filled in hermetically sealed containers of various capacities.",
        rated_limits={
            "ph_range": "6.5 to 8.5",
            "tds_max": "500 mg/l",
            "containers": "food grade plastic or glass hermetically sealed",
        },
        testing_summary="Microbiological limits (E. coli, coliforms, yeast & mould Clause 5.2), Chemical & physical requirements (pH Clause 4.2, turbidity, TDS), Pesticide residue testing.",
    ),
    ProductStandardRecord(
        product_id="packaged_natural_mineral_water",
        canonical_name="Packaged Natural Mineral Water",
        aliases=[
            "packaged natural mineral water",
            "natural mineral water",
            "natural spring water",
            "spring water bottle",
        ],
        primary_standard="IS 13428:2005",
        standard_title="Packaged Natural Mineral Water — Specification",
        related_standards=["IS 10500:2012", "IS 3025", "IS 15410"],
        scheme=ApplicableScheme.SCHEME_I_ISI,
        is_mandatory=True,
        qco_order_name="Mandatory BIS Certification for Packaged Natural Mineral Water",
        qco_ministry="Ministry of Consumer Affairs, Food & Public Distribution",
        effective_date="2001-03-29",
        scope_summary="Prescribes specifications for natural mineral water packaged at source from subterranean springs or boreholes.",
        rated_limits={
            "source": "underground water bearing strata / natural spring",
            "processing": "no chemical treatment permitted except aeration/filtration",
        },
        testing_summary="Physicochemical parameters, mineral content declarations, trace metals, microbiological purity.",
    ),
    ProductStandardRecord(
        product_id="electric_kettle",
        canonical_name="Electric Kettle and Liquid Heater",
        aliases=[
            "electric kettle",
            "electric kettles",
            "kettle",
            "liquid heating appliance",
            "electric water boiler",
        ],
        primary_standard="IS 302 (Part 2/Sec 15):2009",
        standard_title="Safety of Household and Similar Electrical Appliances - Particular Requirements for Appliances for Heating Liquids",
        related_standards=["IS 302-1:2008"],
        scheme=ApplicableScheme.SCHEME_I_ISI,
        is_mandatory=True,
        qco_order_name="Electrical Appliances (Quality Control) Order, 2023",
        qco_ministry="Ministry of Commerce and Industry / DPIIT",
        effective_date="2024-01-01",
        scope_summary="Safety of appliances for heating liquids for household and similar purposes, rated voltage not exceeding 250 V.",
        rated_limits={
            "max_voltage": "250V",
            "phase": "single-phase",
            "intended_use": "liquid heating for household",
        },
        testing_summary="Boil-dry safety cut-out, leakage current, thermal insulation, spill test.",
    ),
    ProductStandardRecord(
        product_id="ceiling_fan",
        canonical_name="Electric Ceiling Type Fan and Regulator",
        aliases=[
            "ceiling fan",
            "ceiling fans",
            "electric ceiling fan",
            "room fan",
            "bldc ceiling fan",
        ],
        primary_standard="IS 374:2019",
        standard_title="Electric Ceiling Type Fans and Regulators — Specification",
        related_standards=["IS 302-1:2008"],
        scheme=ApplicableScheme.SCHEME_I_ISI,
        is_mandatory=True,
        qco_order_name="Ceiling Fans (Quality Control) Order, 2023",
        qco_ministry="Ministry of Commerce and Industry / DPIIT",
        effective_date="2024-03-01",
        scope_summary="Covers performance and safety requirements of electric ceiling type fans including AC and BLDC ceiling fans with regulators.",
        rated_limits={
            "rated_voltage": "230V a.c.",
            "service_value": "star rating energy efficiency compliance",
        },
        testing_summary="Air delivery test, electrical input measurement, safety suspension test, high voltage test.",
    ),
    ProductStandardRecord(
        product_id="toys_safety",
        canonical_name="Toys Safety (Mechanical & Physical)",
        aliases=[
            "toy",
            "toys",
            "children toys",
            "plastic toys",
            "mechanical toys",
            "kids toys",
        ],
        primary_standard="IS 9873 (Part 1):2019",
        standard_title="Safety of Toys - Part 1: Safety Aspects Related to Mechanical and Physical Properties",
        related_standards=["IS 9873 (Part 2):2017", "IS 9873 (Part 3):2017", "IS 15644:2006"],
        scheme=ApplicableScheme.SCHEME_I_ISI,
        is_mandatory=True,
        qco_order_name="Toys (Quality Control) Order, 2020",
        qco_ministry="Ministry of Commerce and Industry / DPIIT",
        effective_date="2021-01-01",
        scope_summary="Applies to all toys designed or clearly intended for use in play by children under 14 years of age.",
        rated_limits={
            "target_age": "children under 14 years",
            "choking_hazard": "small parts cylinder test for children under 3 years",
        },
        testing_summary="Drop test, sharp edges & points analysis, tension test, small parts hazard assessment.",
    ),
    ProductStandardRecord(
        product_id="ordinary_portland_cement",
        canonical_name="Ordinary Portland Cement (33, 43, 53 Grade)",
        aliases=[
            "cement",
            "portland cement",
            "opc cement",
            "ordinary portland cement",
            "opc 43",
            "opc 53",
        ],
        primary_standard="IS 269:2015",
        standard_title="Ordinary Portland Cement — Specification",
        related_standards=["IS 4031", "IS 4032"],
        scheme=ApplicableScheme.SCHEME_I_ISI,
        is_mandatory=True,
        qco_order_name="Cement (Quality Control) Order, 2003",
        qco_ministry="Ministry of Commerce and Industry / DPIIT",
        effective_date="2003-02-17",
        scope_summary="Prescribes requirements for 33 grade, 43 grade, and 53 grade ordinary Portland cement.",
        rated_limits={
            "compressive_strength": "minimum 43 MPa or 53 MPa at 28 days",
            "soundness": "Le Chatelier expansion max 10 mm",
        },
        testing_summary="Compressive strength at 3, 7, 28 days, setting time, fineness by Blaine air permeability.",
    ),
]


class QCORegistry:
    """
    Searchable registry providing authoritative standard mappings, QCO legal status,
    and applicable conformity assessment schemes.
    """

    @classmethod
    def get_all(cls) -> List[ProductStandardRecord]:
        """Returns all registered product standards."""
        return list(_REGISTRY_RECORDS)

    @classmethod
    def list_supported_products(cls) -> List[str]:
        """Returns the canonical names of all registered products."""
        return [rec.canonical_name for rec in _REGISTRY_RECORDS]

    @classmethod
    def find_by_product_name(cls, product_name: str) -> Optional[ProductStandardRecord]:
        """
        Matches a query phrase against canonical names and aliases.
        Uses exact substring and tokenized word-boundary checks.
        """
        p_clean = product_name.strip().lower()
        if not p_clean:
            return None

        # 1. Exact canonical name match
        for rec in _REGISTRY_RECORDS:
            if rec.canonical_name.lower() == p_clean or rec.product_id == p_clean:
                return rec

        # 2. Exact alias match
        for rec in _REGISTRY_RECORDS:
            for alias in rec.aliases:
                if alias == p_clean:
                    return rec

        # 3. Substring match (alias contained in product_name or vice versa)
        # Prioritize longer matching aliases first for maximum specificity
        sorted_records = sorted(
            _REGISTRY_RECORDS,
            key=lambda r: max((len(a) for a in r.aliases), default=0),
            reverse=True,
        )
        for rec in sorted_records:
            for alias in rec.aliases:
                pattern = rf"\b{re.escape(alias)}\b"
                if re.search(pattern, p_clean) or p_clean in alias:
                    return rec

        return None

    @classmethod
    def find_by_standard_number(cls, standard_number: str) -> Optional[ProductStandardRecord]:
        """
        Finds a product record governed by the given Indian Standard code.
        """
        clean_num = standard_number.strip().upper()
        # Extract base digits e.g. "14543" from "IS 14543:2016"
        num_match = re.search(r"\b(\d{3,5})\b", clean_num)
        base_digits = num_match.group(1) if num_match else clean_num

        for rec in _REGISTRY_RECORDS:
            if base_digits in rec.primary_standard:
                return rec
            for rel in rec.related_standards:
                if base_digits in rel:
                    return rec

        return None

    @classmethod
    def search(cls, query: str) -> List[ProductStandardRecord]:
        """
        Fuzzy search across aliases, titles, and descriptions.
        """
        q_tokens = set(re.findall(r"\b[a-zA-Z0-9]+\b", query.lower()))
        matches: List[tuple[ProductStandardRecord, int]] = []

        for rec in _REGISTRY_RECORDS:
            score = 0
            # Check canonical name & aliases
            for alias in rec.aliases:
                if alias in query.lower():
                    score += 5
                alias_tokens = set(alias.split())
                overlap = len(q_tokens.intersection(alias_tokens))
                score += overlap * 2

            # Check primary standard match
            if rec.primary_standard.lower() in query.lower():
                score += 8

            if score > 0:
                matches.append((rec, score))

        matches.sort(key=lambda x: x[1], reverse=True)
        return [m[0] for m in matches]
