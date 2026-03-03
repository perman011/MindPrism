#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate an E2E test matrix CSV.")
    parser.add_argument(
        "--journeys",
        required=True,
        help="Comma-separated list of user journeys, e.g. 'Signup,Create task,Export report'",
    )
    parser.add_argument("--out", default="output/qa/e2e-matrix.csv")
    args = parser.parse_args()

    journeys = [item.strip() for item in args.journeys.split(",") if item.strip()]
    if not journeys:
        raise ValueError("At least one journey is required.")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    with out.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow([
            "id",
            "journey",
            "priority",
            "preconditions",
            "steps",
            "expected_result",
            "status",
        ])
        for idx, journey in enumerate(journeys, start=1):
            writer.writerow(
                [
                    f"E2E-{idx:03d}",
                    journey,
                    "P1",
                    "Test account + seeded data",
                    "Define step-by-step actions",
                    "Journey completes without error",
                    "Not Run",
                ]
            )

    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
