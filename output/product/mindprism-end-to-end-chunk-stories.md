# Mind Prism End-to-End Chunk Stories

Updated: 2026-03-04

## Goal
Stabilize admin and user portals end-to-end, with immediate focus on media reliability (image rendering, audio playback, shorts video playback), then drive UX/product vision improvements.

## Chunk 0 - Baseline and Failure Mapping (P0)
Owner: `QA` + `ARCH`

Story:
- As a team, we need a reproducible baseline for admin upload -> publish -> user playback so we can isolate where media breaks.

Definition of done:
- Capture failures for: book cover image, chapter audio, book audio, short image, short audio, short video.
- Map each failure to layer: upload, stored URL, API payload, frontend resolution, browser playback.

## Chunk 1 - Canonical Media URL Contract (P0)
Owner: `BE` + `FE`

Story:
- As a user/admin, all media URLs should render from one canonical path contract so legacy paths never break playback.

Definition of done:
- Canonical contract: `/objects/uploads/...`
- Legacy values (`/uploads/...`, `uploads/...`) are normalized at read/write boundaries.
- User and admin views consume normalized URLs consistently.

## Chunk 2 - Audio Playback Recovery (P0)
Owner: `FE`

Story:
- As a user, when I tap Listen/Play, real audio should play, seek, and pause across mini/full player surfaces.

Definition of done:
- Global audio context binds to an actual audio element/source.
- Play/pause/seek/speed/time updates are synchronized with UI state.
- Book and chapter audio URLs resolve through canonical media normalization.

## Chunk 3 - Shorts Media Reliability (P0)
Owner: `FE` + `BE`

Story:
- As a user, shorts with image/audio/video media should display and play correctly with thumbnail fallback when needed.

Definition of done:
- Image shorts render media directly.
- Audio shorts play with visible progress/timing.
- Video shorts autoplay/mute/seek with fallback poster on errors.
- Admin short preview path mirrors user render rules.

## Chunk 4 - Admin Upload and Publish Guardrails (P1)
Owner: `SEC` + `BE` + `QA`

Story:
- As an admin, uploads and publish validation should prevent invalid media states from reaching production.

Definition of done:
- Upload API enforces allowed types/size and returns canonical URLs.
- Publish rules block incomplete media payloads for required types.
- Errors are actionable in admin UI.

## Chunk 5 - UX Vision Functions (P1)
Owner: `UX`

Story:
- As a user, I want a premium and emotionally resonant experience while media is reliable and fast.

Definition of done:
- UX concept pack for onboarding, dashboard, shorts, and audio immersion states.
- Clear state design for loading, buffering, failed media, retry, and offline.
- Prioritized “visionary functions” list with implementation notes.

## Chunk 6 - Product Story Pack and Execution Plan (P1)
Owner: `TPM`

Story:
- As a delivery team, we need short, shippable product stories with dependencies and acceptance criteria.

Definition of done:
- 10-20 short tickets grouped by wave.
- Explicit dependencies across BE/FE/QA/OPS.
- Release gate checklist with go/no-go criteria for media reliability.

## Chunk 7 - End-to-End Release Gate (P0)
Owner: `QA` + `RM` + `OPS`

Story:
- As a release owner, I need deterministic E2E evidence that media-critical flows are green before production.

Definition of done:
- Green gate for admin upload -> publish -> user render/playback across image/audio/video.
- Performance and security gates included in release packet.
- Final go/no-go recommendation documented.
