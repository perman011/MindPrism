from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import json
import math
from typing import Iterable, Mapping, TypedDict


class ValidationError(ValueError):
    """Raised when raw task input does not satisfy schema requirements."""


@dataclass(frozen=True)
class TaskItem:
    name: str
    estimate_hours: float
    actual_hours: float


class Summary(TypedDict):
    count: int
    total_estimate_hours: float
    total_actual_hours: float
    variance_hours: float
    avg_delta_per_item: float
    largest_positive_delta_step: str | None
    largest_positive_delta_hours: float | None


REQUIRED_FIELDS = ("name", "estimate_hours", "actual_hours")


def parse_task_items(
    raw_items: Iterable[Mapping[str, object]],
    *,
    coerce_numeric: bool = True,
) -> list[TaskItem]:
    """Validate and normalize raw items into typed task rows."""
    items: list[TaskItem] = []
    for idx, row in enumerate(raw_items):
        if not isinstance(row, Mapping):
            raise ValidationError(f"Row {idx} must be a mapping/dict.")

        missing = [field for field in REQUIRED_FIELDS if field not in row]
        if missing:
            missing_str = ", ".join(missing)
            raise ValidationError(f"Row {idx} is missing required field(s): {missing_str}.")

        raw_name = row["name"]
        if not isinstance(raw_name, str) or not raw_name.strip():
            raise ValidationError(f"Row {idx} field 'name' must be a non-empty string.")

        estimate = _parse_non_negative_float(
            row["estimate_hours"],
            field_name="estimate_hours",
            row_index=idx,
            coerce_numeric=coerce_numeric,
        )
        actual = _parse_non_negative_float(
            row["actual_hours"],
            field_name="actual_hours",
            row_index=idx,
            coerce_numeric=coerce_numeric,
        )

        items.append(
            TaskItem(
                name=raw_name.strip(),
                estimate_hours=estimate,
                actual_hours=actual,
            )
        )

    return items


def analyze_task_items(items: Iterable[TaskItem]) -> Summary:
    """Produce summary metrics and largest positive delta details."""
    rows = list(items)
    if not rows:
        return Summary(
            count=0,
            total_estimate_hours=0.0,
            total_actual_hours=0.0,
            variance_hours=0.0,
            avg_delta_per_item=0.0,
            largest_positive_delta_step=None,
            largest_positive_delta_hours=None,
        )

    total_estimate = sum(item.estimate_hours for item in rows)
    total_actual = sum(item.actual_hours for item in rows)
    deltas = [item.actual_hours - item.estimate_hours for item in rows]

    largest_positive = [
        (item.name, delta)
        for item, delta in zip(rows, deltas, strict=True)
        if delta > 0
    ]

    largest_step: str | None
    largest_value: float | None
    if largest_positive:
        largest_step, largest_value = max(largest_positive, key=lambda entry: entry[1])
        largest_value = round(largest_value, 2)
    else:
        largest_step = None
        largest_value = None

    return Summary(
        count=len(rows),
        total_estimate_hours=round(total_estimate, 2),
        total_actual_hours=round(total_actual, 2),
        variance_hours=round(total_actual - total_estimate, 2),
        avg_delta_per_item=round(sum(deltas) / len(rows), 2),
        largest_positive_delta_step=largest_step,
        largest_positive_delta_hours=largest_value,
    )


def build_takeaways(summary: Summary) -> list[str]:
    """Create concise human-readable output lines from summary metrics."""
    lines = [f"Processed {summary['count']} task items."]

    if summary["count"] == 0:
        lines.append("No task items were provided; totals are 0.0 hours.")
        lines.append("Next step: add at least one task item to compare estimate vs actual.")
        return lines

    lines.append(f"Total variance: {summary['variance_hours']} hours.")

    step = summary["largest_positive_delta_step"]
    delta = summary["largest_positive_delta_hours"]
    if step is None or delta is None:
        lines.append("No positive delta detected; no step exceeded its estimate.")
    else:
        lines.append(
            f"Next step: adjust estimates for '{step}' (+{delta} hours over estimate)."
        )

    return lines


def save_summary(summary: Summary, output_path: str | Path) -> Path:
    """Persist summary as stable JSON for downstream automation/auditing."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return path


def _parse_non_negative_float(
    value: object,
    *,
    field_name: str,
    row_index: int,
    coerce_numeric: bool,
) -> float:
    if isinstance(value, bool):
        raise ValidationError(
            f"Row {row_index} field '{field_name}' must be a non-negative number, not boolean."
        )

    if isinstance(value, (int, float)):
        parsed = float(value)
    elif isinstance(value, str):
        if not coerce_numeric:
            raise ValidationError(
                f"Row {row_index} field '{field_name}' must be numeric; string coercion is disabled."
            )
        try:
            parsed = float(value.strip())
        except ValueError as exc:
            raise ValidationError(
                f"Row {row_index} field '{field_name}' value '{value}' is not a valid number."
            ) from exc
    else:
        raise ValidationError(
            f"Row {row_index} field '{field_name}' must be a non-negative number."
        )

    if not math.isfinite(parsed):
        raise ValidationError(
            f"Row {row_index} field '{field_name}' must be a finite number."
        )

    if parsed < 0:
        raise ValidationError(
            f"Row {row_index} field '{field_name}' must be >= 0."
        )

    return round(parsed, 2)
