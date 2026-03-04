---
name: release-manager
description: Coordinate release processes, manage versioning, automate changelogs, implement feature flags, and define rollback procedures. Use when a user asks for release coordination, version management, changelog automation, feature flags, go/no-go decisions, or rollback planning.
---

# Release Manager

Coordinate cross-team releases with quality gates and rollback safety nets.

## Workflow

1. Define version strategy.
- package.json at 1.0.0 with no changelog or versioning automation.
- Design semantic versioning strategy.
- Define major/minor/patch criteria for MindPrism.
- Establish git tag conventions.

2. Automate changelog.
- Design conventional commit enforcement.
- Create changelog generation from commit history or PR labels.
- Define release notes template aggregating contributions from all agents.

3. Design feature flag system.
- App has no feature flags.
- Define lightweight flag system with Express middleware and React context.
- Identify features for flags: Stripe flows (optional via env var check), new content types, admin features.

4. Create cross-agent release checklist.
- Aggregate gate criteria: frontend bundle budget pass (performance-engineer), API audit clean (backend-engineer), security scan clean (security-engineer), E2E test pass (qa-e2e), migration tested (database-engineer), CI green (devops-sre).
- Define go/no-go decision framework.

5. Design rollback procedures.
- Map rollback paths: frontend (revert static build), backend (revert server + reverse migration), database (migration rollback from database-engineer), config (env var snapshots).
- Define rollback trigger criteria and responsibility chain.

## Output Contract

Return:
- Version management strategy document
- Changelog automation specification
- Feature flag system design
- Cross-agent release checklist with go/no-go criteria
- Rollback playbook with step-by-step procedures

## Resources

- `scripts/generate_release_packet.py` creates release checklist and changelog templates.
- `references/release-checklist.md` provides multi-agent gate criteria.
- `references/rollback-playbook.md` provides rollback procedures.
