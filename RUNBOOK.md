# Runbook

## Purpose
Operate and troubleshoot the notebook-based task analysis workflow in production-like usage.

## Standard Run

1. Open `output/jupyter-notebook/task-notebook.ipynb`.
2. Update `raw_items`.
3. Run all cells top-to-bottom.
4. Confirm `summary` output and `output/artifacts/summary.json` generation.

## Pre-merge Quality Gate

Run locally before opening a PR:

```bash
python3 -m unittest discover -s tests -v
python3 scripts/notebook_smoke_test.py
```

## Repository Backup

Use GitHub as the primary remote copy of the repository. For a point-in-time local backup from a clone, create a bundle file and store or upload that file manually:

```bash
git bundle create "$HOME/Desktop/MindPrism-$(date +%Y-%m-%d).bundle" --all
```

Google Drive uploads via service account are not a supported backup path for this repository. If Drive automation is needed later, use OAuth or a Shared Drive.

## Validation Rules

- Missing required fields fail fast.
- Numeric strings are allowed when `coerce_numeric=True`.
- Negative or non-finite values are rejected.

## Common Failures

### `ValueError: Input validation failed`
Cause: Invalid `raw_items` row.
Action: Fix row schema and numeric values.

### Smoke test mismatch on summary values
Cause: Deterministic baseline input changed.
Action: If intended, update expected values in `scripts/notebook_smoke_test.py` and tests.

### Import error for `task_analysis`
Cause: Notebook started from unusual working directory.
Action: Restart kernel and rerun setup cell (it searches parent directories for repo root).

## Incident Workflow

1. Reproduce with current `raw_items`.
2. Capture failing row and stack trace.
3. Create a data-quality issue via `.github/ISSUE_TEMPLATE/bug-data-quality.yml`.
4. Add regression test in `tests/test_core.py` before shipping fix.
