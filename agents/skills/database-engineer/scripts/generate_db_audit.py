#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate database audit template.")
    parser.add_argument(
        "--tables",
        required=True,
        help="Comma-separated table names, e.g. 'books,users,shorts'",
    )
    parser.add_argument("--out", default="output/database/db-audit.md")
    args = parser.parse_args()

    tables = [t.strip() for t in args.tables.split(",") if t.strip()]
    if not tables:
        raise ValueError("At least one table name is required.")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    header = """# Database Audit Report

## Summary

| Table Name | Row Estimate | Index Count | Missing Indexes | JSONB Validation | FK Integrity |
|---|---|---|---|---|---|
"""

    rows = ""
    for table in tables:
        rows += f"| {table} | -- | -- | -- | -- | -- |\n"

    details = "\n## Table Details\n"
    for table in tables:
        details += f"""
### {table}

- **Row estimate**: --
- **Existing indexes**: --
- **Missing indexes**: --
- **JSONB columns validated**: --
- **Foreign keys with indexes**: --
- **Notes**: --
"""

    actions = """
## Action Items

1.
2.
3.

## Connection Pool Status

- **max**: --
- **min**: --
- **idleTimeoutMillis**: --
- **connectionTimeoutMillis**: --
- **Active connections**: --
- **Idle connections**: --

## Backup Status

- **Last backup**: --
- **Backup size**: --
- **Restore tested**: --
- **Backup verification job**: --
"""

    content = header + rows + details + actions
    out.write_text(content, encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
