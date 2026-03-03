# Feature + Flow Spec V2: Onboarding + Dashboard

## Scope
- In scope: landing visual refresh, onboarding (`/onboarding`), dashboard (`/`).
- Out of scope: admin portal redesign.

## Success Criteria
- Onboarding completion +12%.
- Continue-learning CTA click-through +20%.
- Higher visual consistency score in design QA.

## 1) Onboarding Redesign

### 1.1 Flow
1. Welcome + value statement
2. Interest selection
3. Personalized preview and continue

### 1.2 UI Behavior
- Sticky bottom primary CTA on mobile.
- Progress bar with 3 discrete steps.
- Interest tiles with elevated selected state and clear checkmark.
- Preserve selections on refresh.

### 1.3 States
- Empty: disabled CTA + guidance.
- Loading: skeletons.
- Error: inline retry action.
- Success: transition into dashboard.

## 2) Dashboard Redesign

### 2.1 Layout Hierarchy
1. Header: logo, greeting, streak, profile.
2. Primary action strip: Continue Learning / Discover Shorts.
3. Progress card.
4. Personalized rails.
5. Vault/utility modules.

### 2.2 Desktop Behavior
- Two-column at `lg+`:
  - Left: content feed.
  - Right: compact progress and milestones.

### 2.3 Interaction
- Rail cards reveal with 30-40ms stagger.
- Button press micro-animation <=100ms.
- Toggle transitions 120-160ms.

## 3) Button System V2

### Variants
1. Primary
- Fill: `#7C3AED`
- Text: `#F5F3FF`
- Use: one per section max

2. Secondary
- Fill: `#291746`
- Border: `#3A235D`
- Text: `#DDD6FE`

3. Ghost
- Transparent surface
- Text: `#DDD6FE`
- Hover: subtle purple wash

4. Destructive
- Fill: `#FB7185`
- Text: `#1A1028`

### Shape + Motion
- Radius: pill for main CTA, 14px for standard action buttons.
- Height: 48px mobile, 44px compact contexts.
- States: default / hover / active / disabled / loading.
- Focus ring: 2px accent halo, always visible with keyboard nav.

## 4) Accessibility
- Contrast minimum AA.
- 44px target size.
- Keyboard reach for all actions.
- Motion respects reduced-motion preferences.

## 5) Engineering Notes
1. Replace hardcoded color values with new dark-purple tokens.
2. Introduce shared button tokens and variant classes.
3. Update header logo lockup in landing and dashboard.
4. Keep one primary CTA visual priority per viewport section.
