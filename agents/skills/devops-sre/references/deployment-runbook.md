# Deployment Runbook -- MindPrism

## Pre-Deployment Checklist

- [ ] CI pipeline green on target branch (all stages pass)
- [ ] Database migration tested against staging database
- [ ] Secrets verified in target environment (no defaults, no expired keys)
- [ ] Changelog or release notes prepared
- [ ] Rollback plan reviewed and communicated
- [ ] On-call engineer identified

---

## Deployment Steps

### Replit Deployment Path

1. [ ] Merge PR to main branch
2. [ ] Verify Replit auto-deploys from main
3. [ ] Monitor Replit console for startup errors
4. [ ] Run post-deployment verification (see below)

### Docker Deployment Path

1. [ ] Build production Docker image
   ```bash
   docker build -t mindprism:$(git rev-parse --short HEAD) .
   ```
2. [ ] Push image to container registry
   ```bash
   docker push registry.example.com/mindprism:$(git rev-parse --short HEAD)
   ```
3. [ ] Run database migration (if applicable)
   ```bash
   docker run --rm --env-file .env.production mindprism:latest npx drizzle-kit migrate
   ```
4. [ ] Deploy new container
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```
5. [ ] Verify health checks pass (see below)
6. [ ] Monitor logs for 10 minutes post-deploy
   ```bash
   docker compose logs -f --tail=100 app
   ```

---

## Post-Deployment Verification

### Health Check Verification

- [ ] GET /health returns HTTP 200
  ```bash
  curl -sf http://localhost:5000/health
  ```
- [ ] GET /ready returns HTTP 200 with version and uptime
  ```bash
  curl -sf http://localhost:5000/ready | jq .
  ```

### Smoke Test Critical Paths

- [ ] Homepage loads (HTTP 200, renders content)
- [ ] User login flow succeeds
- [ ] Book catalog page renders with data
- [ ] Stripe subscription flow reachable (checkout page loads)
- [ ] Admin dashboard accessible for admin users
- [ ] Push notification subscription succeeds (if VAPID configured)

### Monitoring Checks

- [ ] Error rate within baseline (< 1% of requests)
- [ ] Response time p95 within baseline
- [ ] Database connection pool healthy (no connection exhaustion)
- [ ] Memory usage stable (no leak indicators)
- [ ] Sentry error volume normal

---

## Rollback Trigger Criteria

Initiate rollback if ANY of the following occur within 30 minutes post-deploy:

| Trigger | Threshold |
|---|---|
| Error rate | > 5% of requests |
| Response time p95 | > 2x baseline |
| Health check failure | /health or /ready returns non-200 |
| Critical user flow broken | Login, payment, or catalog inaccessible |
| Database errors | Connection pool exhaustion or query timeouts |
| Crash loop | Application restarts > 3 times in 5 minutes |

---

## Rollback Steps

### Replit Rollback

1. [ ] Revert merge commit on main
   ```bash
   git revert <merge-commit-sha>
   git push origin main
   ```
2. [ ] Verify Replit redeploys with reverted code
3. [ ] Run post-deployment verification again

### Docker Rollback

1. [ ] Deploy previous image tag
   ```bash
   docker compose -f docker-compose.prod.yml down
   docker tag registry.example.com/mindprism:<previous-sha> registry.example.com/mindprism:latest
   docker compose -f docker-compose.prod.yml up -d
   ```
2. [ ] Reverse database migration if needed
   ```bash
   docker run --rm --env-file .env.production mindprism:<previous-sha> npx drizzle-kit migrate --revert
   ```
3. [ ] Verify health checks pass
4. [ ] Notify team of rollback and root cause investigation

---

## Post-Incident

- [ ] Document incident timeline
- [ ] Identify root cause
- [ ] Create follow-up tickets for fixes
- [ ] Update runbook if gaps identified
- [ ] Schedule post-mortem if severity warrants it
