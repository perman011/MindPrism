# Release Gates

## Must Pass Before Release

1. No open Sev-0 or Sev-1 defects.
2. Critical user journeys pass in target environment.
3. Regression suite pass rate >= 98%.
4. Performance checks meet baseline budgets.
5. Observability checks are active (logs, errors, alerts).

## Recommended

- Accessibility spot checks on key journeys.
- Data integrity verification for write-heavy flows.
- Rollback rehearsal for major releases.
