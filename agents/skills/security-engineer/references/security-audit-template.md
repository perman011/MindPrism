# Security Audit Template

## Audit Metadata

- **Application:** MindPrism
- **Audit Date:**
- **Auditor:**
- **Scope:**
- **Version / Commit:**

---

## 1. Scope

- [ ] Define in-scope components (API, frontend, admin, webhooks)
- [ ] Define out-of-scope components
- [ ] Identify environments under test (production, staging, development)
- **Status:** Pass / Fail / N/A
- **Risk Rating:** Critical / High / Medium / Low / None
- **Notes:**

## 2. Authentication Review

- [ ] Password policy enforced (length, complexity)
- [ ] Brute-force protection (rate limiting on auth endpoints)
- [ ] Account lockout after repeated failures
- [ ] Session ID regenerated on login
- [ ] Multi-factor authentication available
- [ ] Default credentials removed
- **Status:** Pass / Fail / N/A
- **Risk Rating:** Critical / High / Medium / Low / None
- **Notes:**

## 3. Authorization Review

- [ ] Role-based access control enforced on all endpoints
- [ ] Admin endpoints require isAdmin middleware
- [ ] Resource ownership validated (users can only access own data)
- [ ] Horizontal privilege escalation tested
- [ ] Vertical privilege escalation tested
- **Status:** Pass / Fail / N/A
- **Risk Rating:** Critical / High / Medium / Low / None
- **Notes:**

## 4. Input Validation Review

- [ ] All user inputs validated on server side
- [ ] JSONB fields schema-validated before storage
- [ ] File uploads restricted by type and size
- [ ] SQL injection tested (Drizzle ORM parameterization verified)
- [ ] NoSQL / JSONB injection tested
- [ ] Path traversal tested on file endpoints
- **Status:** Pass / Fail / N/A
- **Risk Rating:** Critical / High / Medium / Low / None
- **Notes:**

## 5. Output Encoding Review

- [ ] DOMPurify applied to all user-generated content rendering
- [ ] Components audited: book descriptions, chapter cards, comments, journal entries, mental model steps
- [ ] Server-rendered content escaped properly
- [ ] Content-Type headers set correctly on API responses
- [ ] Reflected XSS tested on search and query parameters
- **Status:** Pass / Fail / N/A
- **Risk Rating:** Critical / High / Medium / Low / None
- **Notes:**

## 6. Session Management Review

- [ ] Session cookies use HttpOnly, Secure, SameSite flags
- [ ] Session expiry configured appropriately
- [ ] Session fixation protection (regeneration on auth state change)
- [ ] Concurrent session limits evaluated
- [ ] CSRF tokens present on all state-mutating requests
- **Status:** Pass / Fail / N/A
- **Risk Rating:** Critical / High / Medium / Low / None
- **Notes:**

## 7. Error Handling Review

- [ ] No stack traces exposed in production responses
- [ ] Generic error messages returned to clients
- [ ] Errors logged server-side with context
- [ ] Custom error pages configured (404, 500)
- [ ] Sensitive data not leaked in error responses
- **Status:** Pass / Fail / N/A
- **Risk Rating:** Critical / High / Medium / Low / None
- **Notes:**

## 8. HTTPS / Transport Security

- [ ] TLS enforced on all endpoints
- [ ] Strict-Transport-Security header present
- [ ] Certificate validity and chain verified
- [ ] Mixed content eliminated
- [ ] Secure WebSocket (wss://) used where applicable
- **Status:** Pass / Fail / N/A
- **Risk Rating:** Critical / High / Medium / Low / None
- **Notes:**

## 9. Dependency Vulnerability Scan

- [ ] npm audit run with zero critical/high vulnerabilities
- [ ] Outdated packages identified and upgrade plan created
- [ ] Known CVEs checked against installed versions
- [ ] Lock file (package-lock.json) committed and consistent
- [ ] Automated dependency updates configured (Dependabot / Renovate)
- **Status:** Pass / Fail / N/A
- **Risk Rating:** Critical / High / Medium / Low / None
- **Notes:**

## 10. Secrets Management Audit

- [ ] No secrets in source code or version control
- [ ] SESSION_SECRET rotated from default value
- [ ] VAPID keys moved out of .replit userenv.shared
- [ ] Database credentials stored in secure env vars
- [ ] Stripe keys scoped to minimum required permissions
- [ ] Secret rotation schedule documented
- [ ] .env files excluded from Git via .gitignore
- **Status:** Pass / Fail / N/A
- **Risk Rating:** Critical / High / Medium / Low / None
- **Notes:**

---

## Summary

| Section | Status | Risk Rating |
|---------|--------|-------------|
| Scope | | |
| Authentication | | |
| Authorization | | |
| Input Validation | | |
| Output Encoding | | |
| Session Management | | |
| Error Handling | | |
| Transport Security | | |
| Dependency Scan | | |
| Secrets Management | | |

**Overall Risk Assessment:**

**Recommended Priority Actions:**
1.
2.
3.
