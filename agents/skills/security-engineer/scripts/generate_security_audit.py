#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate security audit template.")
    parser.add_argument("--scope", default="full", help="Audit scope: full or api-only")
    parser.add_argument("--out", default="output/security/security-audit.md")
    args = parser.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    sections = [
        ("OWASP Top 10 Compliance Matrix", _owasp_matrix()),
        ("Input Validation Audit", _input_validation_audit(args.scope)),
        ("Session Security Audit", _session_security_audit()),
        ("Secrets Audit", _secrets_audit()),
    ]

    lines = [f"# Security Audit Report\n", f"**Scope:** {args.scope}\n"]
    for title, body in sections:
        lines.append(f"\n## {title}\n")
        lines.append(body)

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


def _owasp_matrix() -> str:
    rows = [
        ("A01", "Broken Access Control", "Critical", ""),
        ("A02", "Cryptographic Failures", "High", ""),
        ("A03", "Injection", "Medium", ""),
        ("A04", "Insecure Design", "Medium", ""),
        ("A05", "Security Misconfiguration", "High", ""),
        ("A06", "Vulnerable Components", "Medium", ""),
        ("A07", "Auth Failures", "Medium", ""),
        ("A08", "Data Integrity Failures", "Medium", ""),
        ("A09", "Logging Failures", "High", ""),
        ("A10", "SSRF", "Low", ""),
    ]
    header = "| ID | Category | Risk | Status | Remediation |\n"
    sep = "|----|----------|------|--------|-------------|\n"
    body = ""
    for row in rows:
        body += f"| {row[0]} | {row[1]} | {row[2]} | {row[3]} | |\n"
    return header + sep + body


def _input_validation_audit(scope: str) -> str:
    if scope == "api-only":
        components = [
            "API route handlers (routes.ts)",
            "Admin route handlers (admin-routes.ts)",
            "Stripe webhook handlers (stripe-routes.ts)",
        ]
    else:
        components = [
            "Book descriptions (user-supplied HTML)",
            "Chapter cards (JSONB content)",
            "Comments (user text input)",
            "Journal entries (encrypted content)",
            "Mental model steps (structured JSONB)",
            "Admin content uploads (file + metadata)",
            "API route handlers (routes.ts)",
            "Admin route handlers (admin-routes.ts)",
            "Stripe webhook handlers (stripe-routes.ts)",
        ]
    header = "| Component | Server Sanitized | Client Sanitized | Status |\n"
    sep = "|-----------|-----------------|-----------------|--------|\n"
    body = ""
    for comp in components:
        body += f"| {comp} | | | |\n"
    return header + sep + body


def _session_security_audit() -> str:
    checks = [
        "CSRF tokens on state-mutating endpoints",
        "Session cookie HttpOnly flag",
        "Session cookie Secure flag",
        "Session cookie SameSite attribute",
        "Session ID regeneration on login",
        "Session expiry configuration",
        "SESSION_SECRET rotated from default",
    ]
    header = "| Check | Status | Notes |\n"
    sep = "|-------|--------|-------|\n"
    body = ""
    for check in checks:
        body += f"| {check} | | |\n"
    return header + sep + body


def _secrets_audit() -> str:
    secrets = [
        ("SESSION_SECRET", "express-session", "Likely default value"),
        ("VAPID_PUBLIC_KEY", ".replit userenv.shared", "Exposed in shared env"),
        ("VAPID_PRIVATE_KEY", ".replit userenv.shared", "Exposed in shared env"),
        ("DATABASE_URL", "Environment variable", "Verify not in source"),
        ("STRIPE_SECRET_KEY", "Environment variable", "Verify scoped permissions"),
        ("STRIPE_WEBHOOK_SECRET", "Environment variable", "Verify endpoint signature"),
    ]
    header = "| Secret | Location | Risk | Rotation Plan |\n"
    sep = "|--------|----------|------|---------------|\n"
    body = ""
    for name, location, risk in secrets:
        body += f"| {name} | {location} | {risk} | |\n"
    return header + sep + body


if __name__ == "__main__":
    main()
