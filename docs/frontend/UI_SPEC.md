# UI Specification — BIS Intelligent Assistant

> Related: [USER_FLOWS](../product/USER_FLOWS.md) | [API_CONTRACT](../api/API_CONTRACT.md) | [PRODUCT_SPEC](../product/PRODUCT_SPEC.md)

---

## Purpose

This document defines the user interface specification — layouts, components, states, and interaction patterns. It describes **what** the UI should do and look like, not **how** to implement it in code.

---

## 1. Design Principles

| Principle | Description |
|:---|:---|
| **Clarity over complexity** | BIS information is already complex; the UI must simplify, not add complexity |
| **Trust through transparency** | Citations and sources must be prominently visible |
| **Guided experience** | Help users discover what they can do; don't assume they know BIS terminology |
| **Responsive** | Work well on desktop and mobile screens |
| **Accessible** | Follow basic accessibility guidelines (contrast, keyboard nav, screen reader support) |

---

## 2. Main Application Layout

```
┌────────────────────────────────────────────────────────────┐
│  HEADER                                                    │
│  [Logo/Title]              [Language] [New Chat] [History] │
├──────────────┬─────────────────────────────────────────────┤
│              │                                             │
│  SIDEBAR     │           MAIN CONTENT AREA                 │
│  (Optional)  │                                             │
│              │  ┌─────────────────────────────────────┐    │
│  Session     │  │                                     │    │
│  History     │  │        CHAT MESSAGES                │    │
│              │  │                                     │    │
│  - Session 1 │  │  [User message]                     │    │
│  - Session 2 │  │  [Assistant response + citations]   │    │
│  - Session 3 │  │  [User message]                     │    │
│              │  │  [Assistant response + citations]   │    │
│              │  │                                     │    │
│              │  └─────────────────────────────────────┘    │
│              │                                             │
│              │  ┌─────────────────────────────────────┐    │
│              │  │  MESSAGE INPUT                      │    │
│              │  │  [Type your question...]    [Send]  │    │
│              │  └─────────────────────────────────────┘    │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

### Layout Notes

- Sidebar is collapsible on mobile
- Main content area is the primary focus
- Input bar is always visible at the bottom
- Header contains navigation and settings

---

## 3. Chat Interface

### 3.1 Message Bubbles

#### User Message

```
┌──────────────────────────────────┐
│  [User Avatar]                   │
│                                  │
│  I manufacture a domestic        │
│  electric steam iron operating   │
│  at 230V. What BIS standards     │
│  apply?                          │
│                                  │
│                          14:30   │
└──────────────────────────────────┘
```

#### Assistant Message

```
┌──────────────────────────────────────────────┐
│  [BIS Assistant Avatar]                      │
│                                              │
│  Based on your product description, the      │
│  following Indian Standards may be relevant: │
│                                              │
│  1. **IS 302-2-3** — Safety of household     │
│     electrical appliances — Electric irons   │
│     _Why: Directly covers electric irons     │
│     for household use._ [1]                  │
│                                              │
│  2. **IS 302-1** — General safety            │
│     requirements for household appliances    │
│     _Why: General safety standard for all    │
│     household electrical appliances._ [2]    │
│                                              │
│  ─── Sources ───────────────────────────     │
│  [1] IS 302-2-3:20XX — Title... ▶           │
│  [2] IS 302-1:20XX — Title...   ▶           │
│                                              │
│  ─── Suggested Next Steps ──────────────     │
│  [Certification requirements?]               │
│  [Testing requirements?]                     │
│  [Recognized laboratories?]                  │
│                                              │
│                                      14:31   │
└──────────────────────────────────────────────┘
```

### 3.2 Message Components

| Component | Description |
|:---|:---|
| **Avatar** | Distinguishes user from assistant messages |
| **Message Text** | Supports Markdown rendering (bold, lists, headers) |
| **Inline Citations** | Numbered references [1], [2] linking to source cards |
| **Source Cards** | Expandable cards showing standard ID, clause, and snippet |
| **Suggested Actions** | Clickable chips for follow-up questions |
| **Timestamp** | Message send/receive time |

---

## 4. Citation / Source Display

### 4.1 Collapsed Source Card

```
┌────────────────────────────────────────────┐
│  [1] IS 14543:2016 — Packaged Drinking     │
│      Water — Clause 4.2                 ▼  │
└────────────────────────────────────────────┘
```

### 4.2 Expanded Source Card

```
┌────────────────────────────────────────────┐
│  [1] IS 14543:2016 — Packaged Drinking     │
│      Water — Specification              ▲  │
│                                            │
│  Section: 4. Requirements                  │
│  Clause: 4.2 Chemical Requirements         │
│                                            │
│  "The water shall conform to the chemical  │
│   requirements as given in Table 1. The    │
│   pH value shall be between 6.5 and 8.5."  │
│                                            │
└────────────────────────────────────────────┘
```

### Source Display Rules

1. Sources are **always visible** — not hidden behind a settings menu.
2. Sources are **collapsed by default** to save space.
3. Users can **expand** any source to see the evidence snippet.
4. Inline references [1], [2] in the message text **link** to the corresponding source card.
5. Citation numbers are **consistent** within a message.

---

## 5. Product Input Flow

### 5.1 Free-Text Input (MVP)

Users describe their product in the main chat input:

```
[Type your product description or question...]    [Send]
```

### 5.2 Guided Product Input (Phase 2)

Optional structured input for better product-to-standard matching:

```
┌──────────────────────────────────────────────┐
│  Describe Your Product                       │
│                                              │
│  Product Type:    [Electric Iron        ▼]   │
│  Intended Use:    [Domestic             ▼]   │
│  Voltage:         [230V                   ]  │
│  Category:        [Household Electrical  ▼]  │
│  Description:     [                       ]  │
│                   [                       ]  │
│                                              │
│                          [Find Standards →]  │
└──────────────────────────────────────────────┘
```

---

## 6. Compliance Journey Display

When the assistant identifies a product → standard → certification path, display a visual stepper:

```
┌──────────────────────────────────────────────────────────┐
│  Compliance Journey                                      │
│                                                          │
│  ● Applicable Standard          IS 302-2-3               │
│  │                                                       │
│  ● Requirements                 Safety requirements      │
│  │                              identified               │
│  ○ Testing                      Testing requirements     │
│  │                              (click to explore)       │
│  ○ Certification                Certification scheme     │
│  │                              (click to explore)       │
│  ○ Recognized Labs              Find labs                │
│                                 (click to explore)       │
└──────────────────────────────────────────────────────────┘
```

| Symbol | Meaning |
|:---|:---|
| ● (filled) | Information provided |
| ○ (empty) | Information available — click to explore |

**Note:** This component is a Phase 2 enhancement. MVP can show this information inline in chat responses.

---

## 7. States

### 7.1 Loading State

While waiting for AI response:

```
┌──────────────────────────────────────┐
│  [BIS Assistant Avatar]             │
│                                      │
│  ● ● ●  Searching BIS knowledge...  │
│                                      │
└──────────────────────────────────────┘
```

- Show a typing indicator or loading animation
- Display a contextual message (e.g., "Searching for relevant standards...")
- Input field is disabled during loading

### 7.2 Error States

#### Service Error

```
┌──────────────────────────────────────┐
│  ⚠️  Something went wrong.          │
│                                      │
│  I'm having trouble processing your  │
│  request right now. Please try       │
│  again in a moment.                  │
│                                      │
│              [Try Again]             │
└──────────────────────────────────────┘
```

#### Network Error

```
┌──────────────────────────────────────┐
│  ⚠️  Connection Lost                │
│                                      │
│  Please check your internet          │
│  connection and try again.           │
│                                      │
│              [Retry]                 │
└──────────────────────────────────────┘
```

### 7.3 Empty State

When no conversation exists:

```
┌──────────────────────────────────────────────┐
│                                              │
│            🏛️ BIS Intelligent Assistant      │
│                                              │
│    Ask me about Indian Standards,            │
│    BIS certification, testing requirements,  │
│    or describe your product to find          │
│    relevant standards.                       │
│                                              │
│    Try:                                      │
│    [What is IS 14543?]                       │
│    [I manufacture electric kettles]          │
│    [How does BIS certification work?]        │
│                                              │
└──────────────────────────────────────────────┘
```

- Show welcome message with example queries
- Example queries are clickable

---

## 8. Clarification UI

When the assistant needs more information:

```
┌──────────────────────────────────────────────┐
│  [BIS Assistant Avatar]                      │
│                                              │
│  I need a bit more information to find the   │
│  right standards for you:                    │
│                                              │
│  • What type of product is it?               │
│    (e.g., electrical, food, mechanical)      │
│  • What is the intended use?                 │
│    (domestic, commercial, industrial)        │
│  • Key specifications?                       │
│    (voltage, capacity, material)             │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 9. Language Selection

```
┌──────────────────┐
│  Language         │
│  ○ English        │
│  ○ हिन्दी (Hindi) │
│  (More coming)    │
└──────────────────┘
```

- Language selector in the header
- Changes response language
- Technical terms (IS numbers, BIS, clause numbers) remain in English regardless

---

## 10. Responsive Design

| Breakpoint | Layout |
|:---|:---|
| **Desktop** (≥1024px) | Sidebar visible + main content area |
| **Tablet** (768–1023px) | Sidebar collapsible, main content fills width |
| **Mobile** (<768px) | Sidebar hidden (accessible via menu), full-width chat |

### Mobile-Specific Adjustments

- Sidebar becomes a drawer (slide-in from left)
- Source cards stack vertically
- Suggested actions wrap to new lines
- Input bar stays fixed at bottom

---

## 11. Accessibility

| Requirement | Description |
|:---|:---|
| **Keyboard Navigation** | All interactive elements reachable via keyboard |
| **Color Contrast** | Minimum WCAG AA contrast ratios |
| **Screen Reader** | Semantic HTML, ARIA labels for interactive elements |
| **Focus Indicators** | Visible focus rings on interactive elements |
| **Alt Text** | Descriptive text for icons and images |
| **Unique IDs** | All interactive elements have unique, descriptive `id` attributes |

---

## 12. Disclaimer Display

A persistent disclaimer should be visible in the UI:

```
ℹ️ This assistant provides information based on available BIS documents.
   Please verify with BIS for the most current and authoritative information.
```

- Can be shown in the footer, as a banner, or as part of the empty state
- Must not be easily dismissable / hidden

---

## Open Decisions

| Decision | Status |
|:---|:---|
| Frontend framework (React/Vite vs. Vanilla) | **STATUS: TBD** |
| Color scheme / visual design system | **STATUS: TBD** |
| Icon library | **STATUS: TBD** |
| Compliance journey visualization approach | **STATUS: TBD** — Inline in chat vs. dedicated panel |
| Session history sidebar vs. separate page | **STATUS: TBD** |
