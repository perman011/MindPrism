# Mind Prism Agent System

This repo uses a coordinated multi-agent setup for shipping Mind Prism to a production-ready level.

## Team Shape

- 1 orchestrator (`codex-orchestrator`) for planning, routing, and conflict resolution
- 12 execution agents with role-owned skills and output paths
- Parallel execution by wave to reduce cycle time while preserving handoff quality

Canonical config files:

- `agents/core-team.yaml` -> role definitions and wave sequencing
- `agents/registry.yaml` -> role missions, ownership boundaries, and contracts
- `agents/work_queue.md` -> execution lanes and active queue template
- `agents/endgame-requirements.md` -> requirement-to-agent coverage map

## Agent Roster

- UX Designer (`UX`) -> `agents/skills/ux-designer`
- Technical Product Manager (`TPM`) -> `agents/skills/technical-pm`
- Solution Architect (`ARCH`) -> `agents/skills/solution-architect`
- Database Engineer (`DBA`) -> `agents/skills/database-engineer`
- Security Engineer (`SEC`) -> `agents/skills/security-engineer`
- Backend Engineer (`BE`) -> `agents/skills/backend-engineer`
- Frontend Engineer (`FE`) -> `agents/skills/frontend-engineer`
- Data / Analytics Engineer (`DATA`) -> `agents/skills/data-analytics`
- DevOps / SRE Engineer (`OPS`) -> `agents/skills/devops-sre`
- Performance Engineer (`PERF`) -> `agents/skills/performance-engineer`
- QA E2E Engineer (`QA`) -> `agents/skills/qa-e2e`
- Release Manager (`RM`) -> `agents/skills/release-manager`

## Parallel Run Model

- Wave 1 (Design and scope): `UX + TPM + ARCH`
- Wave 2 (Hardening foundation): `DBA + SEC` (fed by `ARCH`)
- Wave 3 (Implementation): `BE + FE + DATA + OPS` in parallel
- Wave 4 (Validation): `PERF + QA`
- Wave 5 (Release): `RM` with signoff loop to `TPM`

## Routing Examples

- `Route to UX: finalize mobile + desktop flow spec for onboarding, dashboard, and shorts.`
- `Route to TPM: create execution PRD + 20-ticket sprint plan from latest UX + ARCH outputs.`
- `Route to BE: harden Stripe webhooks and subscription entitlement transitions with tests.`
- `Route to QA: produce release gate report using current API, auth, billing, and media tests.`

Use the handoff template in `agents/work_queue.md` for every cross-agent transfer.
