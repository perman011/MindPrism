# ADR-005: Feature Flag Rollout and Observability Controls

## Status
Proposed

## Context
UX V2 introduces broad UI changes with potential conversion and reliability impact.

## Decision
Gate UX V2 behind `ux_v2_dark_purple` feature flag and roll out by cohorts with explicit quality gates based on onboarding completion, CTA usage, client error rate, and latency.

## Alternatives Considered
1. Big-bang release to 100% users.
2. Hidden internal release without metric gates.

## Consequences
### Positive
- Reduced blast radius.
- Data-driven go/no-go decisions.
- Fast rollback without redeploy.

### Negative
- Temporary dual-path maintenance burden.

## Rollout / Migration Notes
1. Internal cohort.
2. 10% external cohort.
3. 50% cohort.
4. 100% rollout if gates pass.

## Observability / Validation Plan
- Segment metrics by feature flag variant.
- Define rollback thresholds before launch.
