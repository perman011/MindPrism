---
name: qa-e2e
description: Plan and execute end-to-end quality assurance for product features and releases. Use when a user asks for QA strategy, regression coverage, release gates, test-case design, bug triage, or end-to-end verification of user journeys.
---

# QA E2E

Own release confidence through structured end-to-end validation.

## Workflow

1. Define coverage model.
- Enumerate critical user journeys and business-critical paths.
- Map each journey to required environments and data setups.

2. Build test catalog.
- Positive paths, negative paths, edge cases, and recovery paths.
- Include accessibility checks and responsive behavior.

3. Define execution plan.
- Pre-merge checks.
- Pre-release full regression.
- Post-release smoke checks.

4. Triage defects.
- Classify severity and customer impact.
- Track reproduction clarity and fix verification steps.

5. Gate release.
- Pass/fail criteria with explicit blockers.
- Publish QA sign-off or rejection with evidence.

## Output Contract

Return:
- E2E test plan
- Test case matrix with expected results
- Defect report format
- Release gate decision and rationale

## Resources

- `scripts/generate_e2e_matrix.py` scaffolds CSV test matrix.
- `references/release-gates.md` defines quality gate criteria.
- `references/severity-model.md` defines defect severity standards.
