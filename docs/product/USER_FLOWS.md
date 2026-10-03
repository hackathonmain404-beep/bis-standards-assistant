# User Flows — BIS Intelligent Assistant

> Related: [PRODUCT_SPEC](PRODUCT_SPEC.md) | [UI_SPEC](../frontend/UI_SPEC.md) | [API_CONTRACT](../api/API_CONTRACT.md) | [AI_PIPELINE](../ai/AI_PIPELINE.md)

---

## Overview

This document defines the major user flows for the BIS Intelligent Assistant. Each flow describes the user's goal, the interaction steps, and expected system behavior.

---

## Flow 1: General BIS Question & Answer

**User Goal:** Get an answer to a BIS-related question.

```
User                                    System
─────                                   ──────
"What is IS 14543?"
                                        → Parse query
                                        → Detect intent: Standard Explanation
                                        → Retrieve IS 14543 information from knowledge base
                                        → Generate grounded explanation
                                        ← Response:
                                           "IS 14543 specifies requirements for
                                            packaged drinking water..."
                                           + Source: IS 14543:2016, Title, Scope
                                           + Related: IS 10500 (drinking water spec)
```

**Key behaviors:**
- Direct, grounded answer based on retrieved evidence
- Source citation included
- Related standards mentioned where relevant

---

## Flow 2: Product → Standard Discovery

**User Goal:** Identify which Indian Standard(s) apply to a product.

```
User                                    System
─────                                   ──────
"I manufacture a domestic
 electric steam iron."
                                        → Parse query
                                        → Detect intent: Product-to-Standard Discovery
                                        → Extract product attributes:
                                           - Product: electric steam iron
                                           - Use: domestic
                                           - Type: electrical appliance
                                        → Search knowledge base for matching standards
                                        → Retrieve relevant standards
                                        ← Response:
                                           "Based on your product description,
                                            the following standards may be relevant:

                                            1. IS 302-2-3 — Safety of household
                                               and similar electrical appliances —
                                               Particular requirements for
                                               electric irons
                                               WHY: Directly covers electric irons
                                               for household use.

                                            2. IS 302-1 — General requirements for
                                               safety of household appliances
                                               WHY: General safety standard
                                               applicable to all household
                                               electrical appliances.

                                            Would you like to know about:
                                            • Certification requirements?
                                            • Testing requirements?
                                            • Applicable BIS scheme?"

                                           + Sources: [IS 302-2-3, IS 302-1]
```

**Key behaviors:**
- Product attributes extracted from natural language
- Relevant standards returned with **WHY** explanation
- Follow-up guidance offered (certification, testing, etc.)
- No hallucinated standard numbers

---

## Flow 3: Certification Guidance

**User Goal:** Understand what BIS certification is needed for a product.

```
User                                    System
─────                                   ──────
(Continuing from Flow 2)
"What certification do I need
 for this product?"
                                        → Recall context: domestic electric steam iron
                                        → Detect intent: Certification Guidance
                                        → Retrieve certification scheme information
                                        ← Response:
                                           "Household electric irons fall under
                                            compulsory BIS certification.

                                            Applicable Scheme: [scheme details
                                            from knowledge base]

                                            Key requirements:
                                            • [Retrieved requirements]

                                            Process overview:
                                            1. [Steps from BIS guidelines]

                                            Would you like details on testing
                                            requirements or recognized labs?"

                                           + Sources: [Relevant BIS scheme docs]
```

**Key behaviors:**
- Context maintained from previous messages
- Certification scheme explained based on evidence
- Process steps from authoritative sources only
- Next-step guidance offered

---

## Flow 4: Testing Guidance

**User Goal:** Understand what testing is required for a product/standard.

```
User                                    System
─────                                   ──────
"What testing is required for
 IS 302-2-3 compliance?"
                                        → Parse query
                                        → Detect intent: Testing Requirements
                                        → Retrieve test clauses from IS 302-2-3
                                        ← Response:
                                           "IS 302-2-3 specifies the following
                                            key test requirements:

                                            [Testing categories and clauses
                                             retrieved from the standard]

                                            These tests must be performed at a
                                            BIS-recognized laboratory."

                                           + Sources: IS 302-2-3, Clause references
```

---

## Flow 5: Laboratory Discovery

**User Goal:** Find a relevant BIS-recognized testing laboratory.

```
User                                    System
─────                                   ──────
"Where can I get testing done
 for IS 302-2-3?"
                                        → Detect intent: Laboratory Discovery
                                        → Search laboratory information in knowledge base
                                        ← Response:
                                           "The following laboratories are recognized
                                            for testing under IS 302-2-3:

                                            [List from knowledge base, if available]

                                            Note: Please verify current recognition
                                            status directly with BIS."

                                           + Sources: [Lab directory references]
```

**Key behaviors:**
- Information from authoritative lab directory only
- Disclaimer about verifying current status
- If no lab data available, clearly states so

---

## Flow 6: Hallmarking / Consumer Query

**User Goal:** Understand hallmarking or consumer-related BIS information.

```
User                                    System
─────                                   ──────
"How do I check if gold jewelry
 is BIS hallmarked?"
                                        → Detect intent: Hallmarking / Consumer Query
                                        → Retrieve hallmarking information
                                        ← Response:
                                           "BIS hallmarking is a certification for
                                            purity of precious metals.

                                            How to verify:
                                            [Steps from BIS guidelines]

                                            BIS hallmark components:
                                            [Description from knowledge base]"

                                           + Sources: [BIS hallmarking guidelines]
```

---

## Flow 7: Multilingual Interaction

**User Goal:** Interact in a preferred Indian language.

```
User                                    System
─────                                   ──────
(Selects Hindi)
"मुझे पैकेज्ड पानी के लिए
 BIS मानक बताइए"
                                        → Detect language: Hindi
                                        → Parse query: BIS standards for packaged water
                                        → Retrieve relevant standards
                                        ← Response (in Hindi):
                                           "पैकेज्ड पीने के पानी के लिए
                                            प्रमुख भारतीय मानक IS 14543 है...

                                            [Grounded response in Hindi,
                                             technical terms preserved]"

                                           + Sources: IS 14543
```

**Key behaviors:**
- Response in user's selected language
- Technical terms (standard numbers, scheme names, clause numbers) preserved as-is
- Meaning and accuracy maintained across language

---

## Flow 8: Clarifying Questions

**User Goal:** The user's query is ambiguous or under-specified.

```
User                                    System
─────                                   ──────
"I make appliances."
                                        → Detect intent: Product-to-Standard (ambiguous)
                                        → Insufficient product information
                                        ← Clarifying response:
                                           "To help you find the relevant BIS
                                            standards, I need more information:

                                            • What type of appliance?
                                              (e.g., electrical, gas, kitchen)
                                            • Intended use?
                                              (domestic, commercial, industrial)
                                            • Key technical parameters?
                                              (voltage, capacity, etc.)"

User: "It's a domestic electric
 kettle, 230V."
                                        → Context updated: domestic electric kettle, 230V
                                        → Search for relevant standards
                                        ← Grounded response with relevant standards
```

**Key behaviors:**
- System recognizes insufficient information
- Asks specific, helpful clarifying questions
- Context from clarification is combined with original query
- Does NOT guess or assume

---

## Flow 9: Insufficient Evidence

**User Goal:** The user asks a question the system cannot reliably answer.

```
User                                    System
─────                                   ──────
"What is the BIS standard for
 quantum computing hardware?"
                                        → Search knowledge base
                                        → No relevant standards found
                                        ← Response:
                                           "I could not find a specific Indian
                                            Standard for quantum computing hardware
                                            in my current knowledge base.

                                            This may be because:
                                            • No specific standard exists for
                                              this product category yet
                                            • The relevant standard is not in
                                              my current knowledge base

                                            Suggestion: You may contact BIS
                                            directly for the latest information
                                            on standards development."
```

**Key behaviors:**
- Clearly states that evidence was not found
- Does NOT invent a standard
- Provides possible reasons
- Suggests alternative actions

---

## Flow 10: Source / Citation Display

**User Goal:** Verify where the system's answer came from.

```
User                                    System
─────                                   ──────
(Any query that returns results)
                                        ← Response includes:

                                        Answer text with inline references [1][2]

                                        ─── Sources ───
                                        [1] IS 14543:2016 — Packaged Drinking
                                            Water, Clause 4.2 — Chemical
                                            Requirements
                                            "The water shall conform to the
                                             chemical requirements as given
                                             in Table 1..."

                                        [2] BIS Certification Scheme-I
                                            Section 3 — Application Procedure
```

**Key behaviors:**
- Every factual claim linked to a numbered source
- Source includes: document name, standard number, section/clause
- Relevant evidence snippet shown
- User can inspect the basis for any claim

---

## Flow Summary

| # | Flow | Trigger | Key Outcome |
|:--|:-----|:--------|:------------|
| 1 | General Q&A | BIS question | Grounded answer + sources |
| 2 | Product → Standard | Product description | Relevant standards + WHY |
| 3 | Certification | "What certification?" | Scheme + requirements |
| 4 | Testing | "What testing?" | Test requirements + clauses |
| 5 | Laboratory | "Where to test?" | Recognized labs |
| 6 | Hallmarking/Consumer | Consumer question | Consumer-friendly guidance |
| 7 | Multilingual | Non-English query | Same quality in user's language |
| 8 | Clarification | Ambiguous query | Targeted clarifying questions |
| 9 | Insufficient Evidence | Unknown topic | Honest uncertainty statement |
| 10 | Citations | Any query | Traceable source references |
