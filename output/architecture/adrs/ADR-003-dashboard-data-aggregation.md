# ADR-003: Dashboard Data Aggregation Strategy

## Status
Proposed

## Context
Dashboard currently relies on multiple independent queries, which can lead to uneven loading states and reduced perceived performance.

## Decision
Implement a dashboard data adapter abstraction immediately and evaluate introducing `GET /api/dashboard/home` as a server-side aggregation endpoint for v2.1 if query cost or latency warrants it.

## Alternatives Considered
1. No adapter and keep per-widget fetch calls.
2. Immediately build a large aggregator endpoint in v2 MVP.

## Consequences
### Positive
- Faster MVP delivery with low migration risk.
- Clear path to scale into aggregated backend payload.

### Negative
- Transitional complexity while both patterns coexist.

## Rollout / Migration Notes
1. Introduce client adapter with typed payload.
2. Measure dashboard latency and error profile.
3. Promote to server aggregation if thresholds are exceeded.

## Observability / Validation Plan
- Track p75 dashboard load times.
- Track block-level failure rates.
