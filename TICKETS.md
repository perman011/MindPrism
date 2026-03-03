# Production Readiness Tickets

## PRD-001 (P0) - Fix empty-input crash
Status: Done
Scope: Guard analysis path for `items == []`; return zeroed summary and safe takeaways.
Acceptance criteria:
- [x] Empty dataset executes without exception.
- [x] `count=0` and `avg_delta_per_item=0.0`.
- [x] Takeaway explains no data.

## PRD-002 (P0) - Add strict input validation and normalization
Status: Done
Scope: Add validation function for required keys, numeric conversion, non-negative constraints, and clear error messages.
Acceptance criteria:
- [x] Invalid rows fail with actionable validation errors.
- [x] Valid string numerics can be coerced.
- [x] Behavior documented.

## PRD-003 (P0) - Implement real “largest positive delta” logic
Status: Done
Scope: Compute per-step deltas, identify max positive delta step, and conditionally render takeaway text.
Acceptance criteria:
- [x] Overrun step name and hours are reported when present.
- [x] Alternate message shown when no positive delta exists.

## PRD-004 (P1) - Separate business logic from notebook cells
Status: Done
Scope: Move core computation/validation into importable module.
Acceptance criteria:
- [x] Notebook imports and calls module functions.
- [x] Logic is centralized in Python module.

## PRD-005 (P1) - Define reproducible runtime
Status: Done
Scope: Add pinned dependencies and Python version policy for local + CI notebook execution.
Acceptance criteria:
- [x] Pinned dependencies in `requirements.txt` and `pyproject.toml`.
- [x] Python 3.12 policy defined.

## PRD-006 (P1) - Create unit tests for core logic
Status: Done
Scope: Add tests for normal, empty, invalid, coercion, and negative-value cases.
Acceptance criteria:
- [x] Core P0 behaviors covered in unit tests.
- [x] Summary schema artifact contract test added.

## PRD-007 (P1) - Add notebook execution smoke test
Status: Done
Scope: Add automated notebook run test that checks deterministic outputs and artifact content.
Acceptance criteria:
- [x] Test executes notebook top-to-bottom.
- [x] CI fails on execution or contract mismatch.

## PRD-008 (P1) - Configure GitHub Actions quality gate
Status: Done
Scope: CI workflow for setup, tests, and notebook smoke test.
Acceptance criteria:
- [x] Workflow added under `.github/workflows/quality.yml`.
- [x] Unit and smoke tests both run in CI.

## PRD-009 (P2) - Add output artifact contract
Status: Done
Scope: Persist analysis result to stable JSON artifact.
Acceptance criteria:
- [x] Notebook writes `output/artifacts/summary.json`.
- [x] Contract validated by tests.

## PRD-010 (P2) - Create operations/runbook documentation
Status: Done
Scope: README/runbook covering setup, execution, validation, and troubleshooting.
Acceptance criteria:
- [x] `README.md` and `RUNBOOK.md` added.

## PRD-011 (P2) - Add project hygiene templates
Status: Done
Scope: Add issue template and PR checklist.
Acceptance criteria:
- [x] Bug/data-quality issue template added.
- [x] PR template checklist added.
