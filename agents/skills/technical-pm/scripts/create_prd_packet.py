#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


PRD_TMPL = """# Technical PRD: {feature}

## Problem Statement

## Goals and Success Metrics

## Users and Use Cases

## Scope
### In scope
### Out of scope

## Functional Requirements

## Non-Functional Requirements

## Technical Design Summary

## Release Plan

## Test and QA Plan

## Risks, Assumptions, Open Questions
"""

BACKLOG_TMPL = """# Delivery Backlog: {feature}

## Epic 1
### Ticket 1
- Type:
- Scope:
- Acceptance Criteria:
  1.
  2.

### Ticket 2
- Type:
- Scope:
- Acceptance Criteria:
  1.
  2.

## Epic 2
### Ticket 3
- Type:
- Scope:
- Acceptance Criteria:
  1.
  2.
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Scaffold PRD + backlog packet.")
    parser.add_argument("--feature", required=True)
    parser.add_argument("--out-dir", default="output/product")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    slug = args.feature.lower().replace(" ", "-")
    prd_path = out_dir / f"{slug}-prd.md"
    backlog_path = out_dir / f"{slug}-tickets.md"

    prd_path.write_text(PRD_TMPL.format(feature=args.feature), encoding="utf-8")
    backlog_path.write_text(BACKLOG_TMPL.format(feature=args.feature), encoding="utf-8")

    print(f"Wrote {prd_path}")
    print(f"Wrote {backlog_path}")


if __name__ == "__main__":
    main()
