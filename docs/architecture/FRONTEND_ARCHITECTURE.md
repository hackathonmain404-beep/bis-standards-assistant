# BIS Copilot — Frontend Architecture & Visual Theme Specification

> **Purpose:** This document defines the frontend architecture and visual direction for the BIS Copilot application.
>
> **Critical instruction:** Preserve the **existing content and product information exactly as it currently exists in the BIS Copilot UI**. The second visual reference is used **only for visual theme, layout language, spacing, surfaces, and interaction style**. Do **not** copy its text, product names, page content, features, labels, or information architecture.

---

## 1. Source of Truth

There are two visual references:

### Reference A — Current BIS Copilot UI

This is the source of truth for **content and functionality**.

Keep the existing application content, including:

- BIS Copilot branding
- Standards & Compliance subtitle
- Assistant
- Standards Search
- Compliance Journey
- Laboratory Finder
- Hallmarking Guide
- Saved Items
- Active Workspace
- New Chat
- Current Inquiry Session
- Government of India
- Bureau of Indian Standards
- Theme control
- Evidence Panel
- New Session
- Login
- BIS Intelligent Assistant
- Existing assistant description
- Existing “What I Can Help With” items
- Existing sample compliance inquiries
- Existing assistant input
- Existing Official Regulatory Advisory
- Existing page-specific data and workflows

### Reference B — PromptArchitect Visual Style

Use this reference **only as a design inspiration**.

Copy the visual language, not the content.

The desired visual characteristics include:

- dark professional workspace
- compact left navigation rail/sidebar
- very subtle borders
- dark neutral surfaces
- restrained accent colors
- compact pill-shaped controls
- modern rounded cards
- clean typography
- large amounts of controlled whitespace
- strong central content focus
- subtle hierarchy between surfaces
- minimal visual noise
- professional developer/SaaS-product aesthetic
- polished interaction states
- smooth micro-interactions

Do **not** copy:

- “PromptArchitect”
- “Two-Prompt Vibe Framework”
- “New Compilation”
- “Recent Specs”
- “Archetypes”
- “SaaS Web App”
- “Event Microservice”
- “React Native Mobile”
- “3D WebGL Canvas”
- any other text or concepts shown in the reference image.

---

# 2. Core Principle

The application should visually feel like:

> **A premium AI-powered standards and compliance workspace**

while retaining all existing BIS Copilot content and functionality.

The transformation is:

```text
Existing BIS Copilot Content
            +
PromptArchitect-inspired Visual Theme
            =
Polished BIS Copilot Frontend
```

Not:

```text
PromptArchitect Content
+
BIS Branding
```

---

# 3. Frontend Architecture

Use a layered, reusable frontend architecture.

Recommended structure:

```text
frontend/
├── app/
│   ├── layout
│   ├── page
│   ├── assistant/
│   ├── standards/
│   ├── compliance/
│   ├── laboratories/
│   ├── hallmarking/
│   └── saved/
│
├── components/
│   ├── shell/
│   │   ├── AppShell
│   │   ├── Sidebar
│   │   ├── SidebarItem
│   │   ├── TopNavigation
│   │   └── WorkspaceFooter
│   │
│   ├── assistant/
│   │   ├── AssistantHeader
│   │   ├── CapabilityChips
│   │   ├── InquiryCard
│   │   ├── AssistantInput
│   │   └── AssistantResponse
│   │
│   ├── standards/
│   │   ├── StandardsSearch
│   │   ├── StandardsFilters
│   │   ├── FilterChip
│   │   ├── StandardCard
│   │   └── StandardDetails
│   │
│   ├── compliance/
│   │   ├── ComplianceRoadmap
│   │   ├── ComplianceStage
│   │   ├── StageAnalysis
│   │   └── ComplianceChecklist
│   │
│   ├── laboratories/
│   │   ├── LaboratorySearch
│   │   ├── LaboratoryFilters
│   │   ├── LaboratoryCard
│   │   └── LaboratoryDetails
│   │
│   ├── hallmarking/
│   │   ├── HallmarkingOverview
│   │   ├── HallmarkingCard
│   │   └── PurityTable
│   │
│   ├── saved/
│   │   ├── SavedSummary
│   │   ├── SavedTabs
│   │   └── SavedItemCard
│   │
│   └── common/
│       ├── Button
│       ├── Input
│       ├── Select
│       ├── Badge
│       ├── Card
│       ├── Drawer
│       ├── Tooltip
│       ├── Tabs
│       ├── Skeleton
│       ├── EmptyState
│       └── ErrorState
│
├── services/
│   ├── assistantApi
│   ├── standardsApi
│   ├── complianceApi
│   ├── laboratoryApi
│   └── savedApi
│
├── hooks/
├── state/
├── types/
├── utils/
├── theme/
├── mocks/
└── tests/
```

Adapt this to the existing repository rather than blindly replacing its architecture.

---

# 4. Application Shell

The application shell must be shared across all pages.

Conceptually:

```text
┌─────────────────────────────────────────────────────────────┐
│ Top Navigation                                              │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│ Left Nav     │              Main Content                    │
│ / Workspace  │                                              │
│              │                                              │
│              │                                              │
├──────────────┴──────────────────────────────────────────────┤
│ Optional Regulatory / Informational Advisory                │
└─────────────────────────────────────────────────────────────┘
```

The shell must remain stable while the main route changes.

---

# 5. Sidebar / Left Navigation

Preserve the existing BIS navigation content.

Items remain:

1. Assistant
2. Standards Search
3. Compliance Journey
4. Laboratory Finder
5. Hallmarking Guide
6. Saved Items

The sidebar should use the visual language of the second screenshot:

- dark surface
- compact width
- subtle dividers
- clean iconography
- restrained selected state
- strong text hierarchy
- minimal decoration

## Interaction

Desktop:

- compact navigation rail by default
- hover expands/reveals labels
- active route remains clearly indicated
- tooltips appear when compact
- no hamburger button is required for desktop navigation

Touch devices:

- use the existing appropriate mobile navigation interaction
- do not depend exclusively on hover

---

# 6. Sidebar Workspace Section

Preserve the current content:

```text
ACTIVE WORKSPACE

[ + New Chat ]

● Current Inquiry Session
```

Do not add extra “+” controls.

Do not invent additional workspace features.

The workspace section should visually match the same dark SaaS-style theme.

---

# 7. Government / BIS Sidebar Footer

Preserve the existing content:

```text
Government of India
Bureau of Indian Standards
```

The visual presentation should resemble a professional application footer area:

- subtle divider
- compact typography
- readable muted text
- strong primary institution name

Do not replace or rewrite the content.

---

# 8. Top Navigation

Preserve the current user-facing controls that have already been approved:

- BIS Copilot identity
- Compliance & Standards subtitle
- Theme control
- Evidence Panel
- New Session
- Login

Do not introduce:

- Industry/MSME selector
- Language tile
- Mock Data control
- Cases control
- redundant hamburger control

These are not part of the desired final top navigation.

---

# 9. Top Navigation Visual Style

Use the second screenshot's visual approach:

- compact dark top bar
- subtle lower border
- rounded utility buttons
- small icon buttons
- strong brand identity
- spacious but compact alignment
- minimal visual noise

The Login button may remain the strongest utility action.

---

# 10. Main Content Layout

The main content should use a centered/max-width content grid.

Avoid excessive full-width stretching.

Use consistent:

- left/right content margins
- vertical rhythm
- section spacing
- card widths
- alignment

The left edge of related sections should line up.

---

# 11. Assistant Page

Preserve the existing content exactly.

Do not replace or rewrite the existing Assistant text.

Existing content remains conceptually:

```text
BIS Intelligent Assistant

Ask natural-language questions regarding Indian Standards,
mandatory Quality Control Orders (QCOs), testing protocols,
or describe your product to discover applicable standards.
```

Preserve:

### What I Can Help With

- Find potentially relevant standards
- Explain certification paths
- Identify testing requirements
- Find recognized laboratories
- Explain BIS terminology

Preserve the existing sample compliance inquiries.

Preserve the existing assistant input.

Preserve the Official Regulatory Advisory.

Only the visual theme/layout treatment should be influenced by the second reference.

---

# 12. Assistant Visual Language

Use the reference theme principles:

- large clear heading
- compact supporting description
- restrained accent icon
- pill-shaped capability chips
- clean inquiry cards
- dark surface hierarchy
- subtle borders
- generous whitespace
- strong central focus

Do not copy the visual reference's text/content.

---

# 13. Standards Search

Preserve the existing Standards Search functionality and content.

The page should use the same design system:

```text
Page Header
↓
Search
↓
Compact Filters
↓
Active Filter Chips
↓
Results Toolbar
↓
Standard Cards
```

Do not introduce irrelevant content from the reference screenshot.

---

# 14. Standards Search Visual Style

Use:

- dark surfaces
- subtle borders
- compact filter controls
- rounded cards
- restrained accent colors
- high readability
- clear result hierarchy

The visual reference should influence the **style**, not the information.

---

# 15. Compliance Journey

Preserve all existing compliance content.

Use:

```text
Roadmap
+
Stage Analysis
```

Maintain:

- completed stages
- current stage
- pending stages
- progress
- checklist
- certification information
- evidence

Use the reference theme's clean dark workspace approach.

---

# 16. Laboratory Finder

Preserve all existing laboratory information.

Use:

```text
Search
↓
State / Recognition
↓
Result Count
↓
Laboratory Tiles
```

The tiles should use:

- consistent height
- compact metadata
- rounded surface
- subtle border
- clear hierarchy
- restrained hover state

Do not replace laboratory information with the reference content.

---

# 17. Hallmarking Guide

Preserve existing Hallmarking information.

Use a structured hierarchy:

```text
Hero / Intro
↓
Quick Reference
↓
Key Information Cards
↓
Explanations
↓
Purity Table
↓
HUID / Consumer Guidance
```

The visual style should borrow the reference's:

- dark canvas
- compact cards
- subtle borders
- restrained color accents

---

# 18. Saved Items

Preserve the existing Saved Items functionality and content.

Use:

```text
Summary
↓
Tabs
↓
Saved Standard Cards
```

Use the reference visual language:

- dark cards
- compact metadata
- subtle dividers
- clean tabs
- controlled accent colors

---

# 19. Design Tokens

Create semantic tokens.

Example:

```css
--bg-page
--bg-sidebar
--bg-header

--surface
--surface-elevated
--surface-hover
--surface-selected

--text-primary
--text-secondary
--text-muted

--border
--border-subtle

--accent-primary
--accent-secondary

--success
--warning
--error
--info
```

Use the existing project token system if it already exists.

---

# 20. Visual Theme

The theme should take inspiration from the second screenshot's dark SaaS/editorial aesthetic.

### Base

Very dark neutral/navy background.

### Sidebar

Slightly darker or visually separated dark surface.

### Header

Subtle elevated dark surface.

### Cards

Slightly lighter than the page background.

### Borders

Very subtle cool-gray/navy borders.

### Text

Bright primary text.

Muted but readable secondary text.

### Accent

Use restrained blue/cyan/purple-style accents where appropriate, while preserving the BIS Copilot brand identity.

Do not blindly copy the exact accent colors from the second screenshot.

---

# 21. Typography

Use a modern, highly legible sans-serif.

Hierarchy:

```text
Page Title
Section Title
Card Title
Body
Secondary
Caption
Badge
```

Do not copy the exact typography of the visual reference if it conflicts with the existing product.

---

# 22. Cards

The reference uses clean rounded cards.

Apply that concept to BIS Copilot.

Cards should have:

- consistent radius
- subtle border
- dark elevated surface
- consistent padding
- clean title/body/action hierarchy

Avoid excessive shadow.

---

# 23. Pills / Chips

Use pill-shaped UI for:

- assistant capabilities
- compact filters
- status metadata
- tags

Pills should remain compact.

Do not turn every control into a pill.

---

# 24. Buttons

Use three main button types:

### Primary

For important actions such as Login.

### Secondary

For New Session and Evidence Panel.

### Icon Button

For theme and utility controls.

All buttons require:

- hover
- focus
- active
- disabled

states.

---

# 25. Interaction / Motion

Use the refined motion system already established for BIS Copilot.

Motion should include:

- hover navigation
- sidebar expansion
- page transitions
- card entrance
- tab indicator movement
- drawer transitions
- evidence panel transitions
- filter drawer transitions
- subtle button feedback

Do not copy the reference application's exact animations.

Copy only the principle of polished interaction.

---

# 26. Page Transitions

Every major route should transition smoothly:

```text
Assistant
→ Standards Search
→ Compliance Journey
→ Laboratory Finder
→ Hallmarking Guide
→ Saved Items
```

Use subtle:

- opacity
- translateY
- controlled duration

Do not use dramatic transitions.

---

# 27. Responsive Architecture

Desktop:

- compact left navigation
- full main workspace
- persistent top navigation

Tablet:

- reduced sidebar width
- adaptive content grid

Mobile:

- touch-appropriate navigation
- stacked cards
- compact top bar
- responsive drawers where needed

Never rely on hover as the only interaction on touch devices.

---

# 28. Accessibility

Implement:

- keyboard navigation
- focus states
- semantic HTML
- accessible labels
- accessible tabs
- accessible drawers
- sufficient contrast
- reduced-motion support

---

# 29. Frontend / Backend / AI Boundary

The frontend remains independent of AI internals.

Architecture:

```text
UI
↓
Frontend Service Layer
↓
Backend API
↓
AI / RAG
```

The frontend must not know:

- which LLM is used
- which embedding model is used
- which vector database is used
- how retrieval works
- how documents are chunked

---

# 30. Mock Data

Mock data can remain internally available for development.

However, mock/development controls should not be presented as part of the primary user-facing navigation.

---

# 31. Content Preservation Rule

This is NON-NEGOTIABLE.

Do not:

- rewrite existing copy
- rename navigation items
- replace BIS content
- introduce PromptArchitect content
- remove actual BIS workflows
- invent new pages
- invent new product features

Only change:

- theme
- layout treatment
- component styling
- spacing
- visual hierarchy
- interaction polish
- animation

---

# 32. Visual Reference Rule

When comparing the two screenshots:

### Screenshot A determines:

- content
- wording
- functionality
- navigation
- product identity
- workflows

### Screenshot B determines:

- visual mood
- theme
- surface hierarchy
- spacing philosophy
- card style
- pill style
- navigation treatment
- modern SaaS/editorial feel

Never reverse these roles.

---

# 33. Acceptance Criteria

The frontend is successful when:

- BIS Copilot still contains all current content.
- The existing navigation remains intact.
- The Assistant content remains unchanged.
- Standards Search content remains unchanged.
- Compliance content remains unchanged.
- Laboratory information remains unchanged.
- Hallmarking information remains unchanged.
- Saved Items remain unchanged.
- The second screenshot's visual language is clearly reflected.
- No PromptArchitect content appears.
- The application feels like one coherent product.
- Shared components use consistent styling.
- Navigation feels polished.
- Cards feel related.
- The layout feels intentional.
- Dark theme is professional and readable.
- Responsive behavior remains intact.
- Existing API/AI integration remains intact.

---

# 34. Final Design Direction

The intended transformation is:

```text
CURRENT BIS CONTENT
        +
Professional Dark SaaS Workspace Theme
        +
Clean Component System
        +
Strong Typography
        +
Subtle Borders
        +
Rounded Cards
        +
Controlled Accent Colors
        +
Smooth Motion
        ↓
BIS COPILOT — POLISHED FRONTEND
```

The final product should feel like a serious professional compliance workspace rather than a generic chatbot or a copied PromptArchitect interface.

---

# 35. Final Rule for Implementation

Before changing any page:

1. Preserve the existing content.
2. Preserve the existing functionality.
3. Identify the shared component involved.
4. Apply the visual system at the component level.
5. Verify the same component still looks consistent everywhere.

Do not solve the same visual problem separately on every page.

Use a shared design system.

---

## End State

The user should look at the application and immediately recognize:

> **BIS Copilot**

while also feeling that it has the polished visual quality of a modern professional AI workspace.

The visual reference is inspiration only.

**BIS content remains the source of truth.**
