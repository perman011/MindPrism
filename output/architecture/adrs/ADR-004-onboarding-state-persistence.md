# ADR-004: Onboarding State Persistence Strategy

## Status
Proposed

## Context
A multi-step onboarding flow risks user progress loss on refresh or transient failure.

## Decision
Persist onboarding in-progress state (step index and selected interests) locally per session and only commit finalized preferences to backend via existing `POST /api/interests` call.

## Alternatives Considered
1. Persist every onboarding step server-side.
2. No persistence until final submit.

## Consequences
### Positive
- Lower backend coupling for interim state.
- Better user resilience on refresh/network interruption.

### Negative
- Requires careful local state invalidation after success.

## Rollout / Migration Notes
1. Add state persistence abstraction.
2. Clear state after successful submit.
3. Handle stale state version mismatch safely.

## Observability / Validation Plan
- Track onboarding retry and abandonment metrics.
- Verify no duplicate submit anomalies.
