# Demo Script — BIS Intelligent Assistant

> Related: [PRODUCT_SPEC](PRODUCT_SPEC.md) | [USER_FLOWS](USER_FLOWS.md) | [UI_SPEC](../frontend/UI_SPEC.md)

---

## Purpose

This document provides a structured demonstration flow for presenting the BIS Intelligent Assistant. The demo showcases the strongest product differentiators:

1. Natural-language interaction (no need to know standard numbers)
2. Product → Standard discovery with explanations
3. Source-backed, evidence-grounded responses
4. Compliance journey guidance
5. Honest uncertainty handling

---

## Demo Setup

- Application running with the MVP knowledge base loaded
- Selected product categories available in the knowledge base
- Clean session (no prior conversation history)

---

## Act 1: The Problem

### Narration

> *"Imagine you're a small manufacturer. You've just designed a new domestic electrical product — a steam iron. You want to sell it in India. You know BIS certification may be required, but you have no idea which standard applies, what testing is needed, or how to get certified. Where do you start?"*
>
> *"Today, you'd have to search through thousands of Indian Standards, navigate multiple BIS portals, and decode technical documents. What if you could simply describe your product and get guided answers?"*

---

## Act 2: Product → Standard Discovery

### User Input

```
I manufacture a domestic electric steam iron operating at 230V.
What BIS standards and certification requirements should I be aware of?
```

### Expected System Behavior

1. **Intent Detection:** Product-to-Standard discovery + Certification guidance
2. **Product Understanding:** Domestic use, electric, steam iron, 230V
3. **Retrieval:** Searches knowledge base for matching standards
4. **Response:**
   - Lists relevant Indian Standards with standard numbers
   - Explains **WHY** each standard is relevant to the described product
   - Mentions applicable certification scheme
   - Offers next-step guidance (testing, certification process)
   - All information backed by source citations

### Demo Talking Points

- ✅ User described the product in natural language — no standard number needed
- ✅ System identified the relevant standard(s) and explained the reasoning
- ✅ Source citations are visible — user can verify every claim
- ✅ System proactively offered next steps

---

## Act 3: Certification Deep-Dive (Context-Aware Follow-Up)

### User Input

```
What is the certification process for this?
```

### Expected System Behavior

1. **Context Maintenance:** System remembers the product (domestic electric steam iron) and the identified standard(s)
2. **Intent Detection:** Certification process guidance
3. **Response:**
   - Explains the applicable BIS certification scheme
   - Outlines the process steps based on retrieved BIS guidelines
   - References the relevant standard
   - All claims source-backed

### Demo Talking Points

- ✅ No need to repeat the product description — context maintained
- ✅ Certification guidance based on authoritative BIS information
- ✅ Process steps are from official sources, not invented

---

## Act 4: Testing Requirements

### User Input

```
What testing is required?
```

### Expected System Behavior

1. **Context Maintenance:** Same product, same standard
2. **Intent Detection:** Testing requirements
3. **Response:**
   - Lists key testing categories/requirements from the relevant standard
   - References specific clauses where available
   - Source citations included

### Demo Talking Points

- ✅ Testing requirements traced to specific standard clauses
- ✅ Actionable, specific information — not vague generalities

---

## Act 5: Clarification Handling

### User Input (New Session)

```
I make electrical products.
```

### Expected System Behavior

1. **Intent Detection:** Product-to-Standard (insufficient information)
2. **Response:**
   - Asks targeted clarifying questions:
     - What type of electrical product?
     - Domestic or commercial/industrial use?
     - Key technical specifications?
   - Does NOT guess or assume

### Follow-Up User Input

```
It's a domestic ceiling fan.
```

### Expected System Behavior

- Combines context from both messages
- Identifies relevant standards for domestic ceiling fans
- Provides source-backed response

### Demo Talking Points

- ✅ System recognizes when information is insufficient
- ✅ Asks specific, helpful clarifying questions instead of guessing
- ✅ Builds context incrementally across the conversation

---

## Act 6: Uncertainty / No Evidence Handling

### User Input

```
What is the BIS standard for artificial intelligence training chips?
```

### Expected System Behavior

1. **Retrieval:** Searches knowledge base — no relevant results
2. **Response:**
   - Clearly states that no relevant standard was found in the current knowledge base
   - Does NOT hallucinate a standard number or requirements
   - Suggests contacting BIS directly for the latest information

### Demo Talking Points

- ✅ System does NOT invent standards or requirements
- ✅ Honest, transparent about the limits of available information
- ✅ This is a critical trust feature — the system earns credibility by admitting uncertainty

---

## Act 7: Direct Standard Query

### User Input

```
What is IS 14543 about?
```

### Expected System Behavior

- Retrieves information about IS 14543 from the knowledge base
- Explains the standard's scope, purpose, and key requirements
- Provides clause-level references where available

### Demo Talking Points

- ✅ Users who DO know a standard number can get quick explanations
- ✅ Response is grounded in the actual standard content

---

## Act 8: Source Citation Inspection

### Narration

> *"Notice that every response includes source references. Let me show you how a user can inspect the evidence behind any claim."*

### Demo Action

- Click/expand a source citation in the UI
- Show the source document, standard number, section/clause, and evidence snippet

### Demo Talking Points

- ✅ Full traceability — every factual claim linked to a source
- ✅ Users don't have to trust the AI blindly
- ✅ This is what makes this system a compliance copilot, not just a chatbot

---

## Summary Slide / Closing

### Key Differentiators Demonstrated

| Feature | What We Showed |
|:---|:---|
| Natural Language | User described a product in plain English |
| Product → Standard | System identified relevant standards with reasoning |
| Source-Backed | Every claim linked to document/clause references |
| Compliance Journey | Standard → Testing → Certification — guided flow |
| Context Awareness | Multi-turn conversation maintained context |
| Clarification | System asked for more info when needed |
| Trust | System honestly reported when evidence was unavailable |

### Closing Statement

> *"The BIS Intelligent Assistant transforms how users interact with BIS information — from searching through technical documents to having a guided conversation. It prioritizes trust and traceability: every answer is backed by evidence, and when the evidence isn't there, it says so."*

---

## Demo Recovery Notes

| Scenario | Recovery |
|:---|:---|
| System gives unexpected answer | Acknowledge and explain this is a prototype; show source citations to validate |
| Retrieval misses a relevant standard | Note that knowledge base coverage is being expanded |
| Response is slow | Explain that optimization is planned; the priority is accuracy |
| System hallucinates | (This should not happen) Flag as a bug; demonstrate that the evaluation pipeline catches these |
