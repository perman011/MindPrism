# Technical PRD: MindPrism UX V2 Dark Purple Redesign

## 1. Problem Statement
MindPrism's current onboarding and dashboard experience has mixed visual language (legacy blue/light surfaces, partial purple tokens, and hardcoded per-page styles), which reduces brand consistency and slows UI iteration. The product needs a premium dark-purple redesign with a stronger logo lockup, modern button system, and clearer onboarding/dashboard hierarchy without degrading accessibility, performance, or release safety.

## 2. Goals and Success Metrics

### Product Goals
1. Deliver a coherent dark-purple visual system across landing, onboarding, and dashboard.
2. Improve onboarding completion and first-session activation.
3. Improve dashboard clarity around next actions (resume, discover, progress).
4. Standardize UI primitives (logo header and buttons) for faster future delivery.

### Success Metrics
1. Onboarding completion rate: +12% vs current baseline.
2. Continue-learning CTA click-through: +20%.
3. Time-to-first-learning action: < 90 seconds median.
4. Visual consistency QA score: >= 95% pass across target breakpoints.
5. Accessibility: AA contrast pass on all redesigned screens.

## 3. Users and Use Cases

### Primary Users
1. New learner: signs up and completes onboarding to get personalized recommendations.
2. Returning learner: opens dashboard and resumes current learning flow quickly.
3. Engaged learner: uses shorts/audio and checks progress frequently.

### Core Use Cases
1. User lands in onboarding and completes a 3-step flow.
2. User reaches dashboard and immediately sees "Continue Learning".
3. User can discover recommended content and shorts with minimal friction.
4. User can trust visual hierarchy and actionable buttons on mobile and desktop.

## 4. Scope

### In Scope
1. Landing visual refresh for brand consistency.
2. Onboarding redesign to 3-step flow.
3. Dashboard hierarchy and component refresh.
4. Dark-purple token system and typography updates.
5. Shared button system V2 and logo lockup component.
6. Analytics instrumentation for onboarding/dashboard funnel.

### Out of Scope
1. Admin portal UX redesign.
2. Billing and subscription flow redesign.
3. Content model changes for books/chapters/shorts.
4. Mobile native app changes.

## 5. Functional Requirements

### FR-01 Theme Token Platform
- Introduce semantic dark-purple tokens and map existing hardcoded colors to token usage.
- Support both light and dark mode compatibility, with dark-purple as the primary branded mode.

### FR-02 Typography System
- Implement display/body/utility typography stacks from UX V2 spec.
- Ensure safe fallbacks and no blocking font failures.

### FR-03 Logo Lockup Component
- Provide reusable `LogoLockup` component with compact and hero variants.
- Replace ad hoc logo/text combinations in landing, onboarding, and dashboard headers.

### FR-04 Button System V2
- Support `primary`, `secondary`, `ghost`, `destructive` variants.
- Standardize sizes, states, loading behavior, focus rings, and disabled states.

### FR-05 Onboarding Step Shell
- Convert onboarding to 3-step shell:
  1. Welcome/value
  2. Interests selection
  3. Personalized preview
- Persist in-progress step and selected interests across refresh in the same session.

### FR-06 Onboarding Interest Step
- Keep current interest taxonomy/API contract.
- Require minimum 3 interests before final submit.
- Show elevated selected state and clear progress indicator.

### FR-07 Onboarding Submission
- Continue using existing `POST /api/interests` endpoint.
- Emit instrumentation events for each step and completion.

### FR-08 Dashboard Information Hierarchy
- Reorder dashboard to prioritize:
  1. Header status
  2. Continue Learning
  3. Recommendations
  4. Shorts/Audio
  5. Progress utility

### FR-09 Dashboard Data Loading
- Add a dashboard data adapter strategy to reduce waterfall queries.
- Either implement aggregator endpoint or typed client-side concurrent fetch abstraction with shared loading states.

### FR-10 Responsive Layout
- Mobile-first primary layout.
- Two-column desktop behavior at `lg` and above.

### FR-11 UX States
- Implement explicit empty/loading/error/success states for all primary blocks.

### FR-12 Event Tracking
- Add/standardize events:
  - `onboarding_step_viewed`
  - `onboarding_interest_selected`
  - `onboarding_completed`
  - `dashboard_continue_learning_clicked`
  - `dashboard_shorts_clicked`

## 6. Non-Functional Requirements

### Performance
1. Dashboard first meaningful paint p75 <= 2.5s on broadband mobile profile.
2. Additional CSS payload from redesign <= 35KB gzip net increase.
3. Avoid synchronous layout thrash from animations.

### Reliability
1. Onboarding submission failure must preserve user selections.
2. Dashboard block failures must degrade locally (no full-page blank state).

### Security
1. No new anonymous write endpoints.
2. Analytics events remain authenticated as currently enforced.
3. Do not expose private user identifiers in client logs.

### Observability
1. Funnel and CTA events queryable in existing analytics backend.
2. Error boundaries preserve context tags for redesigned components.

### Accessibility
1. WCAG AA contrast on core text/buttons.
2. Keyboard navigation for onboarding and dashboard controls.
3. `prefers-reduced-motion` respected.

## 7. Technical Design Summary

### Interfaces/APIs
1. Reuse existing:
- `POST /api/interests`
- `GET /api/books`, `GET /api/books/recommended`, `GET /api/progress`, etc.
- `POST /api/analytics/events`

2. Optional enhancement (recommended):
- `GET /api/dashboard/home` to aggregate header/continue/recommendation/shorts payload.

### Data Model Changes
1. No required schema migrations for MVP redesign.
2. Optional follow-up: add lightweight UI preferences table/column for server-side UX flags.

### Dependency Map
1. `client/src/index.css` token and typography updates.
2. Shared UI primitives under `client/src/components/ui` and logo component.
3. Onboarding page refactor in `client/src/pages/onboarding.tsx`.
4. Dashboard refactor in `client/src/pages/dashboard.tsx`.
5. Analytics helper updates in `client/src/lib/analytics.ts`.
6. Optional server route extension in `server/routes.ts` (or `server/routes/*`).

## 8. Release Plan

### Milestone M1 - Token and Primitive Foundation
- Theme tokens, typography, logo lockup component, button system V2.

### Milestone M2 - Onboarding V2
- 3-step flow, state persistence, instrumentation.

### Milestone M3 - Dashboard V2
- New hierarchy, improved blocks, responsive desktop split.

### Milestone M4 - QA and Rollout
- Accessibility/performance checks, feature-flag rollout, post-release monitoring.

### Rollout Strategy
1. Feature flag `ux_v2_dark_purple` (user cohort based).
2. Internal staff cohort -> 10% users -> 50% users -> 100% rollout.
3. Rollback via flag disable without redeploy.

### Rollback Plan
1. Immediate kill switch to old UI path/components.
2. Keep legacy token fallback in first release window.
3. Preserve analytics compatibility for both variants.

### Owner Mapping
1. Frontend: UX tokens/components/pages.
2. Backend: optional dashboard aggregation + event integrity.
3. QA: e2e coverage and accessibility validation.
4. PM: metric tracking and rollout gates.

## 9. Test and QA Plan
1. Unit tests for button variants and onboarding step logic.
2. Integration tests for onboarding submission and dashboard data adapter.
3. E2E tests for onboarding completion and resume-learning flow.
4. Visual regression snapshots at 375/768/1024/1440.
5. Accessibility checks (focus order, contrast, keyboard navigation).
6. Performance checks (Core Web Vitals smoke before/after).

## 10. Risks, Assumptions, Open Questions

### Risks
1. Hardcoded color drift can cause inconsistent UI.
2. Dashboard refactor may introduce loading-state regressions.
3. Motion updates may impact low-end devices if not constrained.

### Assumptions
1. Existing endpoints can support redesigned UI without schema changes.
2. Current analytics pipeline can absorb additional event volume.
3. Feature flags can be introduced via config layer/environment.

### Open Questions
1. Should dark-purple mode be default for all users or phased by cohort?
2. Is `GET /api/dashboard/home` required in v1 or deferred to v1.1?
3. Should onboarding preview include real recommendations or mocked sample cards?
