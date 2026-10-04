# Visual Design System & Styling Specification (`theme.md`)

> **Document Classification:** Standalone Visual Design Contract  
> **Target Audience:** Frontend Architects, UI Engineers, Design Technologists, AI Agents  
> **Scope:** Pure Visual & Interaction Styling System (Strictly Zero Content, Zero Copy, Zero Business Logic)

---

## 1. Design Direction

### 1.1 Design Philosophy
The visual system is grounded in **precision-engineered modern functionalism with tactile optical depth**. The interface prioritizes cognitive clarity, intentional hierarchy, and structural restraint. Every visual element exists to frame, differentiate, or clarify relationships between interactive components and data containers.

### 1.2 Visual Mood & Character
* **Mood:** Calm, focused, refined, architectural, and deliberate.
* **Character:** Contemporary geometric structuralism with soft ambient illumination, sub-pixel borders, and subtle physical material layering.
* **Emotional Resonance:** High trustworthiness, rapid responsiveness, and understated luxury.

### 1.3 Minimalism & Visual Density
* **Minimalism Level:** High structural discipline. Zero ornamental clutter, arbitrary decorative shapes, or gratuitous heavy gradients.
* **Visual Density:** Calibrated medium-compact density by default. Micro-components utilize tight, efficient padding to conserve vertical viewport space, balanced by generous, breathing margins between primary architectural containers.
* **Information Density:** High visual signal-to-noise ratio achieved through typographic scale, weight contrasts, and surface elevation rather than heavy borders or aggressive colors.

### 1.4 Professional vs. Playful Balance
* **Ratio:** 85% Professional / Structural Rigor to 15% Tactile Delight.
* **Expression:** Professional foundations (strict grid alignment, systematic typography, neutral surfaces) elevated by dynamic micro-feedback (restrained physical button presses, smooth cubic-bezier transitions, and soft interactive glows).

### 1.5 Modernity & Premium Polish
* **Modern Characteristics:** CSS custom properties, backdrop-filtered frosted glass surfaces, semi-transparent border lines (`rgba` / `hsla`), adaptive dual-theme color tokens, fluid typography formulas, and hardware-accelerated animations.
* **Premium Identifiers:** Multi-layered soft drop shadows (ambient occlusion + directional key light), mathematically harmonious border-radius nesting, consistent baseline rhythm, and high-contrast accessible states.

### 1.6 Visual Hierarchy & Consistency Principles
* **Layered Dimensionality:** The z-axis is strictly organized from recessed canvas backgrounds up through stacked surfaces, interactive controls, floating tooltips, and modal viewports.
* **Optical Weight Distribution:** Visual prominence flows logically: Primary Interactive Action > Focused/Active Container > Secondary Surface > Supporting Neutral Control > Subtle Divider.
* **First Impression:** Upon first paint, the interface presents immediate structural poise, instantaneous perceived performance, and an intuitive hierarchy where primary action areas require zero cognitive decoding.

---

## 2. Color System

### 2.1 Architecture & Token Model
The color system utilizes a functional token architecture split into three layers:
1. **Palette Primitives:** Raw chromatic scales (50 to 950).
2. **Semantic Theme Tokens:** Meaning-derived abstraction variables mapped dynamically to light and dark themes.
3. **Component-Level Scopes:** Direct bindings (`--btn-bg`, `--input-border`).

---

### 2.2 Color Tokens Specification

#### Core Semantic Palette Roles
* **Primary:** Core brand and intent color. Used for primary interactive triggers, active navigation items, key progress indicators, and focused elements.
* **Secondary:** Complementary neutral or low-saturation chromatic tone. Used for supporting action containers, inactive badges, and secondary surfaces.
* **Accent:** High-energy focal color. Used sparingly for highlights, special status indicators, and subtle glow effects.
* **Background Canvas:** The lowest z-index foundational canvas layer across the viewport.
* **Surface Default:** Base container surface for cards, panels, and content blocks.
* **Surface Elevated:** Higher-tier surface for cards with elevation, floating bars, or grouped content layers.
* **Surface Overlay:** Highest surface tier for modals, popovers, flyouts, and floating dialogs.
* **Borders & Hairlines:** Low-contrast architectural lines providing boundary definition without visual clutter.
* **Text / Typography:** High-contrast heading, readable body, muted secondary, and low-contrast disabled tokens.
* **Feedback States:** Dedicated semantic families for Success (positive/valid), Warning (cautionary), Error (destructive/invalid), and Info (advisory).

---

### 2.3 Light Theme Tokens

| Semantic Token | Purpose | HEX | RGB | HSL | Contrast vs Canvas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--color-bg-canvas` | Viewport foundational base | `#F8FAFC` | `248, 250, 252` | `210, 40%, 98%` | Base |
| `--color-bg-subtle` | Alternate background striping | `#F1F5F9` | `241, 245, 249` | `210, 40%, 96%` | 1.08:1 |
| `--color-surface-base` | Default card / container surface | `#FFFFFF` | `255, 255, 255` | `0, 0%, 100%` | 1.07:1 |
| `--color-surface-elevated` | Floating cards & elevated panels | `#FFFFFF` | `255, 255, 255` | `0, 0%, 100%` | 1.07:1 |
| `--color-surface-overlay` | Modals, flyouts, popovers | `#FFFFFF` | `255, 255, 255` | `0, 0%, 100%` | 1.07:1 |
| `--color-surface-sunken` | Inset text fields, wells | `#F1F5F9` | `241, 245, 249` | `210, 40%, 96%` | 1.08:1 |
| `--color-border-subtle` | Structural dividers & hairlines | `#E2E8F0` | `226, 232, 240` | `214, 32%, 91%` | 1.25:1 |
| `--color-border-default` | Component boundary borders | `#CBD5E1` | `203, 213, 225` | `214, 20%, 84%` | 1.52:1 |
| `--color-border-hover` | Hover-state border boundary | `#94A3B8` | `148, 163, 184` | `215, 20%, 65%` | 2.50:1 |
| `--color-border-strong` | Active & selected boundaries | `#64748B` | `100, 116, 139` | `215, 16%, 47%` | 4.60:1 (AA) |
| `--color-text-primary` | Headings & primary typography | `#0F172A` | `15, 23, 42` | `222, 47%, 11%` | 16.2:1 (AAA) |
| `--color-text-secondary` | Body text & standard labels | `#334155` | `51, 65, 85` | `215, 25%, 27%` | 10.4:1 (AAA) |
| `--color-text-muted` | Supporting captions & metadata | `#64748B` | `100, 116, 139` | `215, 16%, 47%` | 4.60:1 (AA) |
| `--color-text-disabled` | Inactive & disabled text | `#94A3B8` | `148, 163, 184` | `215, 20%, 65%` | 2.50:1 |
| `--color-text-inverse` | Text on inverted/dark surfaces | `#FFFFFF` | `255, 255, 255` | `0, 0%, 100%` | 21.0:1 |
| `--color-primary-base` | Primary actions & indicators | `#4F46E5` | `79, 70, 229` | `243, 75%, 59%` | 4.90:1 (AA) |
| `--color-primary-hover` | Primary hover state | `#4338CA` | `67, 56, 202` | `245, 58%, 51%` | 6.20:1 (AA) |
| `--color-primary-active` | Primary active / pressed state | `#3730A3` | `55, 48, 163` | `244, 55%, 41%` | 8.30:1 (AAA) |
| `--color-primary-subtle` | Primary light surface tint | `#EEF2FF` | `238, 242, 255` | `226, 100%, 97%` | 1.10:1 |
| `--color-primary-border` | Tinted primary border outline | `#C7D2FE` | `199, 210, 254` | `228, 96%, 89%` | 1.45:1 |
| `--color-secondary-base` | Secondary action container | `#E2E8F0` | `226, 232, 240` | `214, 32%, 91%` | 1.25:1 |
| `--color-secondary-hover`| Secondary hover state | `#CBD5E1` | `203, 213, 225` | `214, 20%, 84%` | 1.52:1 |
| `--color-secondary-active`| Secondary pressed state | `#94A3B8` | `148, 163, 184` | `215, 20%, 65%` | 2.50:1 |
| `--color-accent-base` | Accent highlight color | `#06B6D4` | `6, 182, 212` | `189, 94%, 43%` | 3.10:1 |
| `--color-accent-subtle` | Accent soft background | `#ECFEFF` | `236, 254, 255` | `184, 100%, 96%` | 1.05:1 |
| `--color-success-base` | Success state trigger & text | `#16A34A` | `22, 163, 74` | `142, 76%, 36%` | 4.60:1 (AA) |
| `--color-success-subtle`| Success surface / container | `#F0FDF4` | `240, 253, 244` | `138, 76%, 97%` | 1.06:1 |
| `--color-success-border`| Success boundary line | `#BBF7D0` | `187, 247, 208` | `141, 79%, 85%` | 1.35:1 |
| `--color-warning-base` | Warning state trigger & text | `#D97706` | `217, 119, 6` | `32, 95%, 44%` | 4.50:1 (AA) |
| `--color-warning-subtle`| Warning surface / container | `#FFFBEB` | `255, 251, 235` | `48, 100%, 96%` | 1.05:1 |
| `--color-warning-border`| Warning boundary line | `#FDE68A` | `253, 230, 138` | `48, 96%, 77%` | 1.30:1 |
| `--color-error-base` | Destructive action / error text | `#DC2626` | `220, 38, 38` | `0, 72%, 51%` | 4.70:1 (AA) |
| `--color-error-subtle` | Destructive surface container | `#FEF2F2` | `254, 242, 242` | `0, 86%, 97%` | 1.08:1 |
| `--color-error-border` | Destructive boundary line | `#FECACA` | `254, 202, 202` | `0, 93%, 89%` | 1.40:1 |
| `--color-info-base` | Informational state trigger | `#2563EB` | `37, 99, 235` | `221, 83%, 53%` | 4.60:1 (AA) |
| `--color-info-subtle` | Informational surface container | `#EFF6FF` | `239, 246, 255` | `214, 100%, 97%` | 1.08:1 |
| `--color-info-border` | Informational boundary line | `#BFDBFE` | `191, 219, 254` | `213, 97%, 87%` | 1.40:1 |
| `--color-overlay` | Scrim / backdrop modal veil | `rgba(15, 23, 42, 0.45)` | - | - | Non-text |
| `--color-focus-ring` | Focus ring outline color | `rgba(79, 70, 229, 0.40)`| - | - | Non-text |

---

### 2.4 Dark Theme Tokens

| Semantic Token | Purpose | HEX | RGB | HSL | Contrast vs Canvas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--color-bg-canvas` | Foundational dark canvas base | `#090D16` | `9, 13, 22` | `222, 42%, 6%` | Base |
| `--color-bg-subtle` | Alternate background striping | `#0E1424` | `14, 20, 36` | `224, 44%, 10%` | 1.15:1 |
| `--color-surface-base` | Default card / container surface | `#131B2E` | `19, 27, 46` | `222, 42%, 13%` | 1.35:1 |
| `--color-surface-elevated` | Floating cards & elevated panels | `#18223B` | `24, 34, 59` | `223, 42%, 16%` | 1.65:1 |
| `--color-surface-overlay` | Modals, flyouts, popovers | `#1E2B4A` | `30, 43, 74` | `222, 42%, 20%` | 2.10:1 |
| `--color-surface-sunken` | Inset text fields, wells | `#0B101C` | `11, 16, 28` | `222, 44%, 8%` | 1.08:1 |
| `--color-border-subtle` | Structural dividers & hairlines | `rgba(255, 255, 255, 0.08)`| - | - | 1.30:1 |
| `--color-border-default` | Component boundary borders | `rgba(255, 255, 255, 0.14)`| - | - | 1.80:1 |
| `--color-border-hover` | Hover-state border boundary | `rgba(255, 255, 255, 0.26)`| - | - | 3.20:1 |
| `--color-border-strong` | Active & selected boundaries | `rgba(255, 255, 255, 0.42)`| - | - | 5.80:1 (AA) |
| `--color-text-primary` | Headings & primary typography | `#F8FAFC` | `248, 250, 252` | `210, 40%, 98%` | 18.2:1 (AAA) |
| `--color-text-secondary` | Body text & standard labels | `#CBD5E1` | `203, 213, 225` | `214, 20%, 84%` | 11.5:1 (AAA) |
| `--color-text-muted` | Supporting captions & metadata | `#94A3B8` | `148, 163, 184` | `215, 20%, 65%` | 6.80:1 (AA) |
| `--color-text-disabled` | Inactive & disabled text | `#475569` | `71, 85, 105` | `215, 19%, 35%` | 2.60:1 |
| `--color-text-inverse` | Text on inverted light surfaces | `#090D16` | `9, 13, 22` | `222, 42%, 6%` | 18.2:1 |
| `--color-primary-base` | Primary actions & indicators | `#6366F1` | `99, 102, 241` | `239, 84%, 67%` | 5.60:1 (AA) |
| `--color-primary-hover` | Primary hover state | `#818CF8` | `129, 140, 248` | `234, 89%, 74%` | 7.90:1 (AAA) |
| `--color-primary-active` | Primary active / pressed state | `#4F46E5` | `79, 70, 229` | `243, 75%, 59%` | 4.10:1 |
| `--color-primary-subtle` | Primary dark surface tint | `rgba(99, 102, 241, 0.12)`| - | - | 1.25:1 |
| `--color-primary-border` | Tinted primary border outline | `rgba(99, 102, 241, 0.35)`| - | - | 2.10:1 |
| `--color-secondary-base` | Secondary action container | `#1E293B` | `30, 41, 59` | `217, 33%, 17%` | 1.80:1 |
| `--color-secondary-hover`| Secondary hover state | `#334155` | `51, 65, 85` | `215, 25%, 27%` | 2.40:1 |
| `--color-secondary-active`| Secondary pressed state | `#475569` | `71, 85, 105` | `215, 19%, 35%` | 3.50:1 |
| `--color-accent-base` | Accent highlight color | `#22D3EE` | `34, 211, 238` | `187, 83%, 53%` | 9.80:1 (AAA) |
| `--color-accent-subtle` | Accent soft background | `rgba(34, 211, 238, 0.10)`| - | - | 1.20:1 |
| `--color-success-base` | Success state trigger & text | `#4ADE80` | `74, 222, 128` | `142, 69%, 58%` | 9.50:1 (AAA) |
| `--color-success-subtle`| Success surface / container | `rgba(74, 222, 128, 0.12)`| - | - | 1.22:1 |
| `--color-success-border`| Success boundary line | `rgba(74, 222, 128, 0.30)`| - | - | 2.10:1 |
| `--color-warning-base` | Warning state trigger & text | `#FBBF24` | `251, 191, 36` | `43, 96%, 56%` | 11.2:1 (AAA) |
| `--color-warning-subtle`| Warning surface / container | `rgba(251, 191, 36, 0.12)`| - | - | 1.25:1 |
| `--color-warning-border`| Warning boundary line | `rgba(251, 191, 36, 0.30)`| - | - | 2.30:1 |
| `--color-error-base` | Destructive action / error text | `#F87171` | `248, 113, 113` | `0, 91%, 71%` | 7.40:1 (AAA) |
| `--color-error-subtle` | Destructive surface container | `rgba(248, 113, 113, 0.12)`| - | - | 1.24:1 |
| `--color-error-border` | Destructive boundary line | `rgba(248, 113, 113, 0.30)`| - | - | 2.10:1 |
| `--color-info-base` | Informational state trigger | `#60A5FA` | `96, 165, 250` | `213, 93%, 68%` | 8.10:1 (AAA) |
| `--color-info-subtle` | Informational surface container | `rgba(96, 165, 250, 0.12)` | - | - | 1.22:1 |
| `--color-info-border` | Informational boundary line | `rgba(96, 165, 250, 0.30)` | - | - | 2.10:1 |
| `--color-overlay` | Scrim / backdrop modal veil | `rgba(2, 6, 14, 0.75)` | - | - | Non-text |
| `--color-focus-ring` | Focus ring outline color | `rgba(99, 102, 241, 0.50)`| - | - | Non-text |

---

## 3. Typography System

### 3.1 Font Family Architecture
* **Primary System Stack (Neo-Grotesque Sans):**  
  `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`  
  *Characteristics:* Neutral aperture, high x-height, clear numeric tabular figures, optimal legibility across sub-pixel rasterization.
* **Secondary / Display Stack (Geometric Sans - Optional for Large Display):**  
  `"Plus Jakarta Sans", "Inter Display", -apple-system, BlinkMacSystemFont, sans-serif`  
  *Characteristics:* Tight tracking, geometric forms, high visual authority for top-level headers.
* **Monospace / Code Stack:**  
  `"JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`  
  *Characteristics:* Fixed pitch, clear glyph distinction (0 vs O, 1 vs l vs I), optimized for code, tokens, data values, and metadata.

---

### 3.2 Font Weights
* `--font-weight-regular`: `400` (Standard body paragraphs, descriptions, secondary values)
* `--font-weight-medium`: `500` (Form inputs, button labels, table body cells, active tabs)
* `--font-weight-semibold`: `600` (Section headings, card titles, table headers, modal titles)
* `--font-weight-bold`: `700` (Primary page titles, display headings, prominent counters)
* `--font-weight-extrabold`: `800` (Hero display metrics, high-impact numbers)

---

### 3.3 Typographic Scale & Hierarchy Table

| Token | Size (rem / px) | Line Height | Letter Spacing (Tracking) | Weight | Semantic Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--text-display-2xl` | `4.00rem` (64px) | `1.10` | `-0.035em` | 800 / Bold | Hero metric / Top display element |
| `--text-display-xl` | `3.25rem` (52px) | `1.15` | `-0.030em` | 800 / Bold | Primary viewport focal heading |
| `--text-display-lg` | `2.50rem` (40px) | `1.20` | `-0.025em` | 700 / Bold | Major section title |
| `--text-h1` | `2.00rem` (32px) | `1.25` | `-0.020em` | 700 / Bold | Level 1 page/view heading |
| `--text-h2` | `1.50rem` (24px) | `1.30` | `-0.015em` | 600 / Semibold | Level 2 major container heading |
| `--text-h3` | `1.25rem` (20px) | `1.35` | `-0.010em` | 600 / Semibold | Level 3 card/module heading |
| `--text-h4` | `1.125rem` (18px)| `1.40` | `-0.005em` | 600 / Semibold | Level 4 sub-module heading |
| `--text-body-lead` | `1.125rem` (18px)| `1.55` | `0` | 400 / Regular | Introductory summary paragraph |
| `--text-body-base` | `1.00rem` (16px) | `1.50` | `0` | 400 / Regular | Standard default body text |
| `--text-body-small`| `0.875rem` (14px)| `1.45` | `+0.005em` | 400 / Regular | Dense body, field hints, secondary copy |
| `--text-label-md` | `0.875rem` (14px)| `1.25` | `+0.010em` | 500 / Medium | Interactive buttons, tabs, input labels |
| `--text-label-sm` | `0.75rem` (12px) | `1.20` | `+0.020em` | 600 / Semibold | Badges, pills, tags, category overlines |
| `--text-caption` | `0.75rem` (12px) | `1.40` | `+0.015em` | 400 / Regular | Timestamps, footnotes, muted annotations |
| `--text-micro` | `0.6875rem` (11px)| `1.35` | `+0.025em` | 500 / Medium | Very compact status tags, micro counters |
| `--text-code-sm` | `0.8125rem` (13px)| `1.50` | `0` | 400 / Regular | Inline code tokens, table data values |

---

### 3.4 Responsive Typographic Behavior
* **Fluid Clamp Formula (Display Typography):**  
  Top-level display headings adapt smoothly across viewports without abrupt breakpoint snapping:  
  `--text-display-xl-fluid: clamp(2.25rem, 1.75rem + 2.5vw, 3.25rem);`  
  `--text-h1-fluid: clamp(1.625rem, 1.35rem + 1.5vw, 2.00rem);`
* **Optical Hierarchy Principles:** Hierarchy is established through weight, surface contrast, and vertical rhythm rather than drastic font size jumps. A maximum scale ratio of 1:2.5 is maintained on mobile devices to preserve screen economy.
* **Prose Line Length Limit:** Maximum text container width for continuous reading blocks is locked to `68ch` (`max-width: 68ch;`) to ensure optimal reader scan retention.

---

## 4. Spacing System

### 4.1 Base Unit & Scale Architecture
The spacing system operates strictly on an **8px base grid** with a **4px half-step subdivision** for micro-alignments. Fractional pixels are prohibited.

---

### 4.2 Spacing Token Scale

| Token | Dimension (px) | Dimension (rem) | Primary Application |
| :--- | :--- | :--- | :--- |
| `--spacing-0` | `0px` | `0` | Reset / none |
| `--spacing-0-5` | `2px` | `0.125rem` | Sub-element micro offsets, border compensations |
| `--spacing-1` | `4px` | `0.25rem` | Micro padding, icon-to-text gap, badge inner space |
| `--spacing-1-5` | `6px` | `0.375rem` | Compact chip vertical padding, inner button inset |
| `--spacing-2` | `8px` | `0.50rem` | Input internal padding (compact), button horizontal gap |
| `--spacing-2-5` | `10px` | `0.625rem` | Medium button vertical inset, input field vertical space |
| `--spacing-3` | `12px` | `0.75rem` | Card internal compact padding, standard component gap |
| `--spacing-4` | `16px` | `1.00rem` | Standard card inner padding, standard form stack gap |
| `--spacing-5` | `20px` | `1.25rem` | Medium container padding, list item separation |
| `--spacing-6` | `24px` | `1.50rem` | Large card padding, panel margins, grid column gap |
| `--spacing-8` | `32px` | `2.00rem` | Section-level sub-grid gap, modal inner padding |
| `--spacing-10` | `40px` | `2.50rem` | Minor section vertical margins |
| `--spacing-12` | `48px` | `3.00rem` | Standard section vertical padding |
| `--spacing-16` | `64px` | `4.00rem` | Large section vertical spacing |
| `--spacing-20` | `80px` | `5.00rem` | Major architectural container separation |
| `--spacing-24` | `96px` | `6.00rem` | Viewport break margins (desktop) |
| `--spacing-32` | `128px` | `8.00rem` | Hero viewport boundary padding |

---

### 4.3 Semantic Layout Spacing Rules
* **Internal Component Padding:**
  * Compact button / chip: `padding: var(--spacing-1-5) var(--spacing-3);`
  * Standard interactive trigger: `padding: var(--spacing-2-5) var(--spacing-4);`
  * Large interactive trigger: `padding: var(--spacing-3) var(--spacing-6);`
  * Standard content card: `padding: var(--spacing-5);` (mobile: `--spacing-4`)
  * Modal dialog container: `padding: var(--spacing-6);` to `var(--spacing-8);`
* **Stack Spacing (Vertical Flow):**  
  Content stacks enforce uniform bottom flow via `gap: var(--spacing-4);` in flex columns or `margin-block-end: var(--spacing-4);`. Form fields maintain a strict `var(--spacing-5)` rhythm.
* **Section Rhythm:**  
  Standard section separation scales responsively: `var(--spacing-12)` on mobile up to `var(--spacing-20)` on desktop screens.

---

## 5. Layout System

### 5.1 Viewport Bounds
* **Minimum Viewport Width:** `320px` (Ensures zero horizontal clipping on small mobile viewports).
* **Default Maximum Content Container:** `1280px` (`max-width: 80rem;`).
* **Wide Content Container:** `1440px` (`max-width: 90rem;`).
* **Compact / Form Reading Container:** `768px` (`max-width: 48rem;`).
* **Prose Reading Container:** `68ch` (`max-width: 68ch;`).

---

### 5.2 Layout Margins & Gutters

| Viewport Tier | Breakpoint | Container Max-Width | Horizontal Page Gutter | Grid Columns | Grid Column Gap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Mobile Compact | `< 480px` | `100%` | `16px` (`--spacing-4`) | 4 | `12px` (`--spacing-3`) |
| Mobile Standard| `480px - 767px`| `100%` | `20px` (`--spacing-5`) | 4 | `16px` (`--spacing-4`) |
| Tablet | `768px - 1023px`| `720px` / `100%`| `24px` (`--spacing-6`) | 8 | `20px` (`--spacing-5`) |
| Desktop Standard | `1024px - 1279px`| `960px` - `1200px`| `32px` (`--spacing-8`) | 12 | `24px` (`--spacing-6`) |
| Desktop Wide | `1280px - 1535px`| `1280px` | `40px` (`--spacing-10`)| 12 | `32px` (`--spacing-8`) |
| Ultra-Wide | `>= 1536px`| `1440px` (Centered) | `auto` (Centered) | 12 | `32px` (`--spacing-8`) |

---

### 5.3 Structural Layout Archetypes
* **Full-Width Bleed Section:** Outer container spans `100vw`. Inner child container constrains content to `--layout-max-width` with symmetrical margins (`margin-inline: auto; padding-inline: var(--gutter);`).
* **Centered Card / Focus Layout:** Symmetrical single-axis container locked to `max-width: var(--layout-reading-width); margin: 0 auto;`.
* **Split Asymmetric Workspace (Sidebar / Main):**  
  * Sidebar width: Fixed `280px` to `320px` (or collapsible to `64px` icon rail).
  * Main stage: Flex `1 1 0%` with independent vertical overflow scrolling.
* **Two-Column Dual Stage (50/50):** Equal split grid (`grid-template-columns: repeat(2, minmax(0, 1fr));`) collapsing into single column on viewports `< 1024px`.
* **Three-Column Inspector Stage (20/55/25):** Left navigation (`240px`), Central focus stage (`1fr`), Right inspector panel (`320px`). Collapses gracefully on smaller viewports.

---

## 6. Responsive Design

### 6.1 Breakpoint Matrix

```css
/* Breakpoint Tokens */
--breakpoint-xs: 480px;   /* Small mobile landscape */
--breakpoint-sm: 640px;   /* Large mobile / small phablet */
--breakpoint-md: 768px;   /* Tablet portrait */
--breakpoint-lg: 1024px;  /* Tablet landscape / Laptop standard */
--breakpoint-xl: 1280px;  /* Desktop high-resolution */
--breakpoint-2xl: 1536px; /* Ultra-wide monitors */
```

---

### 6.2 Mobile-First Transformation Rules
* **Column Stacking:** Multi-column grids must default to `grid-template-columns: 1fr;` on mobile, advancing to multi-column only at `@media (min-width: 768px)` or `@media (min-width: 1024px)`.
* **Touch Target Invariants:** Any clickable or interactive trigger on touch viewports (`@media (pointer: coarse)`) must satisfy a minimum bounding box of **`44px x 44px`** (WCAG 2.5.5) or **`48px x 48px`** (optimal standard), regardless of visible visual padding.
* **Component Scaling:** Secondary badges, auxiliary metadata chips, and non-essential utility triggers collapse into overflow drawers or dropdown menus below `768px`.
* **Table Responsiveness:** Tables transform either into horizontally scrollable containers with masked gradient scroll hints, or into stacked card-row lists below `768px`.
* **Safe Area Conformance:** Layouts enforce physical hardware notch and home-indicator protection via `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, and `env(safe-area-inset-left/right)`.

---

## 7. Component Visual Language

*(Strictly Abstract Specifications: Visual treatment, geometry, states, and tokens only. Zero content.)*

---

### 7.1 Buttons

#### Primary Button
* **Geometry:** Height `40px` (Medium) / `32px` (Small) / `48px` (Large). Padding horizontal: `var(--spacing-4)`. Radius: `var(--radius-md)`.
* **Surface & Border:** Background: `var(--color-primary-base)`. Border: `1px solid transparent`.
* **Typography:** `var(--text-label-md)`, weight `500`, color `var(--color-text-inverse)`.
* **Elevation:** `var(--shadow-xs)`.
* **States:**
  * *Hover:* Background: `var(--color-primary-hover)`. Shadow: `var(--shadow-sm)`. Transform: `translateY(-1px)`.
  * *Active:* Background: `var(--color-primary-active)`. Shadow: `none`. Transform: `translateY(0) scale(0.98)`.
  * *Focus-Visible:* `outline: 2px solid var(--color-primary-base); outline-offset: 2px;`.
  * *Disabled:* Opacity `0.45`. Background: `var(--color-text-disabled)`. Pointer-events `none`. Cursor: `not-allowed`.

#### Secondary Button
* **Geometry:** Height matches Primary. Radius: `var(--radius-md)`.
* **Surface & Border:** Background: `var(--color-secondary-base)`. Border: `1px solid var(--color-border-default)`.
* **Typography:** `var(--text-label-md)`, weight `500`, color `var(--color-text-primary)`.
* **States:**
  * *Hover:* Background: `var(--color-secondary-hover)`. Border-color: `var(--color-border-hover)`.
  * *Active:* Background: `var(--color-secondary-active)`. Transform: `scale(0.98)`.
  * *Focus-Visible:* Standard focus ring.
  * *Disabled:* Opacity `0.45`. Border-color: `var(--color-border-subtle)`.

#### Tertiary / Ghost Button
* **Geometry:** Matches standard button height. Radius: `var(--radius-md)`.
* **Surface & Border:** Background: `transparent`. Border: `1px solid transparent`.
* **Typography:** `var(--text-label-md)`, color `var(--color-text-secondary)`.
* **States:**
  * *Hover:* Background: `var(--color-bg-subtle)`. Color: `var(--color-text-primary)`.
  * *Active:* Background: `var(--color-secondary-base)`.
  * *Focus-Visible:* Standard focus ring.

#### Destructive Button
* **Surface & Border:** Background: `var(--color-error-base)`. Border: `1px solid transparent`.
* **Typography:** `var(--text-label-md)`, color `var(--color-text-inverse)`.
* **States:** Hover background: darker red tier; Focus ring: destructive hue.

#### Icon-Only Button
* **Geometry:** Square aspect ratio (`1:1`). `36px x 36px` (Standard) or `32px x 32px` (Small). Center-aligned icon.
* **Surface & States:** Follows Tertiary / Ghost button rules unless declared as Primary or Secondary.

---

### 7.2 Cards & Containers

#### Base Content Card
* **Geometry:** Radius: `var(--radius-lg)`. Padding: `var(--spacing-5)`.
* **Surface & Border:** Background: `var(--color-surface-base)`. Border: `1px solid var(--color-border-subtle)`.
* **Elevation:** `var(--shadow-sm)`.
* **Typography Hierarchy:** Title uses `var(--text-h3)`, supporting copy uses `var(--text-body-small)`.

#### Interactive / Clickable Card
* **Transitions:** `transform var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)`.
* **Hover State:** Background: `var(--color-surface-elevated)`. Border-color: `var(--color-border-hover)`. Shadow: `var(--shadow-md)`. Transform: `translateY(-2px)`.
* **Active State:** Transform: `translateY(0) scale(0.99)`. Shadow: `var(--shadow-xs)`.

#### Inset / Sunken Well
* **Surface & Border:** Background: `var(--color-surface-sunken)`. Border: `1px solid var(--color-border-subtle)`. Radius: `var(--radius-md)`.
* **Elevation:** `var(--shadow-inner)` (subtle inset shadow).

---

### 7.3 Form Inputs & Text Fields

#### Single-Line Input & Text Area
* **Geometry:** Height: `40px` (Single-line). Radius: `var(--radius-md)`. Horizontal padding: `var(--spacing-3)`.
* **Text Area:** Minimum height `100px`. Vertical resize only (`resize: vertical;`). Padding: `var(--spacing-3)`.
* **Surface & Border:** Background: `var(--color-surface-base)`. Border: `1px solid var(--color-border-default)`.
* **Typography:** `var(--text-body-base)`, color `var(--color-text-primary)`.
* **Placeholder:** Color `var(--color-text-muted)`.
* **States:**
  * *Hover:* Border-color: `var(--color-border-hover)`.
  * *Focus:* Border-color: `var(--color-primary-base)`. Box-shadow: `0 0 0 3px var(--color-focus-ring)`. Outline: `none`.
  * *Invalid / Error:* Border-color: `var(--color-error-base)`. Box-shadow: `0 0 0 3px var(--color-error-subtle)`.
  * *Disabled:* Background: `var(--color-bg-subtle)`. Border-color: `var(--color-border-subtle)`. Color: `var(--color-text-disabled)`. Cursor: `not-allowed`.

#### Select Control (Dropdown Trigger)
* **Visuals:** Matches Single-Line Input geometry and styling, appended with a trailing chevron icon indicator (`16px x 16px`, color `var(--color-text-muted)`). Optical padding on trailing side: `var(--spacing-8)`.

---

### 7.4 Selection Controls

#### Checkbox
* **Geometry:** `18px x 18px` box. Radius: `var(--radius-xs)`.
* **Surface & Border:** Background: `var(--color-surface-base)`. Border: `1.5px solid var(--color-border-default)`.
* **Selected / Checked State:** Background: `var(--color-primary-base)`. Border-color: `var(--color-primary-base)`. Displays centered checkmark icon (`12px`, color `white`, stroke-width `2.5px`).
* **Focus State:** `box-shadow: 0 0 0 3px var(--color-focus-ring);`.

#### Radio Button
* **Geometry:** `18px x 18px` circle. Radius: `var(--radius-circle)` (`50%`).
* **Surface & Border:** Background: `var(--color-surface-base)`. Border: `1.5px solid var(--color-border-default)`.
* **Selected State:** Border-color: `var(--color-primary-base)`. Centered solid dot (`8px x 8px`, circle, color `var(--color-primary-base)`).
* **Focus State:** Standard focus ring.

#### Toggle Switch
* **Track Geometry:** Width `40px`, height `22px`. Radius: `var(--radius-full)`.
* **Track Surface:** Background: `var(--color-border-default)`. Transition: `background-color var(--duration-fast) var(--ease-standard)`.
* **Thumb Geometry:** Width `18px`, height `18px`. Radius: `var(--radius-circle)`. Background: `#FFFFFF`. Elevation: `var(--shadow-xs)`. Inset: `2px`.
* **Active / Checked State:** Track background: `var(--color-primary-base)`. Thumb translates horizontally: `translateX(18px)`.
* **Disabled State:** Opacity `0.45`. Cursor: `not-allowed`.

---

### 7.5 Navigation & Organization Controls

#### Tabs (Underline Variant)
* **Geometry:** Auto width, bottom border alignment. Padding: `var(--spacing-2) var(--spacing-4)`.
* **Inactive State:** Background: `transparent`. Border-bottom: `2px solid transparent`. Color: `var(--color-text-muted)`.
* **Hover State:** Color: `var(--color-text-primary)`.
* **Active State:** Color: `var(--color-primary-base)`. Border-bottom: `2px solid var(--color-primary-base)`. Font-weight: `500`.

#### Tabs (Segmented / Pill Variant)
* **Track Geometry:** Background: `var(--color-bg-subtle)`. Radius: `var(--radius-md)`. Padding: `3px`. Display: inline-flex.
* **Tab Item:** Radius: `var(--radius-sm)`. Padding: `var(--spacing-1-5) var(--spacing-3)`. Typography: `var(--text-label-md)`.
* **Active Tab Item:** Background: `var(--color-surface-base)`. Color: `var(--color-text-primary)`. Elevation: `var(--shadow-xs)`.

#### Pills & Chips
* **Geometry:** Height: `24px` (Small) / `30px` (Medium). Radius: `var(--radius-full)`. Padding: `0 var(--spacing-3)`.
* **Surface & Border:** Background: `var(--color-secondary-base)`. Border: `1px solid var(--color-border-subtle)`.
* **Typography:** `var(--text-label-sm)`.
* **Interactive State:** If interactive, hover shifts background to `var(--color-secondary-hover)` with `transform: translateY(-1px)`.

#### Badges & Status Indicators
* **Geometry:** Height: `20px`. Radius: `var(--radius-sm)`. Padding: `0 var(--spacing-1-5)`.
* **Semantic Tones:**
  * *Success:* Background: `var(--color-success-subtle)`. Text: `var(--color-success-base)`. Border: `1px solid var(--color-success-border)`.
  * *Warning:* Background: `var(--color-warning-subtle)`. Text: `var(--color-warning-base)`. Border: `1px solid var(--color-warning-border)`.
  * *Error:* Background: `var(--color-error-subtle)`. Text: `var(--color-error-base)`. Border: `1px solid var(--color-error-border)`.
  * *Info:* Background: `var(--color-info-subtle)`. Text: `var(--color-info-base)`. Border: `1px solid var(--color-info-border)`.

---

### 7.6 Overlays, Modals & Menus

#### Tooltip
* **Geometry:** Radius: `var(--radius-sm)`. Padding: `var(--spacing-1) var(--spacing-2)`. Max-width: `240px`.
* **Surface & Border:** Background: `var(--color-text-primary)`. Color: `var(--color-text-inverse)`. Border: `none`.
* **Elevation:** `var(--shadow-md)`.
* **Typography:** `var(--text-caption)`, font-weight `500`.

#### Dropdown / Popover Flyout
* **Geometry:** Radius: `var(--radius-lg)`. Padding: `var(--spacing-1-5)`. Min-width: `180px`.
* **Surface & Border:** Background: `var(--color-surface-overlay)`. Border: `1px solid var(--color-border-default)`.
* **Elevation:** `var(--shadow-lg)`.
* **Backdrop Blur:** `backdrop-filter: blur(12px);`.
* **Item States:** Item radius: `var(--radius-md)`. Padding: `var(--spacing-2) var(--spacing-3)`. Hover background: `var(--color-bg-subtle)`.

#### Modal / Dialog Window
* **Backdrop Scrim:** Background: `var(--color-overlay)`. Backdrop-filter: `blur(4px)`.
* **Window Geometry:** Radius: `var(--radius-xl)`. Width: `100%`. Max-width: `540px` (Medium) / `720px` (Large).
* **Surface & Border:** Background: `var(--color-surface-overlay)`. Border: `1px solid var(--color-border-default)`.
* **Elevation:** `var(--shadow-2xl)`.
* **Padding:** Header/Body/Footer spaced with `var(--spacing-6)`. Divider lines use `var(--color-border-subtle)`.

---

### 7.7 Feedback Containers

#### Inline Alert Banner
* **Geometry:** Radius: `var(--radius-md)`. Padding: `var(--spacing-3) var(--spacing-4)`. Border-left: `4px solid`.
* **Visual Styling:** Matches semantic badge colors (surface background, primary border accent, semantic text hue).
* **Icon Alignment:** Leading icon aligned with the first line of typography (`flex-shrink: 0; margin-top: 2px;`).

#### Toast / Floating Notification
* **Geometry:** Radius: `var(--radius-lg)`. Padding: `var(--spacing-3) var(--spacing-4)`. Width: `360px`.
* **Surface & Border:** Background: `var(--color-surface-overlay)`. Border: `1px solid var(--color-border-default)`.
* **Elevation:** `var(--shadow-xl)`.
* **Placement:** Bottom-right or top-right offset by `var(--spacing-6)`.

---

### 7.8 Data Presentation

#### Table
* **Structure:** `width: 100%; border-collapse: separate; border-spacing: 0;`.
* **Header Row (`th`):** Height `36px`. Background: `var(--color-bg-subtle)`. Typography: `var(--text-label-sm)`, weight `600`, color `var(--color-text-muted)`. Border-bottom: `1px solid var(--color-border-default)`. Text alignment: left.
* **Data Row (`td`):** Height `48px`. Padding: `var(--spacing-2) var(--spacing-4)`. Border-bottom: `1px solid var(--color-border-subtle)`. Typography: `var(--text-body-small)`.
* **Row States:** Hover background: `var(--color-bg-subtle)`. Selected background: `var(--color-primary-subtle)`.

#### Structured List
* **Geometry:** Stack of list items separated by `1px solid var(--color-border-subtle)`.
* **Item Row:** Padding: `var(--spacing-3) var(--spacing-4)`. Transition: `background-color var(--duration-fast)`.
* **Hover:** Background: `var(--color-bg-subtle)`.

---

### 7.9 Navigation Bars & Rails

#### Top Navigation Bar
* **Geometry:** Height: `60px`. Horizontal padding: `var(--spacing-6)`.
* **Surface & Border:** Background: `var(--color-surface-base)` with `opacity: 0.85; backdrop-filter: blur(12px);`. Border-bottom: `1px solid var(--color-border-subtle)`.
* **Elevation:** `var(--shadow-xs)` or flat boundary border.

#### Side Navigation Rail
* **Geometry:** Width: `260px` (Expanded) / `68px` (Collapsed). Full viewport height.
* **Surface & Border:** Background: `var(--color-surface-base)`. Border-right: `1px solid var(--color-border-subtle)`.
* **Nav Item:** Radius: `var(--radius-md)`. Padding: `var(--spacing-2) var(--spacing-3)`. Active item: Background `var(--color-primary-subtle)`, Color `var(--color-primary-base)`.

#### Breadcrumbs
* **Geometry:** Inline horizontal flex list. Separator slash or chevron (`14px x 14px`, color `var(--color-text-muted)`).
* **Typography:** `var(--text-body-small)`. Active item: Color `var(--color-text-primary)`, font-weight `500`.

---

### 7.10 Visual Media & Placeholder Objects

#### Avatar Container
* **Geometry:** Circles (`50%` radius) or soft rounded squares (`var(--radius-md)`).
* **Sizes:** `24px` (Micro), `32px` (Small), `40px` (Medium), `56px` (Large), `80px` (XL).
* **Surface & Border:** Background: `var(--color-secondary-base)`. Border: `1px solid var(--color-border-subtle)`. Center-aligned placeholder monogram or geometric silhouette.

#### Aspect Ratio Media Container
* **Ratios:** `16:9` (Video / Landscape), `4:3` (Standard Media), `1:1` (Square thumbnail), `2.39:1` (Panoramic Banner).
* **Surface & Corner:** Radius: `var(--radius-lg)`. Overflow: `hidden`. Background: `var(--color-surface-sunken)`. Border: `1px solid var(--color-border-subtle)`.

---

### 7.11 Loading & Empty States

#### Skeleton Loaders
* **Geometry:** Matching the exact height, width, and radius of target elements.
* **Surface:** Background: `var(--color-bg-subtle)`.
* **Shimmer Animation:** Linear horizontal gradient overlay (`rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.20)` in dark mode, inverted for light mode) translating infinitely over `1.5s`.

#### Spinner
* **Geometry:** Circular track ring (`20px x 20px` standard, `16px` inline). Border width: `2px`.
* **Track:** Border-color: `var(--color-border-subtle)`. Border-top-color: `var(--color-primary-base)`.
* **Animation:** Infinite 360-degree rotation over `0.65s` linear.

#### Empty State Viewport
* **Geometry:** Centered column container. Padding: `var(--spacing-12) var(--spacing-6)`. Border: `1.5px dashed var(--color-border-default)`. Radius: `var(--radius-xl)`.
* **Visual Anchor:** Central placeholder icon container (`48px x 48px`, radius `var(--radius-circle)`, background `var(--color-secondary-base)`).

---

## 8. Border Radius System

### 8.1 Geometric Scale

| Token | Dimension (px) | Application |
| :--- | :--- | :--- |
| `--radius-none` | `0px` | Sharp corners, edge-to-edge full width containers |
| `--radius-xs` | `2px` | Checkboxes, micro progress bars, indicator dots |
| `--radius-sm` | `4px` | Badges, tooltips, inline code blocks, inner tags |
| `--radius-md` | `8px` | Buttons, text inputs, dropdown triggers, segmented tabs |
| `--radius-lg` | `12px` | Standard cards, popovers, media containers |
| `--radius-xl` | `16px` | Large cards, modal dialogs, drawer panels |
| `--radius-2xl`| `24px` | Hero feature panels, floating action blocks |
| `--radius-full`| `9999px` | Pill buttons, filter chips, toggle tracks, status tags |
| `--radius-circle`| `50%` | Avatars, circular icon buttons, radio controls |

---

### 8.2 Radius Nesting Formula
To prevent optical disharmony and pinching when containers are nested inside other containers, inner radius must be derived mathematically:
$$\text{Radius}_{\text{inner}} = \max(0px, \text{Radius}_{\text{outer}} - \text{Padding})$$
*Example:* An outer card with `--radius-xl` (`16px`) and `padding: 12px` must contain an inner element with `--radius-xs` or `--radius-sm` (`16px - 12px = 4px`).

---

## 9. Shadow and Elevation System

### 9.1 Multi-Layer Shadow Architecture
Shadows consist of two simultaneous components:
1. **Ambient Occlusion:** Low-offset, wide-spread, low-opacity shadow simulating scattered environmental light.
2. **Directional Key Light:** Direct vertical offset shadow simulating overhead primary illumination.

---

### 9.2 Elevation Scale (Light Theme)

```css
/* Light Mode Multi-Stop Shadows */
--shadow-xs: 
  0 1px 2px 0 rgba(15, 23, 42, 0.05);

--shadow-sm: 
  0 1px 3px 0 rgba(15, 23, 42, 0.08), 
  0 1px 2px -1px rgba(15, 23, 42, 0.08);

--shadow-md: 
  0 4px 6px -1px rgba(15, 23, 42, 0.08), 
  0 2px 4px -2px rgba(15, 23, 42, 0.06);

--shadow-lg: 
  0 10px 15px -3px rgba(15, 23, 42, 0.08), 
  0 4px 6px -4px rgba(15, 23, 42, 0.04);

--shadow-xl: 
  0 20px 25px -5px rgba(15, 23, 42, 0.10), 
  0 8px 10px -6px rgba(15, 23, 42, 0.04);

--shadow-2xl: 
  0 25px 50px -12px rgba(15, 23, 42, 0.20);

--shadow-inner: 
  inset 0 2px 4px 0 rgba(15, 23, 42, 0.06);
```

---

### 9.3 Elevation Scale (Dark Theme)
In dark mode, physical dark shadows lose visibility against the canvas. Dark elevation relies on **ambient surface lightening**, **sub-pixel border luminescence**, and **subtle tinted glow**:

```css
/* Dark Mode Luminescent Shadows */
--shadow-xs: 
  0 1px 2px 0 rgba(0, 0, 0, 0.50),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.05);

--shadow-sm: 
  0 2px 4px 0 rgba(0, 0, 0, 0.40),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.08);

--shadow-md: 
  0 4px 8px -1px rgba(0, 0, 0, 0.55), 
  0 2px 4px -2px rgba(0, 0, 0, 0.45),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.10);

--shadow-lg: 
  0 12px 20px -4px rgba(0, 0, 0, 0.65), 
  0 4px 6px -2px rgba(0, 0, 0, 0.50),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.12);

--shadow-xl: 
  0 20px 30px -6px rgba(0, 0, 0, 0.75), 
  0 8px 12px -4px rgba(0, 0, 0, 0.60),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.14);

--shadow-2xl: 
  0 30px 60px -15px rgba(0, 0, 0, 0.85),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.16);
```

---

## 10. Borders and Dividers

### 10.1 Thickness Hierarchy
* `--border-width-hairline`: `1px` (All standard container borders, table dividers, input borders)
* `--border-width-emphasis`: `2px` (Active tabs, focus rings, selected card state borders)
* `--border-width-heavy`: `3px` or `4px` (Status alert callout edge stripes)

---

### 10.2 Border Application Matrix
* **Subtle Hairline:** Used for secondary separation within components where visual interruption must be minimal (`1px solid var(--color-border-subtle)`).
* **Structural Border:** Standard component outer boundary (`1px solid var(--color-border-default)`).
* **Interactive State Border:** Transitions dynamically on pointer hover (`1px solid var(--color-border-hover)`) and active focus (`2px solid var(--color-primary-base)`).
* **Dividers:** Full-width or inset dividers use `height: 1px; background: var(--color-border-subtle); border: none; margin: 0;`.

---

## 11. Surface and Background Treatment

### 11.1 Layering Architecture (Z-Surface Tiering)

```
[ Tier 5: Viewport Scrim / Overlay Modal ] -> var(--color-surface-overlay) + blur(12px)
[ Tier 4: Floating Popover / Dropdown Menu ] -> var(--color-surface-overlay) + shadow-lg
[ Tier 3: Elevated Card / Panel ]         -> var(--color-surface-elevated) + shadow-sm
[ Tier 2: Base Card / Surface Container ]  -> var(--color-surface-base) + 1px border
[ Tier 1: Inset Well / Sub-Surface ]       -> var(--color-surface-sunken)
[ Tier 0: Foundational Viewport Canvas ]   -> var(--color-bg-canvas)
```

---

### 11.2 Frosted Glass (Glassmorphism)
Where translucent depth is specified (sticky navigation bars, dropdown menus, modal backdrops):
* Light Mode: `background: rgba(255, 255, 255, 0.80); backdrop-filter: blur(12px) saturate(180%);`
* Dark Mode: `background: rgba(19, 27, 46, 0.75); backdrop-filter: blur(16px) saturate(190%);`
* Sub-pixel edge reinforcement: Always paired with `border: 1px solid var(--color-border-subtle);`.

---

### 11.3 Gradient & Texture Usage
* **Prohibited:** Heavy multi-hue saturated rainbow gradients, skeuomorphic bevels, or harsh radial vignettes.
* **Permitted:** Subtle linear surface shifts:
  * Light Mode: `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)` for card headers.
  * Dark Mode: `linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.00) 100%)` for elevated surface tops.

---

## 12. Iconography and Visual Assets

### 12.1 Icon Style & Construction
* **Style:** Pure geometric outline style. Solid/filled styles reserved strictly for active toggle indicators or critical alert icons.
* **Grid Base:** Designed on a native `24px x 24px` grid with a `2px` internal padding boundary.
* **Stroke Consistency:** Standard stroke width is locked to **`1.75px`** (or `2.0px` on high-contrast/bold settings). All icons within a view must share identical stroke weights.
* **Corner Geometry:** Rounded join and rounded cap (`stroke-linecap: round; stroke-linejoin: round;`).

---

### 12.2 Icon Sizing Tokens

| Token | Dimension (px) | Application |
| :--- | :--- | :--- |
| `--icon-xs` | `12px x 12px` | Micro status indicators, inline badge icons |
| `--icon-sm` | `16px x 16px` | Compact buttons, table action triggers, input adornments |
| `--icon-md` | `20px x 20px` | Standard button icons, form validation icons, tabs |
| `--icon-lg` | `24px x 24px` | Navigation menu items, major section headers |
| `--icon-xl` | `32px x 32px` | Feature highlight banners, empty state focal illustrations |

---

### 12.3 Optical Alignment & Color Inheritance
* **Color Binding:** Icons inherit typography color by default via `color: inherit; fill: none; stroke: currentColor;`.
* **Vertical Alignment:** Inline icons paired with typography are centered using flexbox (`display: inline-flex; align-items: center; gap: var(--spacing-2);`) rather than baseline shifting.

---

## 13. Interaction States

### 13.1 Comprehensive State Matrix

| State | Opacity | Transform Scale / Translate | Border Change | Surface Change | Shadow Change |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Default** | `1.0` | `none` | Default token | Default token | Default token |
| **Hover** | `1.0` | `translateY(-1px)` | Shifts to `--color-border-hover` | Shifts to hover token (+5% lightness/tint) | Advances to next shadow level |
| **Focus-Visible** | `1.0` | `none` | Shifts to primary | Ring: `2px solid var(--color-primary-base)` | `0 0 0 3px var(--color-focus-ring)` |
| **Active / Pressed** | `0.95` | `scale(0.98)` / `translateY(0)`| Retains hover/active border | Shifts to active token (+10% darker/tint) | Collapses to `--shadow-xs` / none |
| **Selected** | `1.0` | `none` | `--color-border-strong` | Active tint background | Retains current level |
| **Disabled** | `0.45` | `none` | `--color-border-subtle` | Inset muted background | `none` (Pointer events: none) |
| **Loading** | `0.70` | `none` | Retains current | Pulsing or spinner overlay | Retains current |
| **Success Feedback**| `1.0` | `none` | `--color-success-border` | `--color-success-subtle` | Focus ring with success hue |
| **Error Feedback** | `1.0` | Shake micro-keyframe | `--color-error-base` | `--color-error-subtle` | Focus ring with error hue |

---

## 14. Animation System

### 14.1 Animation Philosophy
Motion in this design system must be **functional, physics-grounded, subtle, and responsive**. Animation exists solely to provide spatial orientation, confirm direct manipulation, and signal state transitions. Bouncing, elastic overshoot, and decorative looping movements are strictly prohibited.

---

### 14.2 Duration Scale

```css
--duration-instant:   0ms;    /* Zero delay / Immediate state change */
--duration-fast:     120ms;   /* Micro-interactions: hover, press, toggle, focus */
--duration-normal:   200ms;   /* Small element transitions: dropdowns, tooltips, tabs */
--duration-moderate: 300ms;   /* Large surfaces: modals, drawers, card expansions */
--duration-slow:     450ms;   /* Page reveals, full stage view transitions */
--duration-deliberate: 600ms; /* Complex layout reflows, skeleton shimmers */
```

---

### 14.3 Easing Functions

```css
/* Standard: General elements moving between states on screen */
--ease-standard: cubic-bezier(0.2, 0.0, 0.0, 1.0);

/* Decelerate (Enter): Elements entering the viewport from off-screen or scaling up */
--ease-enter: cubic-bezier(0.0, 0.0, 0.2, 1.0);

/* Accelerate (Exit): Elements leaving the screen or fading out */
--ease-exit: cubic-bezier(0.4, 0.0, 1.0, 1.0);

/* Emphasized / Dynamic: Direct user manipulation, tabs, segmented sliders */
--ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1);
```

---

### 14.4 Standardized Transition Presets

* **Interactive Control Transitions:**  
  `transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard);`
* **Dropdown / Popover Entrance:**  
  *From:* `opacity: 0; transform: translateY(-6px) scale(0.98);`  
  *To:* `opacity: 1; transform: translateY(0) scale(1.0);`  
  *Timing:* `var(--duration-normal) var(--ease-enter)`
* **Modal Dialog Window Entrance:**  
  *From:* `opacity: 0; transform: scale(0.96) translateY(8px);`  
  *To:* `opacity: 1; transform: scale(1.0) translateY(0);`  
  *Timing:* `var(--duration-moderate) var(--ease-emphasized)`
* **Backdrop Fade Entrance:**  
  *From:* `opacity: 0;`  
  *To:* `opacity: 1;`  
  *Timing:* `var(--duration-moderate) var(--ease-standard)`
* **Drawer / Slide-Over Entrance:**  
  *From:* `transform: translateX(100%);`  
  *To:* `transform: translateX(0);`  
  *Timing:* `var(--duration-moderate) var(--ease-emphasized)`
* **Accordion / Collapsible Expansion:**  
  Transitions using CSS Grid interpolation:  
  `grid-template-rows: 0fr;` transitioning to `grid-template-rows: 1fr;` over `var(--duration-normal) var(--ease-standard)`.
* **Hardware Acceleration Mandate:**  
  Only animate `transform` and `opacity`. Animating `width`, `height`, `margin`, or `top/left` is prohibited during runtime interaction to prevent browser layout thrashing.

---

## 15. Hover and Micro-Interaction Language

### 15.1 Physicality Principles
Interactive components respond immediately to user presence through subtle physical translation and lighting adjustment:
* **Elevating Elements:** Cards, buttons, and floating chips lift toward the user upon pointer hover (`transform: translateY(-1px)` to `-2px`), matched by an elevation shadow expansion.
* **Compressing Elements:** Mouse clicks and tap presses trigger a subtle physical compression (`transform: scale(0.98)` or `scale(0.97)`), immediately signaling physical contact.
* **Illuminating Borders:** In dark mode, hovering an interactive card increases the border alpha from `rgba(255,255,255,0.14)` to `rgba(255,255,255,0.28)`.

---

## 16. Scroll and Viewport Animations

### 16.1 Scroll Reveal System
* **Trigger Threshold:** Elements trigger entrance when crossing **`15%`** into the visible viewport.
* **Maximum Spatial Displacement:** Entrance animations must not travel more than **`16px` to `24px`** along the Y-axis to prevent disorientation or perceived layout jumping.
* **Staggered Delays:** Child lists or multi-column grids apply a sequential stagger delay of **`50ms`** per index (capped at a maximum of `300ms` total sequence duration):
  * Child 1: `delay: 0ms`
  * Child 2: `delay: 50ms`
  * Child 3: `delay: 100ms`
  * Child 4: `delay: 150ms`

---

## 17. Reduced Motion

### 17.1 Accessibility Override Specification
For users who enable system-level reduced motion preferences (`prefers-reduced-motion: reduce`), the styling system automatically eliminates spatial displacement and reduces timing to zero:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Preserve essential opacity transitions for visual state comprehension */
  .fade-transition,
  [data-state="open"] {
    transition: opacity var(--duration-fast) linear !important;
    transform: none !important;
  }
}
```

### 17.2 Usability Preservation Without Motion
* Modals, flyouts, and dropdowns open and close instantaneously with zero spatial slide or scale.
* Loading spinners transition to a static pulsing dot, progress bar, or static text label.
* Multi-step wizard containers switch views immediately without sliding transitions.

---

## 18. Accessibility Visual Rules

### 18.1 Contrast Ratios (WCAG 2.1 / 2.2 AA & AAA Standards)
* **Standard Text:** Minimum contrast ratio of **`4.5:1`** against background canvas and surfaces (Achieved: all body tokens exceed `10:1` in light and `11:1` in dark).
* **Large Text (>= 24px regular or >= 18px bold):** Minimum contrast ratio of **`3.0:1`** (Achieved: all heading tokens exceed `7:1`).
* **UI Controls & Graphical Boundaries:** Minimum contrast ratio of **`3.0:1`** against adjacent surfaces for interactive boundaries and focus outlines.

---

### 18.2 Focus Indicator Architecture
* Focus indicators must NEVER be removed (`outline: none;` without replacement is strictly prohibited).
* Standard focus indicator:  
  `outline: 2px solid var(--color-primary-base); outline-offset: 2px;`
* Focus indicator must maintain at least `3.0:1` contrast against both the inner element surface and the outer surrounding canvas.
* Dual-tone focus ring (for complex dark/light boundaries):  
  `box-shadow: 0 0 0 2px var(--color-bg-canvas), 0 0 0 4px var(--color-primary-base);`

---

### 18.3 Multi-Sensory State Communication
* **Color Independence:** Visual states must never rely on color alone to communicate information.
* Every semantic state must combine color with at least one secondary visual identifier:
  * Error: Red border + Error icon glyph + Inset error text message.
  * Success: Green border + Checkmark icon glyph.
  * Active Tab: Highlight color + Bottom boundary line or distinct background pill.
  * Required Field: Visual asterisk or tag label + Explicit text hint.

---

### 18.4 Touch Targets
* All standalone touchable elements must provide a minimum clickable area of **`44px x 44px`**.
* If the visible visual asset is smaller (e.g., a `24px` icon button), an invisible pseudo-element (`::before` or `::after`) must expand the touch target to `44px x 44px`.

---

## 19. Visual Consistency Rules

### 19.1 Invariant Architectural Rules
1. **Zero Ad-Hoc Pixel Values:** No custom margins, paddings, hex colors, font sizes, or radii may be written inline. All values must resolve directly to tokens defined in this document.
2. **Radius Uniformity:** Elements within the same visual hierarchy tier must share identical radius tokens across the entire application (e.g., all primary action buttons use `--radius-md`).
3. **Consistent Vertical Rhythm:** Sibling components in a vertical layout flow must use identical stack spacing tokens (`--spacing-4` standard).
4. **Symmetrical Container Padding:** Card and container padding must remain uniform on all sides (`padding: var(--spacing-5);`), unless a distinct header/footer boundary divider is present.
5. **Icon-Typography Optical Balance:** Every icon placed inside an interactive button or input must match the optical weight and height of the accompanying typography.

---

## 20. Centralized Design Tokens (CSS Reference Block)

```css
:root {
  /* ==========================================================================
     COLOR TOKENS - LIGHT THEME (DEFAULT)
     ========================================================================== */
  --color-bg-canvas: #F8FAFC;
  --color-bg-subtle: #F1F5F9;
  --color-surface-base: #FFFFFF;
  --color-surface-elevated: #FFFFFF;
  --color-surface-overlay: #FFFFFF;
  --color-surface-sunken: #F1F5F9;

  --color-border-subtle: #E2E8F0;
  --color-border-default: #CBD5E1;
  --color-border-hover: #94A3B8;
  --color-border-strong: #64748B;

  --color-text-primary: #0F172A;
  --color-text-secondary: #334155;
  --color-text-muted: #64748B;
  --color-text-disabled: #94A3B8;
  --color-text-inverse: #FFFFFF;

  --color-primary-base: #4F46E5;
  --color-primary-hover: #4338CA;
  --color-primary-active: #3730A3;
  --color-primary-subtle: #EEF2FF;
  --color-primary-border: #C7D2FE;

  --color-secondary-base: #E2E8F0;
  --color-secondary-hover: #CBD5E1;
  --color-secondary-active: #94A3B8;

  --color-accent-base: #06B6D4;
  --color-accent-subtle: #ECFEFF;

  --color-success-base: #16A34A;
  --color-success-subtle: #F0FDF4;
  --color-success-border: #BBF7D0;

  --color-warning-base: #D97706;
  --color-warning-subtle: #FFFBEB;
  --color-warning-border: #FDE68A;

  --color-error-base: #DC2626;
  --color-error-subtle: #FEF2F2;
  --color-error-border: #FECACA;

  --color-info-base: #2563EB;
  --color-info-subtle: #EFF6FF;
  --color-info-border: #BFDBFE;

  --color-overlay: rgba(15, 23, 42, 0.45);
  --color-focus-ring: rgba(79, 70, 229, 0.40);

  /* ==========================================================================
     SHADOW TOKENS - LIGHT THEME
     ========================================================================== */
  --shadow-xs: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08);
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);
  --shadow-xl: 0 20px 25px -5px rgba(15, 23, 42, 0.10), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(15, 23, 42, 0.20);
  --shadow-inner: inset 0 2px 4px 0 rgba(15, 23, 42, 0.06);

  /* ==========================================================================
     TYPOGRAPHY TOKENS
     ========================================================================== */
  --font-family-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-display: "Plus Jakarta Sans", "Inter Display", -apple-system, sans-serif;
  --font-family-mono: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  --text-display-2xl: 4.00rem;
  --text-display-xl: 3.25rem;
  --text-display-lg: 2.50rem;
  --text-h1: 2.00rem;
  --text-h2: 1.50rem;
  --text-h3: 1.25rem;
  --text-h4: 1.125rem;
  --text-body-lead: 1.125rem;
  --text-body-base: 1.00rem;
  --text-body-small: 0.875rem;
  --text-label-md: 0.875rem;
  --text-label-sm: 0.75rem;
  --text-caption: 0.75rem;
  --text-micro: 0.6875rem;
  --text-code-sm: 0.8125rem;

  /* ==========================================================================
     SPACING TOKENS (8PX / 4PX SCALE)
     ========================================================================== */
  --spacing-0: 0px;
  --spacing-0-5: 2px;
  --spacing-1: 4px;
  --spacing-1-5: 6px;
  --spacing-2: 8px;
  --spacing-2-5: 10px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
  --spacing-32: 128px;

  /* ==========================================================================
     BORDER RADIUS TOKENS
     ========================================================================== */
  --radius-none: 0px;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  --radius-circle: 50%;

  /* ==========================================================================
     BORDER WIDTH TOKENS
     ========================================================================== */
  --border-width-hairline: 1px;
  --border-width-emphasis: 2px;
  --border-width-heavy: 4px;

  /* ==========================================================================
     LAYOUT & BREAKPOINT TOKENS
     ========================================================================== */
  --layout-min-width: 320px;
  --layout-reading-width: 68ch;
  --layout-compact-width: 768px;
  --layout-max-width: 1280px;
  --layout-wide-width: 1440px;

  --breakpoint-xs: 480px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* ==========================================================================
     ANIMATION & MOTION TOKENS
     ========================================================================== */
  --duration-instant: 0ms;
  --duration-fast: 120ms;
  --duration-normal: 200ms;
  --duration-moderate: 300ms;
  --duration-slow: 450ms;
  --duration-deliberate: 600ms;

  --ease-standard: cubic-bezier(0.2, 0.0, 0.0, 1.0);
  --ease-enter: cubic-bezier(0.0, 0.0, 0.2, 1.0);
  --ease-exit: cubic-bezier(0.4, 0.0, 1.0, 1.0);
  --ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1);

  /* ==========================================================================
     Z-INDEX SYSTEM
     ========================================================================== */
  --z-recessed: -1;
  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 500;
  --z-modal: 1000;
  --z-popover: 1100;
  --z-toast: 1200;
  --z-tooltip: 1300;
}

/* ==========================================================================
   COLOR TOKENS - DARK THEME OVERRIDES
   ========================================================================== */
[data-theme="dark"] {
  --color-bg-canvas: #090D16;
  --color-bg-subtle: #0E1424;
  --color-surface-base: #131B2E;
  --color-surface-elevated: #18223B;
  --color-surface-overlay: #1E2B4A;
  --color-surface-sunken: #0B101C;

  --color-border-subtle: rgba(255, 255, 255, 0.08);
  --color-border-default: rgba(255, 255, 255, 0.14);
  --color-border-hover: rgba(255, 255, 255, 0.26);
  --color-border-strong: rgba(255, 255, 255, 0.42);

  --color-text-primary: #F8FAFC;
  --color-text-secondary: #CBD5E1;
  --color-text-muted: #94A3B8;
  --color-text-disabled: #475569;
  --color-text-inverse: #090D16;

  --color-primary-base: #6366F1;
  --color-primary-hover: #818CF8;
  --color-primary-active: #4F46E5;
  --color-primary-subtle: rgba(99, 102, 241, 0.12);
  --color-primary-border: rgba(99, 102, 241, 0.35);

  --color-secondary-base: #1E293B;
  --color-secondary-hover: #334155;
  --color-secondary-active: #475569;

  --color-accent-base: #22D3EE;
  --color-accent-subtle: rgba(34, 211, 238, 0.10);

  --color-success-base: #4ADE80;
  --color-success-subtle: rgba(74, 222, 128, 0.12);
  --color-success-border: rgba(74, 222, 128, 0.30);

  --color-warning-base: #FBBF24;
  --color-warning-subtle: rgba(251, 191, 36, 0.12);
  --color-warning-border: rgba(251, 191, 36, 0.30);

  --color-error-base: #F87171;
  --color-error-subtle: rgba(248, 113, 113, 0.12);
  --color-error-border: rgba(248, 113, 113, 0.30);

  --color-info-base: #60A5FA;
  --color-info-subtle: rgba(96, 165, 250, 0.12);
  --color-info-border: rgba(96, 165, 250, 0.30);

  --color-overlay: rgba(2, 6, 14, 0.75);
  --color-focus-ring: rgba(99, 102, 241, 0.50);

  /* Shadows in Dark Mode with Subtle Border Illumination */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.50), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
  --shadow-sm: 0 2px 4px 0 rgba(0, 0, 0, 0.40), inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
  --shadow-md: 0 4px 8px -1px rgba(0, 0, 0, 0.55), 0 2px 4px -2px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.10);
  --shadow-lg: 0 12px 20px -4px rgba(0, 0, 0, 0.65), 0 4px 6px -2px rgba(0, 0, 0, 0.50), inset 0 1px 0 0 rgba(255, 255, 255, 0.12);
  --shadow-xl: 0 20px 30px -6px rgba(0, 0, 0, 0.75), 0 8px 12px -4px rgba(0, 0, 0, 0.60), inset 0 1px 0 0 rgba(255, 255, 255, 0.14);
  --shadow-2xl: 0 30px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 0 0 rgba(255, 255, 255, 0.16);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.60);
}
```

---

## 21. Implementation Guidance

### 21.1 Design Token Consumption Pattern
* **Rule 1: Direct Variable Mapping.** Styles must reference tokens using `var(--token-name)`. Never redeclare colors, spacing, or radius values as raw literals.
* **Rule 2: Semantic Consumption.** Use functional tokens rather than primitive scales. For example, assign `color: var(--color-text-primary);` rather than referencing a specific grey tone.
* **Rule 3: Utility / Framework Adaptation.** In frameworks such as TailwindCSS or CSS Modules, configure the design theme to point directly to these CSS variables (`colors: { surface: 'var(--color-surface-base)' }`), allowing instantaneous live theme switching.

---

### 21.2 Dark Mode Architecture
* Dark mode is activated by toggling the `data-theme="dark"` attribute on the root `<html>` or `<body>` element.
* No class duplication (e.g., `.dark-btn`, `.light-btn`) is permitted. Components automatically inherit updated values because the CSS variables are bound to the `[data-theme="dark"]` selector.
* Smooth theme transition: A global transition may be applied to colors during toggle:
  ```css
  html.theme-transitioning,
  html.theme-transitioning *,
  html.theme-transitioning *::before,
  html.theme-transitioning *::after {
    transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease !important;
  }
  ```

---

### 21.3 Component Inheritance & Encapsulation
* Standard components must inherit base typography, font smoothing, and color automatically:
  ```css
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    background-color: var(--color-bg-canvas);
    color: var(--color-text-secondary);
    font-family: var(--font-family-sans);
    font-size: var(--text-body-base);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  ```
* Form elements (`button`, `input`, `select`, `textarea`) must explicitly declare `font: inherit;` to prevent browser agent defaults from disrupting typography scales.

---

### 21.4 Preservation of Visual Quality Across Expansion
* When developing new pages, views, or components, verify compliance against the following checklist:
  1. Does every interactive state (hover, focus, active, disabled) have an explicit token-based visual change?
  2. Does the layout retain structure and legibility at `320px`, `768px`, and `1440px`?
  3. Are all shadows using the multi-stop elevation tokens rather than single-stop hard offsets?
  4. Does the component maintain WCAG AA contrast standards in both light and dark themes?
  5. Does the component respect `prefers-reduced-motion`?
