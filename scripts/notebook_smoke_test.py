from __future__ import annotations

import json
from pathlib import Path


NOTEBOOK_PATH = Path("output/jupyter-notebook/task-notebook.ipynb")
ARTIFACT_PATH = Path("output/artifacts/summary.json")
EXPECTED_SUMMARY = {
    "count": 3,
    "total_estimate_hours": 5.5,
    "total_actual_hours": 5.7,
    "variance_hours": 0.2,
    "avg_delta_per_item": 0.07,
    "largest_positive_delta_step": "Plan",
    "largest_positive_delta_hours": 0.5,
}


def main() -> None:
    notebook = json.loads(NOTEBOOK_PATH.read_text(encoding="utf-8"))

    namespace: dict[str, object] = {"__name__": "__main__"}
    for cell in notebook["cells"]:
        if cell.get("cell_type") != "code":
            continue
        source = "".join(cell.get("source", []))
        if not source.strip():
            continue
        exec(source, namespace, namespace)

    summary = namespace.get("summary")
    if not isinstance(summary, dict):
        raise AssertionError("Notebook execution did not produce a dict named 'summary'.")

    if summary != EXPECTED_SUMMARY:
        raise AssertionError(
            "Notebook summary did not match expected deterministic contract. "
            f"Expected {EXPECTED_SUMMARY}, got {summary}."
        )

    if not ARTIFACT_PATH.exists():
        raise AssertionError(f"Expected artifact was not created: {ARTIFACT_PATH}")

    artifact = json.loads(ARTIFACT_PATH.read_text(encoding="utf-8"))
    if artifact != summary:
        raise AssertionError("Artifact content does not match in-memory summary.")

    print("Notebook smoke test passed.")


if __name__ == "__main__":
    main()
