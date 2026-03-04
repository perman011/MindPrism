#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate release checklist and changelog templates.")
    parser.add_argument(
        "--version",
        required=True,
        help="Semantic version string, e.g. '1.2.0'",
    )
    parser.add_argument("--out", default="output/releases/")
    args = parser.parse_args()

    if not re.match(r"^\d+\.\d+\.\d+$", args.version):
        raise ValueError(f"Invalid semver: {args.version}. Expected format: X.Y.Z")

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    checklist_path = out / f"{args.version}-release-checklist.md"
    changelog_path = out / f"{args.version}-changelog.md"

    checklist_path.write_text(_release_checklist(args.version), encoding="utf-8")
    print(f"Wrote {checklist_path}")

    changelog_path.write_text(_changelog_template(args.version), encoding="utf-8")
    print(f"Wrote {changelog_path}")


def _release_checklist(version: str) -> str:
    return f"""# Release Checklist -- v{version}

## Frontend (performance-engineer / frontend-engineer)

- [ ] Bundle budget pass (total JS < budget, no regressions)
- [ ] Accessibility audit clean (axe-core, no critical violations)
- [ ] PWA check (manifest valid, service worker registered)
- [ ] Lighthouse performance score >= threshold
- [ ] No console errors in production build

## Backend (backend-engineer)

- [ ] API audit clean (all endpoints documented, error codes consistent)
- [ ] Stripe webhook events complete (all event types handled)
- [ ] Session migration done (no default SESSION_SECRET)
- [ ] Health check endpoints responding (/health, /ready)
- [ ] Rate limiting configured on public endpoints

## DevOps (devops-sre)

- [ ] CI green (all quality.yml stages pass)
- [ ] Docker build success (multi-stage build completes)
- [ ] Health checks responding in staging
- [ ] Environment variable parity verified (staging vs production)
- [ ] Deployment runbook reviewed and updated

## Security (security-engineer)

- [ ] OWASP Top 10 pass (no critical or high findings)
- [ ] Secrets rotated (SESSION_SECRET, VAPID keys, API keys)
- [ ] npm audit clean (no high or critical vulnerabilities)
- [ ] Input validation verified on all user-facing endpoints
- [ ] CORS and CSP headers configured

## Data (data-analytics)

- [ ] Analytics pipeline verified (events flowing to destination)
- [ ] Retention policy active (PII cleanup scheduled)
- [ ] Dashboard metrics baseline captured pre-release

## Performance (performance-engineer)

- [ ] Load test pass (p95 response time within budget)
- [ ] Core Web Vitals in budget (LCP, FID, CLS)
- [ ] Database query performance verified (no N+1, slow queries)

## Database (database-engineer)

- [ ] Indexes deployed for new queries
- [ ] Migration tested (up and down) in staging
- [ ] Backup verified (recent backup, restore tested)
- [ ] Connection pool health confirmed

## QA (qa-e2e)

- [ ] E2E test matrix pass (critical journeys green)
- [ ] Regression suite pass rate >= 98%
- [ ] No open Sev-0 or Sev-1 defects
- [ ] Release gates met (per severity model)

---

## Go/No-Go Decision

| Category | Status | Owner | Notes |
|---|---|---|---|
| Frontend | | | |
| Backend | | | |
| DevOps | | | |
| Security | | | |
| Data | | | |
| Performance | | | |
| Database | | | |
| QA | | | |

**Decision**: [ GO / NO-GO ]
**Decision maker**:
**Date**:
**Rationale**:
"""


def _changelog_template(version: str) -> str:
    return f"""# Changelog -- v{version}

## Release Summary

**Version**: {version}
**Date**: YYYY-MM-DD
**Release manager**:

---

## Frontend

### Added
-

### Changed
-

### Fixed
-

## Backend

### Added
-

### Changed
-

### Fixed
-

## Database

### Migrations
-

### Schema Changes
-

## DevOps

### Infrastructure
-

### CI/CD
-

## Security

### Fixes
-

### Improvements
-

## Performance

### Optimizations
-

### Metrics
-

## Data & Analytics

### Pipeline Changes
-

### New Events
-

---

## Breaking Changes

-

## Known Issues

-

## Upgrade Notes

-
"""


if __name__ == "__main__":
    main()
