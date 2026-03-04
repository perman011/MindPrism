# MindPrism RCA V4: Media/Logo Rendering Regressions

## Incident Summary
User-facing dashboard showed:
1. Book covers not rendering (`Jump Back In`, `All Books` placeholders).
2. Shorts image/video previews not rendering reliably.
3. Header logo using wrong asset variant.

## Impact
- Core content cards looked broken or generic.
- Trust and perceived quality degraded.
- Admins could upload assets but users still saw fallbacks.

## Root Causes
1. **Wrong logo asset selection**
- Dashboard imported a non-target logo variant.
- Result: brand mismatch (non-pen or non-transparent behavior).

2. **Legacy path drift in persisted media URLs**
- Older records stored `/uploads/...` while frontend expected `/objects/uploads/...`.
- Result: media requests resolved to non-serving paths, causing 404/blank loads.

3. **Preview source logic gap for shorts**
- Card preview flow favored `thumbnailUrl` and gradient fallback.
- For image shorts without valid thumbnail but valid `mediaUrl`, previews were not used.

4. **Rendering resilience gap**
- Some components had `img` tags without unified URL normalization and consistent fallback.
- Result: broken-image behavior or invisible media in key rails.

5. **Media delivery protocol gap (historical)**
- Object streaming initially lacked byte-range support.
- Result: browser playback/seek issues for audio/video in some clients.

## Contributing Factors
- No automated contract check for media URL shape.
- No migration/normalization guard for old records at read/write boundaries.
- Incomplete E2E coverage for upload->publish->dashboard render pipeline.

## Corrective Actions Implemented (Code)
1. Added URL normalization/fallback logic in dashboard/book/short rendering paths.
2. Normalized legacy media paths during short payload processing.
3. Updated dashboard header to pen-logo + lowercase brand presentation.
4. Added fallback behavior for media load failure.
5. Added range-capable object streaming path for media playback reliability.

## Preventive Actions
1. Enforce canonical media path contract (`/objects/uploads/...`) at API boundary.
2. Add CI E2E suite for upload/publish/render across image/audio/video.
3. Add data-quality job to detect/fix stale media paths.
4. Add release gates requiring P0 media checks to pass before deploy.
