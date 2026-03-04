# Rollback Playbook

## Rollback Decision Tree

### Who Can Trigger

- On-call engineer for Sev-0 incidents (immediate, no approval needed).
- Release manager for Sev-1 issues (notify team, proceed).
- Engineering lead for partial rollbacks (coordinate with affected teams).

### Trigger Criteria

- Error rate exceeds 5% of requests (5xx responses).
- Core user journey broken (signup, login, content access, payment).
- Data corruption or loss detected.
- Security vulnerability exposed in production.
- Performance degradation > 50% from baseline (p95 response time).

### Communication

1. Post in #incidents channel: "Rollback initiated for vX.Y.Z -- [reason]".
2. Update status page if user-facing impact.
3. Notify stakeholders within 15 minutes.

---

## Frontend Rollback

### Procedure

1. Identify previous stable Vite build hash from deployment log.
2. Revert static assets to previous build:
   - If CDN: point to previous build directory.
   - If Docker: redeploy container with previous image tag.
   - If direct serve: restore dist/public/ from previous build artifact.
3. Clear CDN cache if applicable.
4. Verify rollback:
   - [ ] Application loads without console errors.
   - [ ] Bundle hash matches previous stable version.
   - [ ] Critical user journeys functional (spot check).

### Notes

- Frontend rollback is independent of backend; static assets can be reverted without API changes.
- Service worker cache may serve stale content; ensure cache-busting headers are set.

---

## Backend Rollback

### Procedure

1. Identify previous stable server version from deployment log or git tags.
2. Redeploy previous server version:
   - If Docker: `docker-compose up -d --force-recreate` with previous image tag.
   - If direct: checkout previous tag, `npm ci`, rebuild, restart process.
3. Verify health endpoints:
   - [ ] GET /health returns 200.
   - [ ] GET /ready returns 200 with DB connectivity confirmed.
4. Verify API functionality:
   - [ ] Authentication flow works.
   - [ ] Core CRUD operations respond correctly.
   - [ ] Stripe webhook endpoint accepting events.

### Notes

- If backend rollback requires database rollback, coordinate with database rollback procedure below.
- Environment variables should match the previous version's expectations.

---

## Database Rollback

### Procedure

1. Confirm migration rollback script exists and has been tested in staging.
2. Take a point-in-time backup before rolling back:
   - `pg_dump -Fc $DATABASE_URL > pre-rollback-$(date +%s).dump`
3. Execute reverse migration:
   - Run the down migration for the release version.
   - Verify schema matches previous stable state.
4. Verify data integrity:
   - [ ] No orphaned rows from dropped foreign keys.
   - [ ] JSONB column data intact.
   - [ ] Row counts match expectations (no data loss).
5. Verify connection pool health after migration.

### Data Implications

- Additive migrations (new columns, new tables) are safe to reverse.
- Destructive migrations (dropped columns, data transforms) may cause data loss on rollback. These require restore from backup instead.
- If backup restore is needed, coordinate downtime window.

---

## Full Rollback (All Layers)

### Coordinated Steps

1. **Announce**: Post rollback initiation in #incidents.
2. **Database first**: Execute database rollback if schema changes are involved.
3. **Backend second**: Redeploy previous backend version after database is stable.
4. **Frontend last**: Revert static assets after backend is confirmed healthy.
5. **Verify end-to-end**: Run smoke tests across all critical journeys.
6. **Confirm**: Post rollback completion in #incidents with summary.

### Order Rationale

- Database rolls back first because backend depends on schema.
- Backend rolls back second because frontend depends on API contract.
- Frontend rolls back last as it has the fewest dependencies.

---

## Post-Rollback Verification Checklist

- [ ] Health endpoints responding (GET /health, GET /ready).
- [ ] Error rate returned to baseline (< 1% 5xx).
- [ ] Core user journeys functional (signup, login, content access).
- [ ] Payment flows operational (Stripe webhooks processing).
- [ ] Database connection pool healthy (no connection leaks).
- [ ] No data loss or corruption confirmed.
- [ ] Monitoring dashboards show normal metrics.
- [ ] Alerts cleared or acknowledged.

---

## Incident Communication Template

```
**Incident: Rollback of vX.Y.Z**

**Status**: [Investigating | Rollback In Progress | Resolved]
**Severity**: [Sev-0 | Sev-1 | Sev-2]
**Started**: YYYY-MM-DD HH:MM UTC
**Resolved**: YYYY-MM-DD HH:MM UTC

**Summary**: [Brief description of what went wrong]

**Impact**: [User-facing impact description]

**Root Cause**: [What caused the issue]

**Rollback Actions Taken**:
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Follow-Up Items**:
- [ ] Root cause analysis document
- [ ] Fix forward plan with timeline
- [ ] Process improvements to prevent recurrence
```
