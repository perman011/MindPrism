# Release Checklist -- Multi-Agent Gate Criteria

## Frontend

- [ ] Bundle budget pass (total JS < budget, no regressions)
- [ ] Accessibility audit clean (axe-core, no critical violations)
- [ ] PWA check (manifest valid, service worker registered, offline fallback)
- [ ] Lighthouse performance score >= threshold
- [ ] No console errors in production build

## Backend

- [ ] API audit clean (all endpoints documented, error codes consistent)
- [ ] Stripe webhook events complete (all event types handled)
- [ ] Session migration done (no default SESSION_SECRET)
- [ ] Health check endpoints responding (/health, /ready)
- [ ] Rate limiting configured on public endpoints

## DevOps

- [ ] CI green (all quality.yml stages pass)
- [ ] Docker build success (multi-stage build completes)
- [ ] Health checks responding in staging
- [ ] Environment variable parity verified (staging vs production)
- [ ] Deployment runbook reviewed and updated

## Security

- [ ] OWASP Top 10 pass (no critical or high findings)
- [ ] Secrets rotated (SESSION_SECRET, VAPID keys, API keys)
- [ ] npm audit clean (no high or critical vulnerabilities)
- [ ] Input validation verified on all user-facing endpoints
- [ ] CORS and CSP headers configured

## Data

- [ ] Analytics pipeline verified (events flowing to destination)
- [ ] Retention policy active (PII cleanup scheduled)
- [ ] Dashboard metrics baseline captured pre-release
- [ ] Data export/import tested for affected models

## Performance

- [ ] Load test pass (p95 response time within budget)
- [ ] Core Web Vitals in budget (LCP, FID, CLS)
- [ ] Database query performance verified (no N+1, slow queries)
- [ ] Memory and CPU usage within baseline

## Database

- [ ] Indexes deployed for new queries
- [ ] Migration tested (up and down) in staging
- [ ] Backup verified (recent backup, restore tested)
- [ ] Connection pool health confirmed
- [ ] JSONB column validation in place

## QA

- [ ] E2E test matrix pass (critical journeys green)
- [ ] Regression suite pass rate >= 98%
- [ ] No open Sev-0 or Sev-1 defects
- [ ] Release gates met (per qa-e2e severity model)
- [ ] Smoke tests defined for post-deploy verification

---

## Go/No-Go Decision Matrix

| Category | Blocker Level | Rule |
|---|---|---|
| Sev-0 defect open | No-Go | System unusable or data loss. Immediate fix required. |
| Sev-1 defect open | No-Go | Core flow blocked for many users. Must fix before release. |
| Sev-2 defect open | Conditional | Release with explicit risk acceptance and rollback plan. |
| CI pipeline failing | No-Go | Quality gates must pass. |
| Security critical finding | No-Go | OWASP critical or high finding blocks release. |
| Bundle budget exceeded | No-Go | Performance regression blocks release. |
| Migration not tested | No-Go | Database changes must be verified in staging. |
| Backup not verified | No-Go | Must confirm restore capability before deploying. |
| Sev-3 defect open | Go | Minor or cosmetic issues. Track in backlog. |
| Docs not updated | Conditional | Non-blocking but must be addressed within 48 hours. |
