# MindPrism UI Design System & Visual Guide

**Product:** MindPrism — Psychology Made Simple
**Category:** Mental Health / Self-Help / Education App
**Audience:** Adults seeking personal growth and psychological understanding
**Last Updated:** 2026-02-28
**Prepared by:** UI/UX Design Agent

---

## Design Philosophy

MindPrism sits at the intersection of **mental health**, **education**, and **wellness**. The design must feel:
- **Calming** — not clinical, not chaotic. Users come to learn and reflect
- **Trustworthy** — psychology content demands credibility
- **Warm** — self-help is personal; the interface should feel like a supportive companion
- **Accessible** — clear hierarchy, readable text, high contrast

The recommended style is **Soft UI / Neumorphic Light** combined with **Minimalism** — soft rounded cards, subtle depth, warm tones, and generous white space. This matches the "Mental Health App" archetype from design research: calming aesthetics, privacy-first, progress tracking, accessibility mandatory.

---

## Color System

### Current Palette (Dream Curtain)

| Token | Value | HSL | Usage |
|-------|-------|-----|-------|
| Primary | `#341539` | 292 46% 15% | Buttons, active states, brand accent |
| Background | `#F5F0EB` | 30 28% 94% | Page background (cream) |
| Card | `#FFFFFF` | 0 0% 100% | Card surfaces |
| Foreground | `#111827` | 220 26% 12% | Primary text |
| Muted Foreground | `#6B7280` | 220 9% 46% | Secondary text, labels |
| Border | `#E5E7EB` | 220 13% 91% | Card borders, dividers |
| Light Accent | `#F0E8F0` | 300 20% 93% | Hover backgrounds, subtle tints |

### Recommended Enhancement: Extended Palette

The current Dream Curtain (#341539) is very dark — almost black with a purple tint. While distinctive, it limits the visual range. Here is a recommended expanded palette that keeps Dream Curtain as the anchor but adds warmth, depth, and functional variety:

#### Option A: "Warm Prism" (Recommended)
Best for: Psychology/wellness apps. Warm, approachable, calming.

| Role | Color | Hex | HSL | Notes |
|------|-------|-----|-----|-------|
| **Primary** | Dream Curtain | `#341539` | 292 46% 15% | Keep as brand anchor |
| **Primary Light** | Soft Plum | `#6B3A6E` | 298 30% 33% | Hover states, secondary buttons |
| **Primary Lighter** | Lavender Mist | `#D4B8D6` | 298 28% 78% | Tags, badges, subtle highlights |
| **Primary Surface** | Petal Blush | `#F5EEF5` | 300 25% 95% | Card hover, active tab bg |
| **Background** | Warm Cream | `#F8F4F0` | 30 33% 96% | Page background |
| **Card** | Pure White | `#FFFFFF` | 0 0% 100% | Card surfaces |
| **Success** | Sage Green | `#4CAF7D` | 150 40% 49% | Completed states, streaks |
| **Warning** | Warm Amber | `#E8A838` | 38 78% 56% | Streak risk, attention |
| **Error** | Soft Coral | `#E85D5D` | 0 75% 64% | Destructive actions |
| **Accent 1** | Teal Calm | `#3D8B8B` | 180 39% 39% | Chakra accents, info states |
| **Accent 2** | Dusty Gold | `#C4A35A` | 42 46% 56% | Premium badges, achievements |
| **Foreground** | Deep Charcoal | `#1A1A2E` | 240 28% 14% | Primary text |
| **Muted** | Warm Gray | `#8E8E9A` | 240 5% 58% | Secondary text |
| **Border** | Soft Lavender | `#E8E0E8` | 300 14% 90% | Card borders |

**CSS Variables:**
```css
:root {
  --primary: 292 46% 15%;
  --primary-light: 298 30% 33%;
  --primary-lighter: 298 28% 78%;
  --primary-surface: 300 25% 95%;
  --background: 30 33% 96%;
  --card: 0 0% 100%;
  --success: 150 40% 49%;
  --warning: 38 78% 56%;
  --destructive: 0 75% 64%;
  --accent-teal: 180 39% 39%;
  --accent-gold: 42 46% 56%;
  --foreground: 240 28% 14%;
  --muted-foreground: 240 5% 58%;
  --border: 300 14% 90%;
}
```

#### Option B: "Calm Lavender"
Best for: Meditation/mindfulness focus. Cooler, more serene.

| Role | Color | Hex |
|------|-------|-----|
| Primary | Violet Dusk | `#5B3A7D` |
| Primary Light | Wisteria | `#8B6BAE` |
| Background | Cool Cream | `#F5F3F8` |
| Success | Mint | `#48B89F` |
| Accent | Dusty Rose | `#C98DA7` |
| Foreground | Midnight | `#1E1B2E` |

#### Option C: "Earth Wisdom"
Best for: Grounding, intellectual, book-focused. Natural tones.

| Role | Color | Hex |
|------|-------|-----|
| Primary | Forest Plum | `#4A2040` |
| Primary Light | Rosewood | `#7D4565` |
| Background | Parchment | `#F5F0E6` |
| Success | Olive | `#6B8E4E` |
| Accent | Terracotta | `#C47A5A` |
| Foreground | Dark Espresso | `#2D1F1F` |

---

## Typography

### Current: Inter Only (400-700)
Clean, neutral, highly readable. Good for data-heavy dashboards and stats.

### Recommended Upgrade Options

#### Option 1: "Classic Elegant" (Best for MindPrism)
**Heading:** Playfair Display (serif) — elegant, literary, premium feel
**Body:** Inter (sans-serif) — clean, readable, functional

This pairing creates a "refined bookshelf" feeling. Playfair Display for book titles, page headings, and hero text gives MindPrism intellectual gravitas. Inter handles UI, stats, labels, and body text.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
```

**Usage:**
- `font-serif` (Playfair): Page titles, book titles, hero headings, quote cards
- `font-sans` (Inter): Body text, labels, buttons, stats, navigation

#### Option 2: "Soft Rounded"
**Heading:** Varela Round — friendly, approachable, warm
**Body:** Nunito Sans — rounded, gentle, good readability

Best if MindPrism leans more "friendly self-help app" than "premium psychology tool."

#### Option 3: "Editorial"
**Heading:** Newsreader (serif) — designed for long-form, trustworthy
**Body:** DM Sans — clean, modern, geometric

Best if MindPrism emphasizes deep reading and content authority.

---

## Component Design Tokens

### Cards
```
Border Radius: 16px (rounded-2xl)
Padding: 16px (p-4)
Background: var(--card) / white
Border: 1px solid var(--border)
Shadow: 0 1px 3px rgba(0,0,0,0.06)
Hover Shadow: 0 4px 12px rgba(52,21,57,0.08)
Transition: shadow 200ms ease-out
```

### Buttons
| Variant | Height | Radius | Background | Text |
|---------|--------|--------|------------|------|
| Primary | 48px | Full (pill) | var(--primary) | White |
| Secondary | 44px | 12px | var(--primary-surface) | var(--primary) |
| Outline | 44px | 12px | Transparent | var(--foreground) |
| Ghost | 44px | 12px | Transparent | var(--muted-foreground) |
| Destructive | 44px | 12px | var(--destructive) | White |

### Inputs
```
Height: 48px (h-12)
Border Radius: 10px (rounded-[10px])
Border: 1px solid var(--border)
Focus Ring: 2px solid var(--primary)
Placeholder: var(--muted-foreground)
```

### Spacing System (8px Grid)
```
4px  — tight (icon gaps)
8px  — compact (between related elements)
12px — default (between cards in grid)
16px — comfortable (section padding)
24px — spacious (between sections)
32px — large (between page sections)
48px — extra-large (hero spacing)
```

---

## Chart & Data Visualization Palette

For the Growth Vault, analytics, and progress tracking:

| Index | Color | Hex | Usage |
|-------|-------|-----|-------|
| Chart 1 | Dream Curtain | `#341539` | Primary metric |
| Chart 2 | Soft Plum | `#6B3A6E` | Secondary metric |
| Chart 3 | Sage Green | `#4CAF7D` | Completions, success |
| Chart 4 | Teal Calm | `#3D8B8B` | Time-based metrics |
| Chart 5 | Warm Amber | `#E8A838` | Streaks, milestones |
| Chart 6 | Dusty Gold | `#C4A35A` | Premium/achievement |
| Inactive | Soft Gray | `#E5E0E5` | Empty/zero states |

**Heatmap gradient (30-day chart):**
```
No activity:  #E8E0E8 (lavender gray)
Low:          hsla(292, 46%, 15%, 0.25)
Medium:       hsla(292, 46%, 15%, 0.55)
High:         hsla(292, 46%, 15%, 0.80)
Max:          #341539 (full Dream Curtain)
```

---

## Animation Guidelines

### Principles
1. **Purposeful** — animations guide attention, not distract
2. **Fast** — 150-200ms for micro-interactions, 300ms for page transitions
3. **Ease-out** — elements settle naturally into place
4. **Respect preferences** — honor `prefers-reduced-motion`

### Standard Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Fade-in | 200ms | ease-out | Page load, tab switch |
| Slide-up | 200ms | ease-out | Cards, lists appearing |
| Scale-in | 150ms | ease-out | Badges, tooltips |
| Press | 100ms | ease-in-out | Button active state |
| Stagger | 60ms delay | — | List items, stat cards |

### Framer Motion Presets
```tsx
const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" }
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.06 } }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.15, ease: "easeOut" }
};
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark Mode

### Color Mapping

| Token | Light | Dark |
|-------|-------|------|
| Background | `#F8F4F0` | `#0F0A14` |
| Card | `#FFFFFF` | `#1A1225` |
| Card Hover | `#F5EEF5` | `#241830` |
| Foreground | `#1A1A2E` | `#F0ECF0` |
| Muted Foreground | `#8E8E9A` | `#9A8EA0` |
| Border | `#E8E0E8` | `#2A1E35` |
| Primary | `#341539` | `#D4B8D6` |
| Primary Foreground | `#FFFFFF` | `#0F0A14` |

**Key rules:**
- In dark mode, the primary color inverts: use Lavender Mist (`#D4B8D6`) as the accent instead of Dream Curtain (too dark against dark bg)
- Cards get a dark purple-tinted surface, not pure gray
- Borders use very subtle purple tint, not pure gray
- Inactive heatmap squares: `#2A1E35` (dark plum)

---

## Iconography

- **Library:** Lucide React (already in use)
- **Size system:** 16px (inline), 20px (card icons), 24px (nav), 32px (empty states)
- **Style:** 1.5px stroke, rounded joins
- **Color:** Inherits from parent text color; icons in circles use `bg-primary/10 text-primary`

---

## Layout Patterns

### Mobile-First Breakpoints
```
sm:  640px   (small tablets)
md:  768px   (tablets, 2-column trigger)
lg:  1024px  (desktop)
xl:  1280px  (wide desktop)
```

### Page Structure
```
┌─────────────────────────────┐
│  Page Header (px-5 pt-8)    │
├─────────────────────────────┤
│  Hero / Summary Section     │
├─────────────────────────────┤
│  Content Grid               │
│  ┌───────────┬─────────┐    │
│  │ Main      │ Sidebar │    │ ← md+ only
│  │ (col-3)   │ (col-2) │    │
│  └───────────┴─────────┘    │
├─────────────────────────────┤
│  Bottom Nav (fixed)         │
└─────────────────────────────┘
```

### Card Grid Patterns
```
Book cards:    grid-cols-2 gap-3     (mobile) → grid-cols-3 gap-4 (desktop)
Stat cards:    grid-cols-3 gap-3     (all breakpoints)
Detail cards:  grid-cols-2 gap-3     (mobile) → grid-cols-4 gap-4 (desktop)
Journal feed:  single column         (all breakpoints)
```

---

## Elevation System

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | None | Flat elements, inline items |
| 1 | `0 1px 3px rgba(0,0,0,0.06)` | Cards at rest |
| 2 | `0 4px 12px rgba(52,21,57,0.08)` | Cards on hover, active tabs |
| 3 | `0 8px 24px rgba(52,21,57,0.12)` | Modals, drawers, bottom sheets |
| 4 | `0 12px 40px rgba(52,21,57,0.16)` | Floating action buttons |

---

## Anti-Patterns (Do NOT)

1. **No emoji icons** — use Lucide React SVG icons only
2. **No blue (#3B82F6)** — fully replaced by Dream Curtain (#341539)
3. **No Inter alternatives** — keep Inter as the primary sans-serif font
4. **No pure black text** — use Deep Charcoal (#1A1A2E) for softer contrast
5. **No harsh borders** — use Soft Lavender (#E8E0E8) with 1px
6. **No layout-shifting hover** — use color/opacity transitions, not scale transforms
7. **No gradients on buttons** — solid Dream Curtain for primary, outline for secondary
8. **No low-contrast placeholder text** — minimum 4.5:1 ratio
9. **No auto-playing animations** — respect `prefers-reduced-motion`
10. **No inconsistent radius** — cards 16px, buttons pill/12px, inputs 10px
