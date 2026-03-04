# TPM PRD V4: Dark-Purple UX + Media Reliability Program

## 1. Objective
Ship a production-ready onboarding/dashboard UX refresh while eliminating media rendering defects identified in RCA V4.

## 2. Scope
### In scope
1. Onboarding + dashboard visual/system updates.
2. Brand lockup standardization (pen logo, lowercase `mindprism`).
3. Media URL contract normalization and reliable rendering.
4. Upload->publish->render reliability hardening.
5. Quality gates + E2E release controls.

### Out of scope
1. Admin IA redesign.
2. Billing/subscription redesign.
3. Mobile native app.

## 3. Problem Statement
Current product exhibits inconsistent branding and intermittent rendering failures for book covers and shorts media. These are caused by asset selection drift, URL contract drift, preview logic gaps, and insufficient automated gates.

## 4. Requirements
### Functional
1. Dashboard/header must use pen logo with lowercase `mindprism` and theme-aware visibility.
2. Frontend must resolve legacy `/uploads/...` and canonicalize to `/objects/uploads/...`.
3. Shorts previews must use `thumbnailUrl` first, then image `mediaUrl` when applicable.
4. Book cards must render covers when valid and gracefully fallback when invalid.
5. Publish validation must enforce media requirements by short type.
6. Media streaming must support range requests for browser playback/seek.

### Non-functional
1. No broken-image icons in key user rails.
2. P75 dashboard FMP <= 2.5s.
3. Accessibility AA in onboarding/dashboard.
4. Full E2E gate for media critical path.

## 5. Success Metrics
1. Media render success rate in dashboard rails >= 99.5%.
2. Shorts player start success >= 99%.
3. Onboarding completion +10% from baseline.
4. Release gate pass rate 100% for P0 checks.

## 6. Delivery Strategy
1. P0 correctness and media reliability.
2. P1 architecture hardening + observability.
3. P2 polish and ops automation.

## 7. Risks
1. Legacy data still pointing to deleted objects.
2. CDN/object cache staleness after path fixes.
3. Feature regression from broad UI refactor.

## 8. Mitigations
1. Read/write normalization + fallback rendering.
2. CI E2E contract tests.
3. Release gate with rollback switch.
