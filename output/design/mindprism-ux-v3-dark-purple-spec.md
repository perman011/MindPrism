# MindPrism UX Spec V3

## Scope
Competitor-inspired dark-purple redesign for onboarding + dashboard with explicit media reliability and brand fixes.

## Brand Direction
1. Logo icon: transparent pen mark only, no black tile background.
2. Wordmark: `mindprism` (all lowercase) next to icon.
3. Scale: icon >= 40px on dashboard header; wordmark >= 18px.
4. Adaptive visibility:
- Light mode: high-contrast dark text.
- Dark mode: brighter wordmark and icon brightness boost.

## Competitor Pattern Inputs
1. Headway/Blinkist: calm content-first onboarding with clear CTA hierarchy.
2. Linear: crisp control density, clean cards, high-contrast chips.
3. Notion: restrained surfaces and spacing rhythm.

## Palette (Dark-Purple Core)
- `--bg-950: #0A0612`
- `--bg-900: #120A1F`
- `--surface-800: #1D1030`
- `--surface-700: #291746`
- `--primary-500: #7C3AED`
- `--primary-400: #8B5CF6`
- `--text-100: #F5F3FF`
- `--text-300: #DDD6FE`

## Onboarding UX
1. Step 1: value proposition + `Get Started` primary CTA.
2. Step 2: interest selection (min 3), selectable chips with strong selected contrast.
3. Step 3: personalized preview + submit.
4. Persistent in-progress state across refresh.

## Dashboard UX
1. Header: transparent icon + lowercase `mindprism`, streak pill, avatar.
2. Toggle: Chakra / Shorts pill switch with active purple fill.
3. Quick Bites: render thumbnail if valid; fallback to gradient card if invalid.
4. Jump Back In: render cover if valid; fallback initial-based card if invalid.
5. Shorts mode: preview thumbnail/image media when valid.

## Button System
1. `primary`: filled purple.
2. `secondary`: low-emphasis surface.
3. `ghost`: text-first action.
4. Loading/disabled/focus states mandatory.

## Media Rendering Rules
1. Accept only browser-renderable image/video formats.
2. Treat malformed URLs as missing media.
3. Any failed image load must degrade to visual fallback, not broken icon.
4. Video playback must support HTTP byte ranges.

## Accessibility
1. WCAG AA text contrast.
2. Keyboard-navigable controls.
3. `prefers-reduced-motion` respected.
