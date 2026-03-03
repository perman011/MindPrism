#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def build_brief(product_name: str, audience: str, problem: str, brand_color: str) -> str:
    return f"""# UX Brief: {product_name}

## Product Goal
{problem}

## Primary Audience
{audience}

## Brand Direction
- Primary color: {brand_color}
- Theme: dark-purple modern UI
- Tone: sleek, fast, confident

## Competitor Pattern Matrix
| Competitor | Patterns to Reuse | Patterns to Avoid |
|---|---|---|
| Asana |  |  |
| ClickUp |  |  |
| Monday.com |  |  |
| Notion |  |  |
| Linear |  |  |

## Core User Flows
1. Onboarding and first value
2. Daily usage loop
3. Power-user workflow
4. Error recovery / edge case flow

## Screen Inventory
- Landing / dashboard
- Workspace / primary work surface
- Detail panel / modal
- Settings / account

## Handoff Notes
- Desktop + mobile layout behavior
- Empty/loading/error/success states
- Accessibility and keyboard navigation expectations
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a UX brief template.")
    parser.add_argument("--product-name", required=True)
    parser.add_argument("--audience", required=True)
    parser.add_argument("--problem", required=True)
    parser.add_argument("--brand-color", default="#7C3AED")
    parser.add_argument("--out", default="output/design/ux-brief.md")
    args = parser.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        build_brief(args.product_name, args.audience, args.problem, args.brand_color),
        encoding="utf-8",
    )
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
