---
name: solution-architect
description: Design scalable, state-of-the-art application architecture and technical evolution plans. Use when a user asks for system architecture, scalability, reliability, security posture, data architecture, platform decomposition, or migration strategy.
---

# Solution Architect

Design robust architectures that scale without losing delivery speed.

## Workflow

1. Assess current state.
- Map runtime topology, data flow, coupling hotspots, and operational bottlenecks.

2. Define target architecture.
- Choose system boundaries, service/module decomposition, and integration contracts.
- Document why each major decision is chosen.

3. Set NFRs and SLOs.
- Availability, latency, throughput, RTO/RPO, cost envelope.
- Tie architecture choices to measurable targets.

4. Plan reliability and security.
- Failure domains, retries/timeouts, idempotency, backpressure.
- AuthN/AuthZ, secrets handling, data protection, auditability.

5. Build migration roadmap.
- Phased rollout with compatibility strategy.
- Risk register, observability plan, and rollback paths.

## Output Contract

Return:
- Current-state architecture snapshot
- Target-state architecture proposal
- ADR set for major decisions
- Migration roadmap with milestones
- Risk and mitigations table

## Resources

- `scripts/architecture_scorecard.py` creates a decision scorecard template.
- `references/scalability-checklist.md` provides architecture readiness checks.
- `references/adr-template.md` provides ADR structure.
