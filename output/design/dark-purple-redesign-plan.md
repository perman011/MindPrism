# Dark Purple Redesign Plan (Execution)

## Objective
Implement a full visual refresh for MindPrism with premium dark-purple branding, improved logo/wordmark presentation, and modern button system quality.

## Phase 1: Foundation Tokens (1-2 days)
1. Add V2 theme tokens in `client/src/index.css`.
2. Create semantic aliases (`--bg`, `--surface`, `--cta`, `--text-primary`).
3. Validate contrast and baseline accessibility.

## Phase 2: Logo + Header Pass (1 day)
1. Standardize logo lockup component for landing/dashboard.
2. Apply consistent spacing, typography, and contrast.
3. Remove inconsistent legacy wordmark styles.

## Phase 3: Button System V2 (1-2 days)
1. Define button variants (primary, secondary, ghost, destructive).
2. Standardize sizes, radii, loading states, and focus styles.
3. Update onboarding/dashboard CTA usage to a single visual hierarchy.

## Phase 4: Onboarding UI Refresh (2 days)
1. Implement polished 3-step onboarding shell.
2. Update tile states and sticky action area.
3. Add loading/error/success states with modern motion.

## Phase 5: Dashboard UI Refresh (2-3 days)
1. Reorder hierarchy: continue learning first.
2. Improve progress cards and recommendation rails.
3. Refine spacing, panel contrast, and interaction feedback.

## Phase 6: QA + Polish (1-2 days)
1. Responsive QA at 375/768/1024/1440.
2. Accessibility pass (contrast, keyboard, focus).
3. Performance check for animations and layout stability.

## Button Upgrade Checklist
- [ ] Clear primary action per section.
- [ ] Pill CTA style for high-priority actions.
- [ ] Consistent hover/active/focus behavior.
- [ ] Visible loading and disabled states.
- [ ] Touch-friendly target sizes.

## Acceptance Criteria
1. Dark-purple theme is consistent across onboarding and dashboard.
2. Logo/wordmark appears premium and legible in all key headers.
3. Button system feels modern and unified in behavior and style.
4. No regressions in responsiveness, readability, or accessibility.

## Risks and Mitigation
- Risk: token drift from hardcoded colors.
  - Mitigation: lint/search for legacy hex values and replace with tokens.
- Risk: over-stylized visuals reduce clarity.
  - Mitigation: enforce content-first layout and AA contrast checks.
- Risk: interaction inconsistency across pages.
  - Mitigation: centralize shared button/header components.
