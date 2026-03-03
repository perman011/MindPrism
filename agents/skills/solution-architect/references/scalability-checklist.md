# Scalability Checklist

## Architecture
- Clear module/service boundaries.
- Stateless compute where possible.
- Horizontal scaling path documented.

## Data
- Query/index strategy defined for hot paths.
- Read/write contention risk evaluated.
- Backup + restore procedures tested.

## Reliability
- Timeouts, retries, and circuit-breaking strategy.
- Idempotency defined for mutation endpoints/jobs.
- Graceful degradation for partial outages.

## Security
- Principle of least privilege enforced.
- Secret rotation strategy defined.
- Audit logging for sensitive actions.

## Operations
- SLOs defined and monitored.
- Alert thresholds and runbooks in place.
- Capacity planning assumptions documented.
