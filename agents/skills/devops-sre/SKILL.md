---
name: devops-sre
description: Build CI/CD pipelines, containerize the application, configure staging environments, and establish deployment automation with rollback capability. Use when a user asks for CI/CD setup, Docker containerization, staging environments, health checks, deployment strategy, or secrets management.
---

# DevOps / SRE Engineer

Automate infrastructure, deployments, and reliability for production operations.

## Workflow

1. Audit current CI.
- Existing .github/workflows/quality.yml only runs Python tests (unittest discover, notebook smoke test).
- Zero JavaScript coverage: no npm install, no tsc --noEmit, no npm run build, no JS test runner.
- Design complete quality gate with TypeScript check, Vite build, ESLint, and unit test stages.

2. Create Docker containerization.
- App is Replit-locked (.replit config, server/replit_integrations/).
- Design multi-stage Dockerfile: Node 20 base, npm ci, Vite build, production run of dist/index.cjs.
- Create docker-compose.yml with PostgreSQL service.
- Handle Replit-specific code with env-based conditionals.

3. Configure staging environment.
- Define environment parity requirements.
- Create env var template for all required vars (DATABASE_URL, SESSION_SECRET, STRIPE_*, VAPID_*, SENTRY_DSN).
- Establish staging vs production config differences.

4. Implement health checks.
- Spec /health (liveness: HTTP 200 if alive) and /ready (readiness: HTTP 200 if DB pool responsive, returns version/uptime).
- These don't exist yet in server/index.ts.

5. Design deployment and secrets strategy.
- Fix SESSION_SECRET default value risk.
- Address VAPID keys in .replit [userenv.shared].
- Design secrets management with env var validation at startup.
- Create deployment runbook with rollback steps.

## Output Contract

Return:
- Updated quality.yml specification with JS + Python stages
- Dockerfile and docker-compose.yml specifications
- Environment variable audit and secrets migration plan
- Health check endpoint specification
- Deployment runbook with rollback procedures

## Resources

- `scripts/generate_infra_audit.py` creates an infrastructure readiness template.
- `references/ci-pipeline-checklist.md` provides CI stage requirements.
- `references/deployment-runbook.md` provides deployment and rollback procedures.
