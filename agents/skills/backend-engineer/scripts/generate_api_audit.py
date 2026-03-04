#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate API audit template.")
    parser.add_argument(
        "--endpoints",
        required=True,
        help="Comma-separated endpoints like 'GET /api/books,POST /api/journal'",
    )
    parser.add_argument("--out", default="output/backend/api-audit.md")
    args = parser.parse_args()

    endpoints = [item.strip() for item in args.endpoints.split(",") if item.strip()]
    if not endpoints:
        raise ValueError("At least one endpoint is required.")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = []
    lines.append("# API Audit Report")
    lines.append("")
    lines.append("| Method | Path | Auth | Zod Validation | Error Handling | Rate Limited | Status |")
    lines.append("|--------|------|------|----------------|----------------|--------------|--------|")

    for endpoint in endpoints:
        parts = endpoint.split(maxsplit=1)
        if len(parts) == 2:
            method, path = parts
        else:
            method, path = "GET", parts[0]
        lines.append(f"| {method} | {path} | TODO | TODO | TODO | TODO | TODO |")

    lines.append("")
    lines.append("## Notes")
    lines.append("")
    lines.append("- Auth: middleware applied (yes/no/partial)")
    lines.append("- Zod Validation: request body validated (yes/no/N/A)")
    lines.append("- Error Handling: uses standard error envelope (yes/no)")
    lines.append("- Rate Limited: rate limiting applied (yes/no)")
    lines.append("- Status: pass/fail/needs-work")
    lines.append("")

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
