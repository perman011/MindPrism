from __future__ import annotations

import json
from pathlib import Path
import tempfile
import unittest

from task_analysis.core import (
    ValidationError,
    analyze_task_items,
    build_takeaways,
    parse_task_items,
    save_summary,
)


class TaskAnalysisTests(unittest.TestCase):
    def test_baseline_summary_matches_expected(self) -> None:
        raw_items = [
            {"name": "Plan", "estimate_hours": 1.5, "actual_hours": 2.0},
            {"name": "Implement", "estimate_hours": 3.0, "actual_hours": 2.5},
            {"name": "Validate", "estimate_hours": 1.0, "actual_hours": 1.2},
        ]
        items = parse_task_items(raw_items)
        summary = analyze_task_items(items)

        self.assertEqual(summary["count"], 3)
        self.assertEqual(summary["total_estimate_hours"], 5.5)
        self.assertEqual(summary["total_actual_hours"], 5.7)
        self.assertEqual(summary["variance_hours"], 0.2)
        self.assertEqual(summary["avg_delta_per_item"], 0.07)
        self.assertEqual(summary["largest_positive_delta_step"], "Plan")
        self.assertEqual(summary["largest_positive_delta_hours"], 0.5)

    def test_empty_input_returns_safe_summary_and_takeaways(self) -> None:
        items = parse_task_items([])
        summary = analyze_task_items(items)
        takeaways = build_takeaways(summary)

        self.assertEqual(summary["count"], 0)
        self.assertEqual(summary["avg_delta_per_item"], 0.0)
        self.assertIsNone(summary["largest_positive_delta_step"])
        self.assertIn("No task items were provided", takeaways[1])

    def test_missing_required_field_raises_validation_error(self) -> None:
        with self.assertRaises(ValidationError):
            parse_task_items([{"name": "Plan", "estimate_hours": 1.0}])

    def test_string_numeric_values_are_coerced_when_enabled(self) -> None:
        items = parse_task_items(
            [{"name": "Plan", "estimate_hours": "1.0", "actual_hours": "2.5"}],
            coerce_numeric=True,
        )
        summary = analyze_task_items(items)
        self.assertEqual(summary["variance_hours"], 1.5)

    def test_string_numeric_values_fail_when_coercion_disabled(self) -> None:
        with self.assertRaises(ValidationError):
            parse_task_items(
                [{"name": "Plan", "estimate_hours": "1.0", "actual_hours": "2.5"}],
                coerce_numeric=False,
            )

    def test_negative_values_are_rejected(self) -> None:
        with self.assertRaises(ValidationError):
            parse_task_items(
                [{"name": "Plan", "estimate_hours": -1.0, "actual_hours": 2.0}],
            )

    def test_no_positive_delta_takeaway(self) -> None:
        items = parse_task_items(
            [
                {"name": "Build", "estimate_hours": 2.0, "actual_hours": 1.5},
                {"name": "Test", "estimate_hours": 1.0, "actual_hours": 1.0},
            ]
        )
        summary = analyze_task_items(items)
        takeaways = build_takeaways(summary)

        self.assertIsNone(summary["largest_positive_delta_step"])
        self.assertIsNone(summary["largest_positive_delta_hours"])
        self.assertIn("No positive delta detected", takeaways[-1])

    def test_summary_artifact_contract(self) -> None:
        raw_items = [{"name": "Plan", "estimate_hours": 1.0, "actual_hours": 2.0}]
        summary = analyze_task_items(parse_task_items(raw_items))

        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = Path(tmpdir) / "summary.json"
            save_summary(summary, output_path)
            persisted = json.loads(output_path.read_text(encoding="utf-8"))

        expected_keys = {
            "count",
            "total_estimate_hours",
            "total_actual_hours",
            "variance_hours",
            "avg_delta_per_item",
            "largest_positive_delta_step",
            "largest_positive_delta_hours",
        }
        self.assertEqual(set(persisted.keys()), expected_keys)
        self.assertEqual(persisted, summary)


if __name__ == "__main__":
    unittest.main()
