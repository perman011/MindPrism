# MindPrism Remediation Plan: Billing + Audio + RBAC Restricted-Side Signoff

Date: 2026-03-04  
Status: Draft for execution  
Target: Move from **Conditional Go** to **Full Green Signoff**

## 1) Scope and Goal

Close the remaining release blockers called out in QA:

1. Billing lifecycle is not fully validated end-to-end from restricted-side user states.
2. Audio journey is not fully validated because test data and negative-path checks are incomplete.
3. RBAC and premium-gated restricted-side behavior lacks full negative-path verification and route-level hardening.

## 2) Current Gaps (From Existing QA Evidence)

1. Billing:
- Stripe status and portal presence are validated, but free-user checkout lifecycle and webhook-driven state transitions are not fully proven in QA.

2. Audio:
- Core media path is functional, but complete audio journey is blocked by missing audio-rich fixture data and negative-path coverage.

3. RBAC restricted-side:
- Admin and super-admin paths are tested from privileged side, but restricted-side behavior (free/customer/writer/editor deep links and forbidden actions) is not fully exercised.

## 3) Chunked Execution Plan

## Chunk 0: Baseline Freeze and Test Data Contract (Day 0)

Owners: `TPM`, `QA`, `OPS`  
Objective: Remove ambiguity before code changes.

Deliverables:
- Lock explicit pass criteria for Billing, Audio, and RBAC in one checklist.
- Define required test personas:
  - `customer_free`
  - `customer_premium`
  - `writer`
  - `editor`
  - `admin`
  - `super_admin`
- Define required media fixtures:
  - One published book with valid `audioUrl`
  - One published short per type: `image`, `audio`, `video`
  - One intentionally missing/broken media URL fixture

Exit criteria:
- QA can run all blocked cases without manual improvisation.

---

## Chunk 1: Billing Lifecycle Hardening (Day 1-2)

Owners: `BE`, `OPS`, `QA`  
Primary files:
- `server/stripe-routes.ts`
- `shared/models/auth.ts`
- `server/replit_integrations/auth/storage.ts`

Implementation tasks:
1. Add full Stripe lifecycle handling:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

2. Make webhook handling idempotent:
- Persist processed Stripe event IDs and skip duplicates safely.

3. Normalize entitlement updates:
- Update `isPremium`, `stripeSubscriptionId`, and `currentPeriodEnd` from webhook source of truth.
- Ensure downgrade paths are deterministic on cancellation/failure.

4. Add billing observability:
- Structured logs for event receipt, signature failure, idempotent skip, and entitlement mutation results.

Test tasks:
1. Add automated API tests for each lifecycle event with replay tests.
2. Add staging runbook for Stripe test mode end-to-end:
- free user checkout -> premium entitlement
- portal cancellation -> entitlement removal at expected state boundary

Exit criteria:
- Billing lifecycle matrix is green for both positive and negative paths.

---

## Chunk 2: Audio End-to-End Reliability and Negative Paths (Day 2-3)

Owners: `FE`, `BE`, `QA`  
Primary files:
- `client/src/lib/audio-context.tsx`
- `client/src/pages/audio.tsx`
- `client/src/pages/chapter-reader.tsx`
- `server/admin-routes.ts`

Implementation tasks:
1. Add publish-time media integrity checks:
- Reject publish when required media object does not exist.
- Keep current URL normalization behavior.

2. Improve user-facing failure states:
- Player-level error UI when media returns 404/403.
- Loading state in chapter reader during audio hydrate to remove blank flash.

3. Validate range-seek behavior on real audio fixtures:
- Confirm seek, pause/resume, and background playback state consistency.

Test tasks:
1. Add E2E audio journey:
- discover/listen entry
- play/pause/seek
- audio short playback
- missing-media fallback behavior

Exit criteria:
- Audio journey is fully testable and green with real fixtures and broken-media fallback checks.

---

## Chunk 3: RBAC Restricted-Side and Premium-Gating Enforcement (Day 3-4)

Owners: `SEC`, `BE`, `FE`, `QA`  
Primary files:
- `client/src/App.tsx`
- `client/src/components/admin/AdminLayout.tsx`
- `server/admin-routes.ts`
- `server/routes.ts`
- `shared/schema.ts` (if premium content flags are formalized)

Implementation tasks:
1. Enforce route-level RBAC on client for deep links:
- `/admin/users` -> `admin`+
- `/admin/analytics` -> `admin`+
- return explicit access-denied view, not generic runtime error

2. Validate server-side RBAC matrix for all admin endpoints:
- `401` unauthenticated
- `403` insufficient role
- `200` authorized role

3. Close premium restricted-side gap:
- Align schema + API behavior for premium content access.
- If `premiumOnly`/preview behavior is required, enforce on server responses (not UI-only gating).

Test tasks:
1. Add role-matrix API tests across personas.
2. Add E2E deep-link tests for restricted users.
3. Add premium/free behavior tests for gated content access.

Exit criteria:
- Restricted-side RBAC and premium gating are validated with hard pass/fail evidence.

---

## Chunk 4: CI Release Gate Upgrade (Day 4)

Owners: `OPS`, `QA`, `RM`  
Primary files:
- `.github/workflows/*`
- `output/qa/mindprism-ux-v3-e2e-matrix.md`
- `output/qa/mindprism-ux-v3-release-gate-report.md`

Tasks:
1. Split CI quality gates:
- `gate-billing`
- `gate-audio`
- `gate-rbac`

2. Fail release on:
- Any P0/P1 defect in those suites
- Any missing required fixture/persona in staging test run

3. Publish machine-readable gate summary artifact per run.

Exit criteria:
- No manual interpretation required for go/no-go on these three domains.

## 4) Ticket Backlog (Priority Order)

1. P0: Stripe webhook lifecycle + idempotency implementation and tests.
2. P0: Audio fixture seeding and E2E playback/seek suite.
3. P0: RBAC role-matrix API and deep-link E2E tests.
4. P1: Chapter reader loading state improvement.
5. P1: Premium restricted-side server-enforced gating alignment.
6. P1: CI gates and release packet automation.

## 5) Definition of Done (Full Green Signoff)

All are required:

1. Billing matrix fully green for create, renew/update, cancel, payment-failed, recovery.
2. Audio matrix fully green for valid and broken media paths.
3. RBAC restricted-side matrix fully green for unauthenticated + all role personas.
4. Premium gating proven from restricted-side tests (server enforced).
5. CI shows explicit green gates for billing/audio/RBAC with artifacts attached.
6. Release manager publishes final go/no-go packet with zero open P0/P1 in these domains.
