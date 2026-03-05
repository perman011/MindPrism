# MindPrism RCA + Remediation (Short Publish, Journal, Highlight)

**Date:** March 5, 2026  
**Branch:** `codex/e2e-media-chunks`

## Issue 1: Admin Shorts publish returns error

### Symptom
- Admin taps **Publish** on a short and gets error toast.

### Root Cause
- Publish validation logic was mixed between UI checks and route-level checks, with no single tested source of truth.
- For image shorts, publish behavior was inconsistent because validation logic treated media requirements too broadly in some flows.
- Storage existence checks were not isolated as a clearly testable contract for published media types.

### Evidence
- Publish validation logic lived inline inside `server/routes.ts` and changed across iterations.
- Existing gate tests did not cover short publish rules before this fix.
- New tests now codify expected behavior in `tests/gates/shorts-publish.test.ts`.

### Fix
- Extracted short publish normalization/validation into a dedicated module:
  - `server/shorts/publish-validation.ts`
- Server now uses that module as the single rule source:
  - `server/routes.ts`
- Rules now explicit:
  - Published `audio/video` require `mediaUrl` + `thumbnailUrl`.
  - Published `image` does not require media; if only thumbnail exists, it auto-fills `mediaUrl`.
- Added regression gate:
  - `tests/gates/shorts-publish.test.ts`

### Verification
- `npm run test:gate:shorts` passed.

---

## Issue 2: Journal flow appears non-functional

### Symptom
- Users report Journal entry does not seem to save/work reliably.

### Root Cause
- Server accepted raw string input but had weak normalization/validation (no dedicated parser), increasing risk of invalid/blank-equivalent payloads and inconsistent behavior.
- No dedicated gate test existed for journal payload parsing.

### Evidence
- Journal route previously validated only `z.string().min(1)` and directly encrypted submitted content in `server/routes.ts`.

### Fix
- Added dedicated user-content parser module:
  - `server/user-content/validation.ts`
- Journal route now uses normalized parser (`trim`) and rejects invalid payloads consistently:
  - `server/routes.ts`
- Added gate coverage:
  - `tests/gates/user-content.test.ts` (`parseJournalInput` cases)

### Verification
- `npm run test:gate:user-content` passed.

---

## Issue 3: Highlight save appears non-functional

### Symptom
- Users report highlights not saving/visible.

### Root Cause
- Highlight endpoint had minimal validation and no canonical payload normalization path.
- Invalid `bookId` could bubble into DB/route failures instead of deterministic validation errors.
- No explicit gate test existed for highlight payload normalization/rejection.

### Evidence
- Highlight route previously accepted unnormalized payload and inserted directly after minimal schema check.

### Fix
- Highlight parser now normalizes and validates:
  - trims `bookId`, normalizes `content`, defaults `type`.
- Highlight route now validates book existence before insert:
  - returns 400 (`Book not found for highlight`) instead of opaque failure.
- Added gate coverage:
  - `tests/gates/user-content.test.ts` (`parseHighlightInput` happy and reject paths)

### Verification
- `npm run test:gate:user-content` passed.

---

## CI/Gate Hardening Added

- Added npm scripts:
  - `test:gate:shorts`
  - `test:gate:user-content`
- Added to aggregate gate run:
  - `test:gates`
- Added separate GitHub Actions jobs:
  - `gate-shorts`
  - `gate-user-content`

Files:
- `package.json`
- `.github/workflows/quality.yml`

---

## End-to-End Technical Validation

- `npm run check` ✅
- `npm run test:gates` ✅
- `npm run build` ✅
