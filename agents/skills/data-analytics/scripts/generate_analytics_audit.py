#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate event tracking audit template.")
    parser.add_argument(
        "--events",
        required=True,
        help="Comma-separated event names, e.g. 'page_view,book_open,card_view'",
    )
    parser.add_argument("--out", default="output/analytics/event-audit.md")
    args = parser.parse_args()

    events = [e.strip() for e in args.events.split(",") if e.strip()]
    if not events:
        raise ValueError("At least one event name is required.")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    header = """# Event Tracking Audit Report

## Summary

| Event Name | Tracked | Schema Validated | Dashboard Visible | Retention Policy |
|---|---|---|---|---|
"""

    rows = ""
    for event in events:
        rows += f"| {event} | TODO | TODO | TODO | TODO |\n"

    details = "\n## Event Details\n"
    for event in events:
        details += f"""
### {event}

- **Tracked**: TODO
- **Schema validated**: TODO
- **Dashboard visible**: TODO
- **Retention policy**: TODO
- **Required properties**: TODO
- **Optional properties**: TODO
- **Notes**: --
"""

    pipeline = """
## Pipeline Status

- **Cache strategy**: --
- **Pre-aggregation tables**: --
- **Materialized views**: --
- **Query optimization**: --

## Data Retention

- **analyticsEvents**: 90 days hot / 1 year archive
- **userActivityLog**: 90 days
- **shortViews**: 30 days
- **Partition strategy**: --
- **Archival job**: --

## Privacy Compliance

- **PII in analytics**: --
- **Encryption verified**: --
- **GDPR deletion cascade**: --
- **Data export endpoint**: --
"""

    content = header + rows + details + pipeline
    out.write_text(content, encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
