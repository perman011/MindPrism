# Task Notebook Analysis

Notebook-first project for analyzing estimate-vs-actual task effort with validated inputs, deterministic summary output, and CI quality gates.

## Production Contracts

### Input schema v1
`raw_items` must be a list of dictionaries with:
- `name`: non-empty string
- `estimate_hours`: number (or numeric string if coercion enabled), `>= 0`
- `actual_hours`: number (or numeric string if coercion enabled), `>= 0`

### Summary schema v1
The generated `summary` contains:
- `count`
- `total_estimate_hours`
- `total_actual_hours`
- `variance_hours`
- `avg_delta_per_item`
- `largest_positive_delta_step` (nullable)
- `largest_positive_delta_hours` (nullable)

### Artifact contract
Each notebook execution writes JSON to `output/artifacts/summary.json`.

## Local Setup

1. Create a Python 3.12 environment.
2. Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

## Run Checks

```bash
python3 -m unittest discover -s tests -v
python3 scripts/notebook_smoke_test.py
```

## Notebook

Notebook path: `output/jupyter-notebook/task-notebook.ipynb`

Run top-to-bottom. It validates `raw_items`, computes summary metrics, prints takeaways, and writes the summary artifact.

## Project Structure

- `task_analysis/core.py`: validation, analysis, takeaways, artifact writer
- `tests/test_core.py`: unit tests for correctness and edge cases
- `scripts/notebook_smoke_test.py`: deterministic notebook execution check
- `.github/workflows/quality.yml`: CI quality gate
- `RUNBOOK.md`: operations and troubleshooting
