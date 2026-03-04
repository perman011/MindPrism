# TPM Delivery Backlog V4 (20 Tickets)

## P0 (Correctness)
1. `MPV4-001` Standardize dashboard brand lockup asset and casing.
Acceptance: header shows pen logo + `mindprism` on light/dark.

2. `MPV4-002` Introduce shared `resolveMediaUrl()` utility in client.
Acceptance: handles `/uploads/...`, `/objects/uploads/...`, absolute URLs.

3. `MPV4-003` Apply media URL normalization in `BookCard`.
Acceptance: valid covers render, invalid fall back safely.

4. `MPV4-004` Apply media URL normalization in shorts card components.
Acceptance: image short preview renders from thumbnail or image media.

5. `MPV4-005` Apply media normalization in dashboard rails.
Acceptance: `Jump Back In`, `All Books`, quick-bites no broken icons.

6. `MPV4-006` Enforce canonical media paths at short create/update API.
Acceptance: `/uploads/...` rewritten to `/objects/uploads/...` server-side.

7. `MPV4-007` Enforce publish validation by media type.
Acceptance: image/audio/video require media; audio/video require thumbnail.

8. `MPV4-008` Add byte-range support for object media responses.
Acceptance: browser seek/play works for uploaded audio/video.

9. `MPV4-009` Add image onError fallback behavior for all user-facing cards.
Acceptance: fallback visuals appear on load failure.

10. `MPV4-010` Add admin short list preview logic parity with user cards.
Acceptance: admin preview reflects same source/fallback rules.

## P1 (Architecture + Quality)
11. `MPV4-011` Create media contract schema test suite.
Acceptance: validates allowed URL shapes and normalization outcomes.

12. `MPV4-012` Add E2E test: upload image short -> publish -> dashboard render.
Acceptance: CI fails if preview missing.

13. `MPV4-013` Add E2E test: upload video+thumbnail -> publish -> player render.
Acceptance: CI fails on playback/poster regression.

14. `MPV4-014` Add E2E test: upload audio+thumbnail -> publish -> player render.
Acceptance: CI fails on audio/thumbnail regression.

15. `MPV4-015` Add E2E test: legacy `/uploads/...` record renders after normalization.
Acceptance: CI validates backward compatibility.

16. `MPV4-016` Add monitoring metric: media render failure rate by component.
Acceptance: dashboard panel available for ops.

17. `MPV4-017` Add data-quality job to detect orphaned media paths/objects.
Acceptance: daily report with remediation list.

## P2 (Ops + Rollout)
18. `MPV4-018` Add feature flag for UX/media stack rollout.
Acceptance: can disable new path logic without redeploy.

19. `MPV4-019` Publish runbook for media incident triage.
Acceptance: includes playbook and rollback steps.

20. `MPV4-020` Add release gate policy in CI (block on P0 test failure).
Acceptance: merge blocked when any P0 check fails.
