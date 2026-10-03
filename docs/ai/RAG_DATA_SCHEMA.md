# RAG Data Schema — BIS Intelligent Assistant

> Related: [AI_PIPELINE](AI_PIPELINE.md) | [BIS_KNOWLEDGE_SPEC](../bis/BIS_KNOWLEDGE_SPEC.md) | [DATABASE_SCHEMA](../architecture/DATABASE_SCHEMA.md)

---

## Purpose

This document defines the data structures used by the RAG pipeline — how BIS documents are represented, chunked, embedded, and retrieved. This is the **knowledge base schema**, separate from the application database schema in [DATABASE_SCHEMA.md](../architecture/DATABASE_SCHEMA.md).

---

## Conceptual Hierarchy

```
BIS Source Document
  │
  ├── Document Metadata (title, standard number, type, year, etc.)
  │
  └── Sections
        │
        └── Clauses / Sub-clauses
              │
              └── Chunks (text segments for embedding and retrieval)
                    │
                    └── Embeddings (vector representations)
```

---

## Core Entities

### 1. Document

A document represents a complete BIS source (an Indian Standard, a BIS guideline, a scheme document, a laboratory listing, etc.).

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `document_id` | string | Yes | Unique identifier for this document |
| `title` | string | Yes | Full document title |
| `standard_number` | string | No | Indian Standard number (e.g., "IS 14543") |
| `standard_part` | string | No | Part number if applicable (e.g., "Part 2") |
| `document_type` | enum | Yes | See Document Types below |
| `year` | string | No | Publication / revision year |
| `revision` | string | No | Revision or amendment identifier |
| `status` | enum | Yes | `current`, `superseded`, `withdrawn` |
| `subject_area` | string | No | Subject classification (e.g., "Electrical", "Food") |
| `product_category` | string[] | No | Applicable product categories |
| `source` | string | Yes | Where this document was obtained |
| `source_url` | string | No | URL of the original source (if publicly available) |
| `ingestion_date` | datetime | Yes | When this document was processed |
| `total_sections` | integer | No | Number of sections in the document |
| `total_chunks` | integer | No | Number of chunks generated |

#### Document Types

| Type | Description |
|:---|:---|
| `indian_standard` | Indian Standard (IS) document |
| `bis_guideline` | BIS operational guideline |
| `certification_scheme` | Certification scheme document |
| `quality_control_order` | Quality Control Order (QCO) |
| `lab_directory` | Laboratory recognition / listing |
| `hallmarking_guideline` | Hallmarking-related document |
| `notification` | BIS notification / amendment |
| `general_information` | General BIS information |

---

### 2. Section

A section represents a logical division within a document (e.g., "Scope," "Requirements," "Test Methods").

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `section_id` | string | Yes | Unique identifier for this section |
| `document_id` | string | Yes | Parent document |
| `section_number` | string | No | Section number (e.g., "4", "Annex A") |
| `section_title` | string | Yes | Section title (e.g., "Requirements") |
| `level` | integer | Yes | Nesting depth (1 = top-level section) |
| `parent_section_id` | string | No | Parent section (for nested sections) |
| `content` | text | Yes | Full text content of this section |

---

### 3. Chunk

A chunk is a segment of text prepared for embedding and retrieval. Chunks are the primary unit of search.

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `chunk_id` | string | Yes | Unique identifier for this chunk |
| `document_id` | string | Yes | Parent document |
| `section_id` | string | No | Parent section |
| `clause` | string | No | Clause / sub-clause reference (e.g., "4.2.1") |
| `content` | text | Yes | The chunk text content |
| `content_type` | enum | Yes | `text`, `table`, `list`, `definition`, `note` |
| `char_count` | integer | Yes | Character count of the content |
| `token_count` | integer | No | Estimated token count |
| `chunk_index` | integer | Yes | Position of this chunk within the document |
| `standard_number` | string | No | Denormalized from document for retrieval filtering |
| `document_title` | string | No | Denormalized from document for citation display |
| `document_type` | string | No | Denormalized from document for retrieval filtering |
| `product_category` | string[] | No | Denormalized from document for retrieval filtering |
| `section_title` | string | No | Denormalized from section for citation display |

**Notes:**
- Metadata fields are denormalized (copied from parent document/section) to avoid joins during retrieval.
- Each chunk carries enough metadata to generate a citation without looking up the parent document.

---

### 4. Embedding

An embedding is a vector representation of a chunk, stored in the vector database.

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `embedding_id` | string | Yes | Unique identifier (often = chunk_id) |
| `chunk_id` | string | Yes | Associated chunk |
| `vector` | float[] | Yes | Dense vector representation |
| `model` | string | Yes | Embedding model used (e.g., "text-embedding-3-small") |
| `dimensions` | integer | Yes | Vector dimensionality |
| `created_at` | datetime | Yes | When this embedding was generated |

---

### 5. Retrieval Result

The output of the retrieval engine for a single matched chunk. This is the structure that flows from retrieval to generation.

| Field | Type | Description |
|:---|:---|:---|
| `chunk_id` | string | Matched chunk identifier |
| `content` | text | Chunk text content |
| `relevance_score` | float | Similarity / relevance score (0.0 – 1.0) |
| `standard_number` | string | Standard number (for citation) |
| `document_title` | string | Document title (for citation) |
| `document_type` | string | Document type |
| `section_title` | string | Section title (for citation) |
| `clause` | string | Clause reference (for citation) |
| `product_category` | string[] | Product categories |

---

### 6. Evidence (for Prompt Injection)

The evidence structure is what gets injected into the LLM prompt. It is a simplified view of the retrieval result.

```
EVIDENCE [1]:
Source: IS 14543:2016 — Packaged Drinking Water
Section: 4. Requirements
Clause: 4.2 Chemical Requirements
Content: "The water shall conform to the chemical requirements 
         as given in Table 1..."
```

---

## Chunking Strategy

> **STATUS: TBD** — Final chunking strategy depends on document structure and testing.

### Recommended Approach: Hierarchical Chunking

```
Document
  └── Section (provides context header)
        └── Clause (natural chunk boundary)
              └── Sub-clause (if clause is too large)
```

### Chunking Rules

1. **Prefer clause boundaries** over arbitrary character splits.
2. **Preserve clause numbers** in chunk content or metadata.
3. **Include section context** — prepend section title to each chunk for semantic enrichment.
4. **Avoid splitting tables** — keep tables as single chunks where possible.
5. **Target chunk size:** 500–1500 characters (exact size TBD, depends on testing).
6. **Overlap:** Include 100–200 characters of overlap between consecutive chunks (TBD).

### Anti-Pattern: Naive Character Chunking

❌ Do NOT split text purely by character count. This breaks clauses, separates sub-clauses from their parent context, and splits tables mid-row.

---

## Metadata Requirements

### Minimum Required Metadata per Chunk

| Field | Purpose |
|:---|:---|
| `standard_number` | Filter by standard; generate citations |
| `document_type` | Filter by document type during retrieval |
| `clause` | Generate clause-level citations |
| `section_title` | Provide context for the chunk content |
| `document_title` | Generate document-level citations |

### Metadata for Product-to-Standard Discovery

| Field | Purpose |
|:---|:---|
| `product_category` | Filter chunks relevant to a product type |
| `subject_area` | Broad subject classification for initial filtering |

---

## Relationships

```
┌──────────────┐    1:N    ┌──────────────┐    1:N    ┌──────────────┐
│   Document   │──────────▶│   Section    │──────────▶│    Chunk     │
│              │           │              │           │              │
│ standard_no  │           │ section_no   │           │ clause       │
│ title        │           │ title        │           │ content      │
│ type         │           │ level        │           │ embedding    │
│ year         │           │ content      │           │ metadata     │
└──────────────┘           └──────────────┘           └──────────────┘
```

---

## Open Decisions

| Decision | Status |
|:---|:---|
| Embedding model and dimensions | **STATUS: TBD** — See [TECH_STACK.md](../architecture/TECH_STACK.md) |
| Vector store implementation | **STATUS: TBD** — See [DECISIONS.md](../architecture/DECISIONS.md) |
| Exact chunk size and overlap | **STATUS: TBD** — Requires experimentation |
| Chunking strategy (hierarchical vs. recursive) | **STATUS: TBD** |
| Metadata filtering capabilities (depends on vector store choice) | **STATUS: TBD** |
