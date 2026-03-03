#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate architecture scorecard template.")
    parser.add_argument("--system", required=True)
    parser.add_argument("--out", default="output/architecture/scorecard.md")
    args = parser.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    content = f"""# Architecture Scorecard: {args.system}

## Ratings (1-5)
- Scalability:
- Reliability:
- Security:
- Operability:
- Cost Efficiency:
- Team Maintainability:

## High-Risk Gaps
1.
2.
3.

## Priority Architecture Actions
1.
2.
3.

## ADRs Needed
- ADR-001:
- ADR-002:

## 90-Day Roadmap
- Month 1:
- Month 2:
- Month 3:
"""

    out.write_text(content, encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
