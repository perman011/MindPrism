#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


COLUMNS = [
    "Component",
    "Loading State",
    "Error State",
    "Empty State",
    "Accessibility",
    "Keyboard Nav",
    "Responsive",
    "DOMPurify",
]


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate frontend component audit template."
    )
    parser.add_argument(
        "--components",
        required=True,
        help="Comma-separated component names, e.g. 'audio-player,book-card,shorts-player'",
    )
    parser.add_argument("--out", default="output/frontend/component-audit.md")
    args = parser.parse_args()

    components = [c.strip() for c in args.components.split(",") if c.strip()]
    if not components:
        raise ValueError("At least one component is required.")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = []
    lines.append("# Component Audit")
    lines.append("")
    lines.append("| " + " | ".join(COLUMNS) + " |")
    lines.append("| " + " | ".join("---" for _ in COLUMNS) + " |")

    for component in components:
        row = [component] + ["Not Checked"] * (len(COLUMNS) - 1)
        lines.append("| " + " | ".join(row) + " |")

    lines.append("")

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
