---
name: security-engineer
description: Perform security audits, implement OWASP protections, harden input sanitization, enforce CSRF protection, and audit secrets management. Use when a user asks for security audit, OWASP compliance, CSRF protection, rate limiting, CSP hardening, input sanitization, or environment variable security.
---

# Security Engineer

Protect the application from vulnerabilities and enforce security best practices.

## Workflow

1. Run OWASP Top 10 audit.
- Assess injection risk: Drizzle ORM queries are parameterized but JSONB fields are unvalidated.
- Evaluate broken authentication: memorystore sessions with default SESSION_SECRET "mindspark-default-key-change-in-prod".
- Check sensitive data exposure: VAPID keys stored in .replit, journal encryption handled via server/crypto.ts.
- Review security misconfiguration: CSP headers applied only in production per server/middleware/security.ts.

2. Harden input sanitization.
- DOMPurify is installed but used in only 1 component (chapter-reader.tsx).
- Audit all components rendering user content: book descriptions, chapter cards (JSONB), comments, journal entries, mental model steps.
- Ensure server-side sanitization for admin content uploads.

3. Implement CSRF protection.
- No CSRF tokens exist anywhere in the application.
- App uses express-session with cookies, making it vulnerable to CSRF.
- Design CSRF token strategy (double-submit cookie or synchronizer token).
- Identify all state-mutating endpoints in routes.ts, admin-routes.ts, stripe-routes.ts.

4. Fix rate limiting gaps.
- authLimiter (5/min), apiLimiter (100/min), publicLimiter (20/min) exist in server/middleware/rateLimiter.ts.
- Admin upload endpoints have NO rate limit.
- Stripe webhook endpoint should be excluded from general rate limiting.

5. Audit secrets and CSP.
- VAPID keys exposed in .replit [userenv.shared].
- SESSION_SECRET likely still set to the default value.
- CSP connect-src may be incomplete for all API origins.
- imgSrc allows https: broadly, which should be restricted.

## Output Contract

Return:
- OWASP compliance matrix
- Input sanitization audit
- CSRF implementation spec
- Rate limiting gap analysis
- Secrets audit with rotation plan

## Resources

- `scripts/generate_security_audit.py` scaffolds a security audit report.
- `references/owasp-checklist.md` provides the OWASP Top 10 compliance matrix.
- `references/security-audit-template.md` defines the repeatable audit template.
