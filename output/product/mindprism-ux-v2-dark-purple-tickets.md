# Delivery Backlog: MindPrism UX V2 Dark Purple

## Epic A: Theme and Token Foundation

### UXV2-001: Add V2 dark-purple semantic tokens
- Type: Task
- Context: Need centralized tokens for consistent branding.
- Scope: Update `client/src/index.css` with V2 palette + semantic aliases.
- Acceptance Criteria:
1. Token set includes bg/surface/primary/text/success/warning/danger values from UX spec.
2. No direct page-level dependency on legacy hardcoded purple values.
3. Theme compiles and renders without CSS errors.
- Technical Notes: Keep legacy fallback tokens for rollback window.
- Dependencies: None
- Estimate: 0.5d
- Validation: Unit N/A; Integration style smoke; E2E visual smoke

### UXV2-002: Map Tailwind color aliases to V2 token semantics
- Type: Task
- Context: Components rely on Tailwind semantic classes.
- Scope: Update Tailwind mappings and ensure token-backed utility usage.
- Acceptance Criteria:
1. Core semantic classes resolve to V2 token values.
2. No broken classes in onboarding/dashboard/landing.
3. Build and type checks pass.
- Technical Notes: Validate dark mode class behavior.
- Dependencies: UXV2-001
- Estimate: 0.5d
- Validation: Unit N/A; Integration compile + UI spot check; E2E page load

### UXV2-003: Implement typography stack updates
- Type: Story
- Context: UX V2 requires display/body/utility typography hierarchy.
- Scope: Add font loading and apply stack usage conventions.
- Acceptance Criteria:
1. Display and body typography classes are available and documented.
2. Fallback stacks render without layout break.
3. Headers and body copy visibly differentiate at key screens.
- Technical Notes: Avoid blocking render on font load.
- Dependencies: UXV2-001
- Estimate: 0.5d
- Validation: Unit style helper tests; Integration visual check; E2E render snapshots

### UXV2-004: Replace hardcoded onboarding/dashboard color literals with tokens
- Type: Task
- Context: Current screens contain hardcoded color literals.
- Scope: Refactor onboarding/dashboard/landing files to use semantic classes/tokens.
- Acceptance Criteria:
1. `rg` scan confirms no targeted legacy literals remain in redesigned screens.
2. UI parity maintained with V2 direction.
3. No accessibility contrast regressions introduced.
- Technical Notes: Keep non-target pages untouched.
- Dependencies: UXV2-001, UXV2-002
- Estimate: 1d
- Validation: Unit N/A; Integration manual pass; E2E screenshot diff

## Epic B: Shared Logo and Button System V2

### UXV2-005: Create reusable `LogoLockup` component
- Type: Story
- Context: Logo usage is inconsistent across screens.
- Scope: Build compact and hero variants with safe spacing and contrast defaults.
- Acceptance Criteria:
1. Component supports `compact` and `hero` variants.
2. Wordmark uses approved color and typography.
3. At least landing and dashboard consume component.
- Technical Notes: Use existing logo asset, no asset replacement in this ticket.
- Dependencies: UXV2-003
- Estimate: 0.75d
- Validation: Unit component render tests; Integration pages pass; E2E header checks

### UXV2-006: Migrate onboarding and landing headers to `LogoLockup`
- Type: Task
- Context: Old header implementations drift from spec.
- Scope: Replace direct logo/text composition in landing/onboarding.
- Acceptance Criteria:
1. Both pages use shared component.
2. Spacing and contrast match V2 guidelines.
3. No layout regressions on 375px and 1024px widths.
- Technical Notes: Preserve data-testid coverage.
- Dependencies: UXV2-005
- Estimate: 0.5d
- Validation: Unit N/A; Integration responsive check; E2E header visibility

### UXV2-007: Build Button V2 variants in shared button primitive
- Type: Story
- Context: Button behavior and style are not fully standardized.
- Scope: Add `primary`, `secondary`, `ghost`, `destructive`, sizes, loading, focus.
- Acceptance Criteria:
1. All four variants render with defined states.
2. Disabled and loading states are visually and functionally correct.
3. Keyboard focus ring is visible and AA-compliant.
- Technical Notes: Keep API backward-compatible where feasible.
- Dependencies: UXV2-001, UXV2-002
- Estimate: 1d
- Validation: Unit variant tests; Integration story/demo check; E2E keyboard tab test

### UXV2-008: Migrate critical CTAs to Button V2
- Type: Task
- Context: Core conversion actions must use new hierarchy.
- Scope: Update landing/onboarding/dashboard critical actions to V2 variants.
- Acceptance Criteria:
1. Exactly one primary CTA per major section.
2. Secondary and ghost buttons follow hierarchy.
3. Existing click behavior unchanged.
- Technical Notes: Keep tracking identifiers stable.
- Dependencies: UXV2-007
- Estimate: 0.75d
- Validation: Unit N/A; Integration action smoke; E2E CTA flow checks

## Epic C: Onboarding V2 Flow

### UXV2-009: Implement 3-step onboarding shell and progress tracker
- Type: Story
- Context: Current onboarding is single-step.
- Scope: Build step container with progress indicator and next/back navigation.
- Acceptance Criteria:
1. Step 1/2/3 flow works with deterministic navigation.
2. Progress indicator updates correctly.
3. Step shell is mobile-first and sticky CTA compatible.
- Technical Notes: Use isolated state machine or reducer.
- Dependencies: UXV2-004, UXV2-008
- Estimate: 1d
- Validation: Unit step reducer tests; Integration nav flow; E2E step traversal

### UXV2-010: Build Step 1 (Welcome + value statement)
- Type: Task
- Context: Need clear framing before interest collection.
- Scope: Add concise value messaging screen with primary CTA.
- Acceptance Criteria:
1. Step 1 content renders with approved hierarchy.
2. CTA advances to Step 2.
3. Analytics event `onboarding_step_viewed` fires for step1.
- Technical Notes: Keep copy in constants for iteration.
- Dependencies: UXV2-009
- Estimate: 0.5d
- Validation: Unit event helper test; Integration click path; E2E event smoke

### UXV2-011: Upgrade Step 2 interest selection interactions
- Type: Story
- Context: Interest selection requires V2 visuals and validation.
- Scope: Refine tile states, require min 3 selections, preserve selected state on refresh.
- Acceptance Criteria:
1. Selecting/deselecting tiles updates count and CTA enablement.
2. Refresh restores in-progress selection state.
3. Event `onboarding_interest_selected` is emitted on interaction.
- Technical Notes: Persist ephemeral state in session/local storage.
- Dependencies: UXV2-009
- Estimate: 1d
- Validation: Unit selection logic tests; Integration persistence check; E2E select/refresh path

### UXV2-012: Build Step 3 preview and submit flow
- Type: Story
- Context: Onboarding must end with confidence and explicit submission.
- Scope: Preview selected interests, submit to `/api/interests`, then route to dashboard.
- Acceptance Criteria:
1. Existing API contract is reused without schema changes.
2. Submission success routes to dashboard.
3. Failure path preserves user selections and shows retry UI.
- Technical Notes: Emit `onboarding_completed` on success.
- Dependencies: UXV2-009, UXV2-011
- Estimate: 1d
- Validation: Unit submit handler tests; Integration API mock test; E2E completion path

## Epic D: Dashboard V2 Structure

### UXV2-013: Introduce dashboard data adapter (client or aggregated API)
- Type: Spike
- Context: Current dashboard issues multiple parallel queries and can feel fragmented.
- Scope: Decide and implement adapter pattern for coherent block loading.
- Acceptance Criteria:
1. Adapter returns typed payload for key dashboard blocks.
2. Loading and error states can be controlled per block.
3. Decision documented (aggregated API vs client adapter).
- Technical Notes: Prefer backward-compatible approach for initial rollout.
- Dependencies: None
- Estimate: 1d
- Validation: Unit adapter tests; Integration data fetch smoke; E2E dashboard load

### UXV2-014: Implement "Continue Learning" hero block
- Type: Story
- Context: Resume action should be top-priority.
- Scope: Add prominent continue block above recommendation rails.
- Acceptance Criteria:
1. Block appears first under header when resume data exists.
2. CTA opens expected continuation target.
3. Event `dashboard_continue_learning_clicked` tracked.
- Technical Notes: Graceful fallback when no in-progress content.
- Dependencies: UXV2-013
- Estimate: 0.75d
- Validation: Unit conditional rendering test; Integration click behavior; E2E resume flow

### UXV2-015: Reorder recommendations/shorts/progress blocks per V2 hierarchy
- Type: Task
- Context: Current information order is mixed.
- Scope: Reorder and normalize section hierarchy and headings.
- Acceptance Criteria:
1. Section order matches PRD hierarchy.
2. Section-level empty/loading/error states implemented.
3. Mobile scan order remains readable and uncluttered.
- Technical Notes: Preserve existing business logic for data sources.
- Dependencies: UXV2-014
- Estimate: 1d
- Validation: Unit block render tests; Integration section state checks; E2E dashboard scenario test

### UXV2-016: Add desktop two-column layout for dashboard at `lg+`
- Type: Task
- Context: Desktop should improve density without clutter.
- Scope: Introduce two-column layout split while preserving mobile-first behavior.
- Acceptance Criteria:
1. `lg+` layout uses content + side panel split.
2. Mobile layout remains unchanged below breakpoint.
3. Focus order and keyboard navigation remain logical.
- Technical Notes: Avoid duplication of block components.
- Dependencies: UXV2-015
- Estimate: 0.75d
- Validation: Unit layout conditional test; Integration responsive test; E2E keyboard path

## Epic E: Analytics, QA, and Rollout

### UXV2-017: Implement UX V2 analytics taxonomy events
- Type: Task
- Context: Need measurable funnel for redesign impact.
- Scope: Add event emitters for onboarding and dashboard CTA events.
- Acceptance Criteria:
1. Required event names are emitted with valid payload schema.
2. Events appear in analytics endpoint with authenticated context.
3. Duplicate event spam is controlled.
- Technical Notes: Reuse existing debounce behavior in analytics helper.
- Dependencies: UXV2-010, UXV2-012, UXV2-014
- Estimate: 0.5d
- Validation: Unit event tests; Integration API event check; E2E funnel smoke

### UXV2-018: Add accessibility and visual regression test suite updates
- Type: Story
- Context: Redesign requires guardrails for regressions.
- Scope: Extend QA coverage for contrast, focus, keyboard nav, and key view snapshots.
- Acceptance Criteria:
1. Key onboarding/dashboard scenarios are covered in regression tests.
2. Accessibility checks pass on redesigned surfaces.
3. Snapshot baselines captured for target breakpoints.
- Technical Notes: Integrate with current CI strategy.
- Dependencies: UXV2-012, UXV2-016
- Estimate: 1d
- Validation: Unit accessibility helpers; Integration test run; E2E full suite

### UXV2-019: Add feature flag and rollback controls for UX V2
- Type: Story
- Context: Need safe progressive rollout.
- Scope: Implement `ux_v2_dark_purple` toggle and fallback to legacy UI path.
- Acceptance Criteria:
1. Flag can enable/disable V2 without redeploy.
2. Cohort rollout is supported.
3. Rollback path verified in staging.
- Technical Notes: Keep both paths operational through rollout window.
- Dependencies: UXV2-012, UXV2-016
- Estimate: 0.75d
- Validation: Unit flag checks; Integration toggle behavior; E2E variant smoke

### UXV2-020: Release runbook, observability dashboard, and post-launch review
- Type: Task
- Context: Launch needs operational readiness and learning loop.
- Scope: Document runbook, define alert thresholds, and schedule post-launch analysis.
- Acceptance Criteria:
1. Runbook covers rollout, rollback, and incident response.
2. Metrics dashboard tracks agreed success criteria.
3. Post-launch review template includes decisions for v2.1.
- Technical Notes: Link to PRD metrics and architecture ADR decisions.
- Dependencies: UXV2-017, UXV2-018, UXV2-019
- Estimate: 0.5d
- Validation: Unit N/A; Integration docs review; E2E N/A

