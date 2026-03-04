# ADR-002: Shared Button V2 Primitive

## Status
Proposed

## Context
CTA hierarchy and interaction states are inconsistent across pages.

## Decision
Standardize all critical actions on a shared Button V2 primitive with four variants (`primary`, `secondary`, `ghost`, `destructive`), consistent sizes, and explicit loading/focus states.

## Alternatives Considered
1. Keep existing button primitive and override per-page.
2. Build independent button components for each major page.

## Consequences
### Positive
- Consistent action language and UX quality.
- Lower maintenance and easier testing.

### Negative
- Initial refactor effort across existing CTAs.

## Rollout / Migration Notes
1. Implement primitive.
2. Migrate landing/onboarding/dashboard first.
3. Expand to remaining user surfaces in follow-up.

## Observability / Validation Plan
- Component variant test coverage.
- Keyboard focus and disabled-state QA checks.
