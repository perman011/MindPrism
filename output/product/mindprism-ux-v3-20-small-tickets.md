# V3 Ticket Backlog (20)

1. `MPV3-001` (P0): Replace dashboard logo asset with transparent pen icon.
Acceptance: header icon has no hard background tile in light/dark.

2. `MPV3-002` (P0): Standardize dashboard brand wordmark to lowercase `mindprism`.
Acceptance: exact casing appears in header.

3. `MPV3-003` (P0): Increase logo lockup visual size.
Acceptance: icon >= 40px, wordmark >= 18px.

4. `MPV3-004` (P0): Add theme-aware brand contrast tokens.
Acceptance: brand lockup passes contrast in light/dark.

5. `MPV3-005` (P0): Add URL sanity guard helper for media rendering.
Acceptance: malformed URLs are treated as missing media.

6. `MPV3-006` (P0): Add short thumbnail card fallback in `ShortCard`.
Acceptance: no broken image icon on thumbnail load failure.

7. `MPV3-007` (P0): Add shorts-player image fallback for invalid media.
Acceptance: gradient/thumbnail fallback shown when media fails.

8. `MPV3-008` (P0): Add video `poster` and playback error fallback.
Acceptance: thumbnail shown if video cannot load.

9. `MPV3-009` (P0): Add audio short URL validation before player mount.
Acceptance: invalid audio URLs do not mount broken audio element.

10. `MPV3-010` (P0): Add dashboard shorts-mode preview URL fallback logic.
Acceptance: preview uses thumbnail/media if valid, else gradient.

11. `MPV3-011` (P0): Add book cover fallback logic in `BookCard`.
Acceptance: fallback card shown on invalid/failed cover URL.

12. `MPV3-012` (P0): Add dashboard Jump Back In cover fallback.
Acceptance: no broken image icon in resume rail.

13. `MPV3-013` (P0): Add dashboard Chakra rail cover fallback.
Acceptance: no broken image icon in chakra-filtered books.

14. `MPV3-014` (P0): Expand upload allowlist to browser-safe video formats.
Acceptance: MOV/M4V uploads accepted and persisted.

15. `MPV3-015` (P0): Remove non-browser-safe image formats from upload allowlist.
Acceptance: unsupported formats rejected with clear error.

16. `MPV3-016` (P0): Implement HTTP byte-range support in object streaming.
Acceptance: media seek/playback works for uploaded assets.

17. `MPV3-017` (P1): Add server validation for published shorts media contract.
Acceptance: published image/audio/video shorts require media URL; audio/video require thumbnail.

18. `MPV3-018` (P1): Add onboarding visual/token parity pass for dark-purple spec.
Acceptance: onboarding pages use V3 semantic tokens.

19. `MPV3-019` (P1): Create E2E suite for upload->publish->render pipeline.
Acceptance: CI catches media rendering regressions.

20. `MPV3-020` (P1): Add release gate checklist and go/no-go policy.
Acceptance: deployment blocked unless all P0 checks pass.
