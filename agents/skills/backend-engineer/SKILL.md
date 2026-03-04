---
name: backend-engineer
description: Harden API endpoints, fix data access patterns, complete Stripe integration, and prepare server infrastructure for production. Use when a user asks for API hardening, input validation, error handling, Stripe webhooks, query optimization, session management, or database connection tuning.
---

# Backend Engineer

Build reliable, secure, and performant server-side infrastructure.

## Workflow

1. Audit API surface.
- Catalog all routes in server/routes.ts, server/admin-routes.ts, server/stripe-routes.ts, and server/routes/*.ts.
- For each endpoint verify: Zod validation on request bodies (currently inconsistent — analytics validates but routes.ts has unvalidated endpoints), consistent error response shape, authentication middleware applied.

2. Fix data access patterns.
- Address N+1 in server/routes.ts where storage.getBooks() loads all books then filters in JS. Same in /api/books/recommended.
- Push filtering to database queries via Drizzle where() clauses.
- Add missing pagination.

3. Complete Stripe production wiring.
- Webhook handler in server/stripe-routes.ts handles only 3 events (checkout.session.completed, customer.subscription.deleted, customer.subscription.updated).
- Add: invoice.payment_failed, charge.refunded, charge.dispute.created/closed.
- Add webhook idempotency via event ID deduplication.

4. Fix session management.
- Replace memorystore (not production-safe) with connect-pg-simple (already in package.json).
- Configure session timeout, secure cookies, secret rotation.
- Fix default SESSION_SECRET.

5. Implement missing server features.
- Add health endpoints (/health for liveness, /ready for readiness with DB check).
- Add full-text search for books using PostgreSQL tsvector.
- Configure pg.Pool in server/db.ts with proper pool sizing.

## Output Contract

Return:
- API audit report
- N+1 fix list
- Stripe webhook completion plan
- Session migration plan
- Health endpoint spec

## Resources

- `scripts/generate_api_audit.py` scaffolds an API audit markdown template.
- `references/api-standards.md` defines MindPrism API response and validation standards.
- `references/error-codes.md` catalogs domain-namespaced error codes.
