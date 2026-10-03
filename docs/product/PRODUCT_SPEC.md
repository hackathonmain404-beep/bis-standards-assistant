# Product Specification — BIS Intelligent Assistant

> Related: [README](../../README.md) | [USER_FLOWS](USER_FLOWS.md) | [ROADMAP](ROADMAP.md) | [ARCHITECTURE](../architecture/ARCHITECTURE.md)

---

## 1. Product Vision

Create an AI-powered intelligent assistant that makes Bureau of Indian Standards (BIS) information accessible through natural language — transforming the user experience from "search through technical documents" to "describe your need, receive guided, evidence-backed answers."

The long-term vision is a **BIS Compliance Copilot** — a system that can take a product description and guide the user through the entire compliance journey: applicable standards, certification requirements, testing, licensing, and supporting evidence.

## 2. Problem Definition

### The Information Exists, But Is Hard to Navigate

BIS publishes thousands of Indian Standards and operates numerous services:

- Product certification (ISI Mark, CRS, etc.)
- Hallmarking of precious metals
- Laboratory recognition
- Conformity assessment
- Consumer affairs

This information is spread across multiple documents, portals, PDFs, and schemes. Users face several barriers:

| Barrier | Description |
|:---|:---|
| **Volume** | Thousands of standards across hundreds of product categories |
| **Technical Language** | Standards use specialized terminology |
| **Fragmentation** | Information spread across multiple sources and portals |
| **Navigation** | Users must already know the standard number to find relevant information |
| **Cross-referencing** | Related standards, schemes, and requirements are not easily linked |
| **Process Complexity** | Certification, licensing, and testing procedures are multi-step |

### Who Suffers Most

- **MSMEs and Startups** trying to comply with BIS requirements for the first time
- **Consumers** wanting to verify whether a product meets BIS standards
- **Students and Researchers** studying Indian Standards

## 3. Target Users

| User Segment | Primary Need |
|:---|:---|
| **MSMEs** | Identify applicable standards; understand certification process |
| **Startups** | Quick compliance guidance for new products |
| **Industry Professionals** | Fast lookup of standards, clauses, testing requirements |
| **Consumers** | Understand BIS marks, hallmarking, product certification status |
| **Students** | Study and understand Indian Standards |
| **Researchers** | Explore standards landscape and relationships |

## 4. User Pain Points

1. **"I don't know which standard applies."** Users cannot easily discover the relevant Indian Standard for their product without prior knowledge.
2. **"I don't understand the certification process."** The steps from standard → testing → certification → licensing are unclear.
3. **"I don't know what testing is required."** Testing requirements are buried in standard clauses.
4. **"I can't find relevant laboratories."** Recognized testing labs are not easy to discover.
5. **"The language is too technical."** Standards use specialized vocabulary that non-experts struggle with.
6. **"I need to understand a specific clause."** Understanding what a particular clause means requires significant context.
7. **"I want information in my language."** Non-English-speaking users face additional barriers.

## 5. Product Goals

1. **Natural-language access** to BIS information — users describe needs in plain language.
2. **Product → Standard discovery** — the defining product feature.
3. **Evidence-backed answers** — every response traceable to source documents.
4. **Compliance journey guidance** — from standard identification through certification.
5. **Zero hallucination** of regulatory information — trust above all.
6. **Context-aware conversation** — multi-turn interactions that build understanding.
7. **Multilingual support** — serve users in selected Indian languages.

## 6. Non-Goals

The BIS Intelligent Assistant is **NOT**:

| Non-Goal | Clarification |
|:---|:---|
| A replacement for BIS | The system provides information support, not legal authority |
| A legal certification body | It cannot declare a product compliant |
| A generic AI chatbot | It is strictly domain-specific to BIS |
| An autonomous regulatory advisor | It assists understanding, not autonomous decision-making |
| A system that invents information | If evidence is unavailable, it says so |
| Complete coverage of all BIS services | MVP will focus on prioritized categories |

## 7. Core Features

### A. BIS Question Answering

Natural-language Q&A about Indian Standards, BIS services, schemes, and procedures.

**Examples:**
- "What is IS 302-2-3 about?"
- "What does clause 4.2 of this standard require?"
- "What BIS requirements apply to packaged drinking water?"

### B. Product → Standard Discovery

User describes a product; system identifies potentially relevant Indian Standards with explanations of **why** each standard is relevant.

**Example:**
- Input: "I manufacture a domestic electric steam iron."
- Output: Relevant standards (e.g., IS 302-2-3), explanation, applicable scheme, testing requirements.

### C. Certification Guidance

Explain applicable BIS certification schemes based on product and standard context.

### D. Licensing / Certification Process Guidance

Walk the user through the relevant process:

```
Applicable Standard → Requirements → Testing → Application → Certification/Licensing
```

### E. Testing Requirement Guidance

Identify applicable testing requirements from standard clauses and BIS guidelines.

### F. Testing Laboratory Discovery

Help users find relevant BIS-recognized testing laboratories.

### G. Consumer Support

Answer consumer queries about BIS marks, certified products, hallmarking, and product safety.

### H. Hallmarking Guidance

Answer questions related to hallmarking of precious metals.

### I. Multilingual Interaction

Support interaction in selected Indian languages while preserving technical BIS terminology.

### J. Source-Backed Answers

Every answer includes:
- Source document identification
- Standard number (where applicable)
- Section / Clause reference
- Relevant evidence snippet

## 8. MVP Scope

The first version focuses on delivering a reliable, functional prototype — not full BIS coverage.

### MVP Includes

1. Natural-language BIS Q&A
2. RAG-based retrieval from curated BIS knowledge base
3. Source / clause references in responses
4. Product → relevant standard discovery (for selected product categories)
5. Certification / testing guidance (for selected schemes)
6. Context-aware multi-turn conversation
7. Basic error and uncertainty handling

### MVP May Include (Time Permitting)

- Hindi language support
- Laboratory discovery
- Hallmarking guidance module
- Consumer-focused queries

### MVP Excludes

- Complete coverage of all Indian Standards
- Full multilingual support (all Indian languages)
- User authentication and profiles
- Integration with external BIS portals
- Document upload and analysis
- Autonomous compliance assessment

## 9. Future Scope

| Phase | Potential Features |
|:---|:---|
| **Phase 2** | Broader standard coverage, Hindi support, laboratory discovery, hallmarking module |
| **Phase 3** | Additional Indian languages, advanced compliance journey visualization, QCO tracking |
| **Future** | BIS portal integration, user accounts, saved compliance reports, industry-specific modules |

## 10. Success Criteria

| Criterion | Measure |
|:---|:---|
| **Retrieval Accuracy** | Relevant standards/clauses retrieved for ≥80% of test queries |
| **Groundedness** | 0% hallucinated standard numbers, clause references, or schemes |
| **User Experience** | User can describe a product and receive meaningful guidance |
| **Source Traceability** | Every factual claim linked to a source document |
| **Context Awareness** | Multi-turn conversations maintain context correctly |
| **Response Quality** | Answers are clear, structured, and actionable |
| **Demo Readiness** | End-to-end flow demonstrable for selected product categories |

## 11. Key Product Principles

1. **Trust over confidence.** Never invent information. If uncertain, say so.
2. **Evidence over assertion.** Every claim must have a traceable source.
3. **Clarity over completeness.** A clear partial answer is better than an overwhelming dump.
4. **Guidance over declaration.** Guide the user; never declare compliance status.
5. **Context over isolation.** Maintain conversation context; don't treat every message as new.
6. **Simplicity over jargon.** Explain technical information in accessible language.
7. **User intent over keyword matching.** Understand what the user actually needs.
