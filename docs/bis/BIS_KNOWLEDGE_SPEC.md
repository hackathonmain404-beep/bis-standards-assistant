# BIS Knowledge Specification — BIS Intelligent Assistant

> Related: [RAG_DATA_SCHEMA](../ai/RAG_DATA_SCHEMA.md) | [BIS_SOURCE_POLICY](BIS_SOURCE_POLICY.md) | [AI_PIPELINE](../ai/AI_PIPELINE.md) | [PRODUCT_SPEC](../product/PRODUCT_SPEC.md)

---

## Purpose

This is a **core document**. It defines the structure, categories, relationships, and quality requirements for all BIS knowledge used by the system. It is the reference for Member 4 (BIS Knowledge / QA) and the foundation for the RAG knowledge base.

---

## 1. Knowledge Categories

The system's knowledge base covers the following categories of BIS information:

| Category | Description | Priority (MVP) |
|:---|:---|:---|
| **Indian Standards (IS)** | Technical standards for products, materials, processes | **P0** |
| **Certification Schemes** | BIS product certification schemes (Scheme-I, CRS, etc.) | **P0** |
| **Quality Control Orders (QCOs)** | Orders mandating compulsory certification for products | **P1** |
| **Testing Requirements** | Test methods, acceptance criteria from standards | **P1** |
| **Laboratory Information** | BIS-recognized testing laboratories | **P2** |
| **Hallmarking Guidelines** | Hallmarking of gold, silver, and other precious metals | **P2** |
| **Consumer Information** | BIS marks, how to verify certified products | **P2** |
| **General BIS Information** | About BIS, services, procedures | **P1** |

---

## 2. Indian Standards (IS)

### Structure of an Indian Standard

```
Indian Standard
├── Title Page
│   ├── Standard Number (e.g., IS 14543)
│   ├── Title
│   ├── Year / Revision
│   └── Part (if multi-part standard)
├── Foreword
├── Scope
├── References
├── Terminology / Definitions
├── Requirements (core technical content)
│   ├── General Requirements
│   ├── Performance Requirements
│   ├── Safety Requirements
│   └── Material Requirements
├── Test Methods
├── Marking & Labeling
├── Packing
├── Sampling
├── Annexes (Normative / Informative)
└── Tables / Figures
```

### Key Metadata for Each Standard

| Field | Example | Required |
|:---|:---|:---|
| Standard Number | IS 14543 | Yes |
| Part | Part 1, Part 2 | If applicable |
| Title | Packaged Drinking Water — Specification | Yes |
| Year | 2016 | Yes |
| Revision / Amendment | Reaffirmed 2021 | If applicable |
| Status | Current / Superseded / Withdrawn | Yes |
| Subject Area | Food and Agriculture | Yes |
| Product Category | Packaged Water | Yes |
| Related Standards | IS 10500 | If applicable |
| Superseded By | IS XXXXX (if superseded) | If applicable |
| Corresponding International Standard | ISO XXXXX (if applicable) | If applicable |

---

## 3. Certification Schemes

### BIS Certification Schemes Overview

| Scheme | Full Name | Scope |
|:---|:---|:---|
| **Scheme-I (ISI Mark)** | Product Certification Scheme | Voluntary and compulsory product certification |
| **Scheme-II (CRS)** | Compulsory Registration Scheme | Registration of electronics and IT goods |
| **Scheme-V** | Hallmarking Scheme | Hallmarking of precious metal articles |
| **Scheme-VI** | ECO Mark | Environmental labeling |
| **FMCS** | Foreign Manufacturers Certification Scheme | Certification for foreign manufacturers |

### Certification Information to Capture

| Field | Description |
|:---|:---|
| Scheme Name | Official scheme name |
| Scheme Type | Voluntary / Compulsory |
| Applicable Products | Product categories covered |
| Applicable Standards | Standards referenced by the scheme |
| Application Process | Steps for obtaining certification |
| Required Documents | Documentation needed |
| Testing Requirements | What testing must be completed |
| Validity / Renewal | Certification period and renewal process |
| Fees | If publicly available and documented |
| Marking Requirements | What marks must appear on certified products |

---

## 4. Quality Control Orders (QCOs)

### QCO Information to Capture

| Field | Description |
|:---|:---|
| QCO Number / Notification | Gazette notification reference |
| Product | Product covered by the QCO |
| Applicable Standard | Indian Standard mandated |
| Effective Date | When the QCO came into force |
| Transition Period | Grace period for compliance |
| Current Status | Active / Amended / Superseded |
| Amendments | Any subsequent amendments |

---

## 5. Relationships

The following relationships are critical for the Product → Compliance Journey feature:

### Product → Standard Mapping

```
Product Category
    │
    ├── Applicable Indian Standards
    │     ├── IS XXXXX (primary standard)
    │     ├── IS XXXXX (related safety standard)
    │     └── IS XXXXX (test method standard)
    │
    ├── Applicable Certification Scheme
    │     └── Scheme-I / CRS / etc.
    │
    ├── Quality Control Order (if compulsory)
    │     └── QCO notification reference
    │
    ├── Testing Requirements
    │     ├── From standard clauses
    │     └── Test methods referenced
    │
    └── Recognized Laboratories
          └── Labs authorized for relevant testing
```

### Standard → Clause → Requirement

```
Indian Standard (IS XXXXX)
    │
    ├── Clause 4: Requirements
    │     ├── 4.1: General Requirements
    │     ├── 4.2: Specific Requirements
    │     │     ├── 4.2.1: ...
    │     │     └── 4.2.2: ...
    │     └── 4.3: Safety Requirements
    │
    ├── Clause 5: Test Methods
    │     ├── 5.1: Test for requirement 4.2.1
    │     └── 5.2: Test for requirement 4.2.2
    │
    └── Clause 6: Marking
```

### Cross-References Between Standards

| Relationship | Example |
|:---|:---|
| Part of series | IS 302-1 (general), IS 302-2-3 (electric irons) |
| References | IS 14543 references IS 10500 for water quality parameters |
| Supersedes | IS XXXXX:2020 supersedes IS XXXXX:2010 |
| Test method | IS XXXXX references IS XXXXX for specific test procedures |

---

## 6. Metadata Requirements

### Document-Level Metadata

Every document in the knowledge base must have:

| Field | Mandatory | Source |
|:---|:---|:---|
| Document ID | Yes | Auto-generated |
| Standard Number | Yes (if IS) | From document |
| Title | Yes | From document |
| Document Type | Yes | Classification |
| Year | Yes | From document |
| Status | Yes | From BIS records |
| Product Category | Yes | Manual tagging or from document |
| Subject Area | Yes | Manual tagging or from document |
| Source Reference | Yes | Where the document was obtained |
| Ingestion Date | Yes | Auto-generated |

### Chunk-Level Metadata

Every chunk must carry:

| Field | Mandatory | Source |
|:---|:---|:---|
| Parent Document ID | Yes | From ingestion |
| Standard Number | Yes | Inherited from document |
| Section Title | Yes | From document structure |
| Clause Number | If applicable | From document structure |
| Content Type | Yes | Classification (text, table, list) |

See [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md) for the full chunk schema.

---

## 7. Versioning and Document Identity

### Rules

1. **Each standard revision is a separate document.** IS 14543:2004 and IS 14543:2016 are distinct entries.
2. **Status must be tracked.** Superseded standards should be marked but retained (users may ask about them).
3. **Amendments are linked.** If an amendment modifies a standard, both should be in the knowledge base with the relationship noted.
4. **The knowledge base should indicate which version is current.**

### Version Metadata

| Field | Description |
|:---|:---|
| `year` | Publication year |
| `revision` | Revision identifier |
| `status` | `current`, `superseded`, `withdrawn` |
| `superseded_by` | Standard number of the replacement (if superseded) |
| `amendments` | List of amendment references |

---

## 8. Clause Structure

Clauses in Indian Standards follow a hierarchical numbering system:

```
1.     ← Top-level clause
1.1    ← Sub-clause
1.1.1  ← Sub-sub-clause
1.1.1.1 ← Further nesting (rare)
```

### Chunking Impact

- **Clause boundaries should be respected** during chunking.
- A sub-clause (e.g., 4.2.1) should not be separated from its parent clause context (4.2) unless the parent is too large.
- **Tables within clauses** should be kept as a single chunk if possible.
- The clause number must be preserved in the chunk metadata.

---

## 9. Provenance

Every piece of information must be traceable to its origin:

| Provenance Field | Description |
|:---|:---|
| Source Document | The original BIS document |
| Source Type | IS, BIS Guideline, QCO, Lab Directory, etc. |
| Obtained From | Where the document was obtained (see [BIS_SOURCE_POLICY.md](BIS_SOURCE_POLICY.md)) |
| Date Obtained | When the document was added to the knowledge base |
| Verified By | Who verified the document's authenticity |

---

## 10. Update Strategy

### When to Update

| Trigger | Action |
|:---|:---|
| New Indian Standard published | Add to knowledge base if in scope |
| Standard revised / amended | Add new version, update status of old version |
| Standard withdrawn | Mark as withdrawn |
| New QCO issued | Add to knowledge base |
| QCO amended | Update existing entry |
| Lab directory updated | Refresh lab information |

### Update Process

1. Obtain the new/updated document from an authorized source
2. Process and chunk according to [RAG_DATA_SCHEMA.md](../ai/RAG_DATA_SCHEMA.md)
3. Generate embeddings
4. Add to the vector store
5. Update metadata index
6. Run evaluation tests to verify retrieval quality
7. Document the update with provenance information

---

## 11. MVP Knowledge Scope

> **STATUS: TBD** — The team must select 3–5 product categories for the MVP knowledge base.

### Candidate Categories

| Category | Example Standards | Rationale |
|:---|:---|:---|
| Domestic Electrical Appliances | IS 302 series | High demand, compulsory certification |
| Packaged Drinking Water | IS 14543 | Consumer relevance, clear requirements |
| Toys Safety | IS 9873 series | Consumer safety, QCO exists |
| Gold/Silver Hallmarking | IS 1417, IS 2112 | Hallmarking feature showcase |
| Cement | IS 269, IS 8112 | Industry relevance |
| Steel | IS 2062 | Industry relevance |

### Selection Criteria

- Availability of source documents
- Relevance to target users (MSMEs, consumers)
- Demonstrability (clear product → standard mapping)
- Coverage of multiple feature areas (Q&A, certification, testing)

---

## Open Decisions

| Decision | Status |
|:---|:---|
| MVP product categories (3–5) | **STATUS: TBD** |
| Source document format (PDF, text, etc.) | **STATUS: TBD** |
| Manual vs. automated metadata tagging | **STATUS: TBD** |
| Product category taxonomy | **STATUS: TBD** |
| Cross-reference extraction approach | **STATUS: TBD** |
