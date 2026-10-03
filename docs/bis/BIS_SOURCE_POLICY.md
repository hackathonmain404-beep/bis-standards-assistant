# BIS Source Policy — BIS Intelligent Assistant

> Related: [BIS_KNOWLEDGE_SPEC](BIS_KNOWLEDGE_SPEC.md) | [AI_RULES](../ai/AI_RULES.md) | [AI_EVALUATION](../ai/AI_EVALUATION.md)

---

## Purpose

This document defines what constitutes an acceptable source for the BIS knowledge base, how sources are prioritized, and how to handle conflicts, versioning, and unverifiable information.

---

## 1. Authorized Sources

The following are considered **authorized sources** for BIS information:

| Source Category | Description | Trust Level |
|:---|:---|:---|
| **Indian Standards (IS) documents** | Full-text standards published by BIS | **Highest** |
| **BIS official website content** | Information published on the official BIS web presence | **High** |
| **BIS official notifications** | Gazette notifications, QCOs, amendments | **Highest** |
| **BIS certification scheme documents** | Official scheme guidelines | **High** |
| **BIS-recognized laboratory listings** | Official lab recognition records | **High** |
| **BIS annual reports / publications** | Official BIS publications | **Medium** |

### Not Authorized Sources

The following are **NOT acceptable** as primary sources:

| Source | Reason |
|:---|:---|
| Third-party summaries of standards | May be inaccurate, outdated, or biased |
| News articles about BIS | May contain interpretations, not authoritative text |
| Consultant blog posts | Unofficial interpretations |
| Wikipedia or encyclopedic sources | Not authoritative for regulatory information |
| LLM training data (parametric knowledge) | Not verifiable, may be outdated |
| Social media discussions | Unreliable |

> **Important:** Do NOT invent or assume URLs for BIS sources. Only reference URLs that have been verified to exist.

---

## 2. Source Priority

When multiple sources contain information about the same topic, use this priority order:

| Priority | Source |
|:---|:---|
| 1 (Highest) | Full-text Indian Standard (IS) document |
| 2 | BIS official gazette notification (QCO, amendment) |
| 3 | BIS official certification scheme document |
| 4 | BIS official website content |
| 5 | BIS official publication / annual report |

### Priority Rules

1. **Higher-priority sources override lower-priority ones** for factual claims.
2. **Standard documents are the ultimate authority** for technical requirements, clauses, and specifications.
3. **QCOs and notifications are the authority** for compulsory certification requirements and enforcement dates.
4. **If two sources of equal priority conflict**, flag the conflict rather than silently choosing one.

---

## 3. Source Verification

### Verification Requirements

Before a document is added to the knowledge base:

| Check | Description |
|:---|:---|
| **Authenticity** | Is this an official BIS document? |
| **Completeness** | Is the document complete (not truncated or partial)? |
| **Version** | What year/revision is this? Is it the current version? |
| **Status** | Is this standard current, superseded, or withdrawn? |
| **Legibility** | Is the text extractable and readable? |

### Verification Process

1. Confirm the document is from an authorized source category
2. Verify the standard number and title against known BIS records
3. Check the publication year and revision status
4. Verify the document is complete (all pages/sections present)
5. Record the verification in the document metadata

### Verification Record

| Field | Description |
|:---|:---|
| Verified by | Team member who verified |
| Verification date | Date of verification |
| Source obtained from | How/where the document was obtained |
| Status confirmed | Current / Superseded / Withdrawn |
| Notes | Any issues or observations |

---

## 4. Document Version Handling

### Current vs. Superseded Standards

| Scenario | Handling |
|:---|:---|
| User asks about a current standard | Provide information from the current version |
| User asks about a superseded standard | Provide the information but note that it is superseded; mention the current version |
| User asks about a withdrawn standard | Note that the standard has been withdrawn |
| No version specified | Default to the most recent version in the knowledge base |

### Amendment Handling

| Scenario | Handling |
|:---|:---|
| Standard has been amended | Incorporate amendments into the knowledge base |
| Amendment conflicts with original text | The amendment takes precedence |
| User asks about original vs. amended text | Explain both, note the amendment |

### Version Metadata

Every document must include:
- Publication year
- Revision number (if applicable)
- Status (current / superseded / withdrawn)
- Superseded-by reference (if applicable)
- Amendment references (if applicable)

---

## 5. Outdated Document Handling

### Rules

1. **Do not remove superseded documents.** Users may legitimately ask about older standards.
2. **Mark superseded documents clearly** in the metadata (`status: superseded`).
3. **When citing a superseded standard**, the system should inform the user of its status.
4. **The retrieval engine should prefer current documents** but not exclude superseded ones.

### Example Response Behavior

> "IS XXXXX:2004 specified [requirements]. However, this standard has been superseded by IS XXXXX:2016. The current version may have different requirements. I recommend referring to the latest version."

---

## 6. Conflicting Source Handling

When two authorized sources provide conflicting information:

### Resolution Process

1. **Check source priority.** Higher-priority source takes precedence.
2. **Check dates.** More recent information typically supersedes older.
3. **Check for amendments.** An amendment may have changed the original text.
4. **If conflict cannot be resolved:**
   - Present both pieces of information to the user
   - Note the potential conflict
   - Recommend verifying with BIS directly
   - **Never silently choose one over the other**

### Example Response Behavior

> "I found potentially conflicting information on this topic:
> - Source A (IS XXXXX, Clause Y.Z) states: '...'
> - Source B (BIS Guideline XYZ) states: '...'
>
> I recommend verifying the current requirement directly with BIS."

---

## 7. Citation Requirements

### What Must Be Cited

Every factual claim derived from the knowledge base must include:

| Element | Required | Example |
|:---|:---|:---|
| Standard / Document ID | Yes | IS 14543:2016 |
| Document Title | Yes | Packaged Drinking Water — Specification |
| Section | When available | Section 4: Requirements |
| Clause | When available | Clause 4.2 |
| Text Snippet | When relevant | "The water shall conform to..." |

### Citation Rules

1. **Never cite a document not in the knowledge base.**
2. **Never invent a standard number for citation purposes.**
3. **Cite the specific clause, not just the standard number**, when the information comes from a specific clause.
4. **Include the year** in standard citations (e.g., IS 14543:2016, not just IS 14543).

---

## 8. What to Do When a Source Cannot Be Verified

If the system receives a query about a topic where:
- No source exists in the knowledge base
- The retrieved sources do not contain relevant information
- The source quality is uncertain

### Response Rules

1. **State clearly** that the information could not be verified from the available knowledge base.
2. **Do not guess** or extrapolate from partially relevant sources.
3. **Suggest** that the user contact BIS directly for authoritative information.
4. **If partially relevant information exists**, provide it with appropriate qualifiers ("Based on related information in [source], however I could not find a specific reference for your exact question.").

---

## 9. Source Inventory

### Tracking Requirements

The BIS/QA team (Member 4) should maintain an inventory of all sources in the knowledge base:

| Field | Description |
|:---|:---|
| Document ID | Unique identifier |
| Standard Number | IS number (if applicable) |
| Title | Full title |
| Type | IS, QCO, Scheme, Lab Directory, etc. |
| Year / Revision | Publication date / version |
| Status | Current / Superseded / Withdrawn |
| Source | Where obtained |
| Date Added | When added to knowledge base |
| Verified By | Who verified the document |
| Notes | Any relevant notes |

---

## Open Decisions

| Decision | Status |
|:---|:---|
| Specific BIS source documents available for MVP | **STATUS: TBD** |
| Method for obtaining full-text Indian Standards | **STATUS: TBD** — Many are behind paywalls |
| Frequency of knowledge base updates | **STATUS: TBD** |
| Automated vs. manual source verification | **STATUS: TBD** |
