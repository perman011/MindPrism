#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate infrastructure readiness template.")
    parser.add_argument("--system", default="mindprism", help="System name for the audit report")
    parser.add_argument("--out", default="output/devops/infra-audit.md")
    args = parser.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    sections = [
        ("CI Pipeline Status", _ci_pipeline_status()),
        ("Docker Readiness", _docker_readiness()),
        ("Environment Config", _environment_config()),
        ("Health Checks", _health_checks()),
        ("Secrets Management", _secrets_management()),
        ("Deployment Strategy", _deployment_strategy()),
    ]

    lines = [f"# Infrastructure Readiness Audit -- {args.system}\n"]
    for title, body in sections:
        lines.append(f"\n## {title}\n")
        lines.append(body)

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


def _ci_pipeline_status() -> str:
    return """- [ ] JavaScript quality gate exists (tsc --noEmit, npm run build)
- [ ] Python quality gate exists (unittest discover, notebook smoke)
- [ ] ESLint configured and running in CI
- [ ] npm audit integrated into pipeline
- [ ] Branch protection rules enforced
- [ ] Caching configured for node_modules and pip
- [ ] CI runs on pull request and push to main
- **Status:** Ready / Partial / Missing
- **Notes:**
"""


def _docker_readiness() -> str:
    return """- [ ] Dockerfile exists with multi-stage build
- [ ] docker-compose.yml defines app + database services
- [ ] .dockerignore excludes node_modules, .git, .env
- [ ] Build produces correct artifact (dist/index.cjs)
- [ ] Container runs without Replit dependencies
- [ ] Image size optimized (< 500MB production image)
- [ ] Container health check configured
- **Status:** Ready / Partial / Missing
- **Notes:**
"""


def _environment_config() -> str:
    rows = [
        ("DATABASE_URL", "Required", ""),
        ("SESSION_SECRET", "Required", "Must not be default value"),
        ("STRIPE_SECRET_KEY", "Required", ""),
        ("STRIPE_PUBLISHABLE_KEY", "Required", ""),
        ("STRIPE_WEBHOOK_SECRET", "Required", ""),
        ("VAPID_PUBLIC_KEY", "Required", "Must move out of .replit"),
        ("VAPID_PRIVATE_KEY", "Required", "Must move out of .replit"),
        ("SENTRY_DSN", "Optional", ""),
        ("NODE_ENV", "Required", "production or staging"),
        ("PORT", "Optional", "Defaults to 5000"),
    ]
    header = "| Variable | Required | Status | Notes |\n"
    sep = "|----------|----------|--------|-------|\n"
    body = ""
    for name, required, notes in rows:
        body += f"| {name} | {required} | | {notes} |\n"
    return header + sep + body + "\n- **Staging vs Production differences documented:** Yes / No\n"


def _health_checks() -> str:
    return """- [ ] GET /health endpoint exists (liveness)
- [ ] Returns HTTP 200 when application is alive
- [ ] GET /ready endpoint exists (readiness)
- [ ] Returns HTTP 200 when DB pool is responsive
- [ ] Returns version and uptime in response body
- [ ] Health checks excluded from rate limiting
- [ ] Health checks excluded from authentication
- **Status:** Ready / Partial / Missing
- **Notes:**
"""


def _secrets_management() -> str:
    return """- [ ] SESSION_SECRET rotated from default value
- [ ] VAPID keys removed from .replit [userenv.shared]
- [ ] All secrets stored in secure environment variables
- [ ] No secrets committed to version control
- [ ] Env var validation at application startup
- [ ] Secret rotation schedule documented
- [ ] .env.example template maintained (no real values)
- **Status:** Ready / Partial / Missing
- **Notes:**
"""


def _deployment_strategy() -> str:
    return """- [ ] Deployment runbook documented
- [ ] Rollback procedure tested
- [ ] Database migration strategy defined (push vs migrate)
- [ ] Zero-downtime deployment possible
- [ ] Deployment notifications configured
- [ ] Post-deployment smoke tests automated
- [ ] Monitoring and alerting in place
- **Status:** Ready / Partial / Missing
- **Notes:**
"""


if __name__ == "__main__":
    main()
