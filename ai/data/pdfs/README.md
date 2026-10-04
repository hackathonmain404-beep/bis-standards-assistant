# BIS PDF Repository

Place your official Bureau of Indian Standards (BIS) documents, Indian Standards (IS), and Quality Control Orders (QCOs) in PDF format into this directory:

```
ai/data/pdfs/
  ├── IS_10500_2012.pdf
  ├── IS_1786_2008.pdf
  ├── IS_1417_2016.pdf
  └── ...
```

## How to Ingest All PDFs in One Command

Run the batch ingestion command from the project root:

```bash
# Using the project's virtual environment:
python ai/ingest_standard.py --dir ai/data/pdfs
```

### What happens automatically:
1. **Text & Structure Extraction:** Extracts high-fidelity text across pages using `pypdf`, removing page noise and broken line wraps.
2. **Metadata Deduction:** Auto-detects standard number (e.g. `IS 10500:2012`), publication year, document title, and product categories.
3. **Hierarchical Clause Chunking:** Splits the standard into structured sections and clauses (e.g. `Clause 4.1 Chemical Requirements`).
4. **Instant Hybrid Indexing:** Generates searchable chunk artifacts in `ai/data/processed/` that are automatically retrieved by the BM25 and vector search engines!

## How to Ingest a Single PDF

```bash
# Ingest with automatic metadata detection:
python ai/ingest_standard.py --file ai/data/pdfs/my_standard.pdf

# Or explicitly provide standard details:
python ai/ingest_standard.py \
  --file ai/data/pdfs/IS_10500_2012.pdf \
  --standard "IS 10500:2012" \
  --title "Drinking Water — Specification" \
  --year 2012 \
  --categories "Food and Agriculture, Drinking Water"
```
