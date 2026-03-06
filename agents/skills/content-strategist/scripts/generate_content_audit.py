#!/usr/bin/env python3
"""Generate a content completeness audit report for MindPrism books."""
from __future__ import annotations

import argparse
import csv
import io
from datetime import date
from pathlib import Path


DIMENSIONS = [
    "cover_image",
    "description",
    "author_bio",
    "chapter_count",
    "all_chapter_summaries",
    "mental_models_3plus",
    "audio_summary",
    "shorts_1plus",
    "meta_title",
    "meta_description",
]

DIMENSION_LABELS = {
    "cover_image": "Cover Image",
    "description": "Description",
    "author_bio": "Author Bio",
    "chapter_count": "Chapter Count",
    "all_chapter_summaries": "All Chapter Summaries",
    "mental_models_3plus": "≥3 Mental Models",
    "audio_summary": "Audio Summary",
    "shorts_1plus": "≥1 Short",
    "meta_title": "Meta Title",
    "meta_description": "Meta Description",
}

SCORE_WEIGHTS = {
    "cover_image": 4,
    "description": 3,
    "author_bio": 3,
    "chapter_count": 2,
    "all_chapter_summaries": 20,
    "mental_models_3plus": 18,
    "audio_summary": 8,
    "shorts_1plus": 3,
    "meta_title": 3,
    "meta_description": 3,
}


def score_book(fields: dict[str, str]) -> int:
    total = 0
    for dim, weight in SCORE_WEIGHTS.items():
        val = fields.get(dim, "").strip().lower()
        if val in ("yes", "true", "1", "x"):
            total += weight
    return total


def status_label(score: int) -> str:
    if score >= 90:
        return "Featured-eligible"
    if score >= 75:
        return "Published"
    if score >= 60:
        return "Draft"
    return "Incomplete"


def parse_csv_books(csv_text: str) -> list[dict[str, str]]:
    reader = csv.DictReader(io.StringIO(csv_text))
    return list(reader)


SAMPLE_BOOKS = [
    {"title": "Thinking, Fast and Slow", "author": "Daniel Kahneman"},
    {"title": "The Power of Habit", "author": "Charles Duhigg"},
    {"title": "Atomic Habits", "author": "James Clear"},
    {"title": "Man's Search for Meaning", "author": "Viktor Frankl"},
    {"title": "The Body Keeps the Score", "author": "Bessel van der Kolk"},
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate MindPrism content completeness audit.")
    parser.add_argument(
        "--csv",
        default=None,
        help=(
            "Path to a CSV file with columns: title,author,cover_image,description,"
            "author_bio,chapter_count,all_chapter_summaries,mental_models_3plus,"
            "audio_summary,shorts_1plus,meta_title,meta_description. "
            "If omitted, a sample skeleton report is generated."
        ),
    )
    parser.add_argument("--out", default="output/content/content-audit.md")
    args = parser.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = [
        "# MindPrism Content Completeness Audit",
        f"Generated: {date.today()}",
        "",
        "Scoring methodology: see `references/content-scoring-rubric.md`.",
        "Publication threshold: score ≥ 75.",
        "",
        "---",
        "",
    ]

    if args.csv:
        csv_path = Path(args.csv)
        if not csv_path.exists():
            raise FileNotFoundError(f"CSV not found: {csv_path}")
        books = parse_csv_books(csv_path.read_text(encoding="utf-8"))
    else:
        # Generate skeleton with sample books and all-TODO fields
        books = [
            {
                "title": b["title"],
                "author": b["author"],
                **{dim: "TODO" for dim in DIMENSIONS},
            }
            for b in SAMPLE_BOOKS
        ]

    # Summary table header
    lines.append("## Completeness Matrix")
    lines.append("")
    header_cols = ["Title", "Author"] + [DIMENSION_LABELS[d] for d in DIMENSIONS] + ["Score", "Status"]
    lines.append("| " + " | ".join(header_cols) + " |")
    lines.append("| " + " | ".join(["---"] * len(header_cols)) + " |")

    scored: list[tuple[str, int, str]] = []

    for book in books:
        title = book.get("title", "Unknown")
        author = book.get("author", "Unknown")
        dim_values = [book.get(dim, "TODO") for dim in DIMENSIONS]

        # Score only if fields are filled (not TODO placeholders)
        if any(v.lower() in ("yes", "no", "true", "false", "1", "0", "x") for v in dim_values):
            score = score_book(book)
        else:
            score = 0

        status = status_label(score) if score > 0 else "Not scored"
        scored.append((title, score, status))

        score_display = str(score) if score > 0 else "—"
        row = [title, author] + dim_values + [score_display, status]
        lines.append("| " + " | ".join(row) + " |")

    lines += [
        "",
        "---",
        "",
        "## Summary Statistics",
        "",
    ]

    actual_scores = [s for _, s, _ in scored if s > 0]
    if actual_scores:
        avg = sum(actual_scores) / len(actual_scores)
        published = sum(1 for _, s, _ in scored if s >= 75)
        incomplete = sum(1 for _, s, _ in scored if 0 < s < 60)
        lines += [
            f"- **Total books in audit:** {len(books)}",
            f"- **Average score:** {avg:.0f} / 100",
            f"- **Published (≥75):** {published}",
            f"- **Incomplete (<60):** {incomplete}",
            "",
        ]
    else:
        lines += [
            f"- **Total books in audit:** {len(books)}",
            "- **Scores:** Not yet calculated (fill in CSV fields first)",
            "",
        ]

    lines += [
        "---",
        "",
        "## Incomplete Books (Priority Queue)",
        "",
        "Books below 60 are blocked from all surfaces. Complete these first:",
        "",
    ]

    priority = [(t, s, st) for t, s, st in scored if s > 0 and s < 60]
    if priority:
        for title, score, status in sorted(priority, key=lambda x: x[1]):
            lines.append(f"- **{title}** — Score: {score} — Status: {status}")
    else:
        lines.append("- None identified (fill in CSV data to detect incomplete books)")

    lines += [
        "",
        "---",
        "",
        "## Missing Audio Summaries",
        "",
        "Books without audio summaries (high-value gap):",
        "",
    ]

    for book in books:
        audio = book.get("audio_summary", "TODO").strip().lower()
        if audio in ("no", "false", "0", ""):
            lines.append(f"- {book.get('title', 'Unknown')} — {book.get('author', '')}")

    if not any(
        book.get("audio_summary", "TODO").strip().lower() in ("no", "false", "0", "")
        for book in books
    ):
        lines.append("- None identified (fill in CSV data to detect missing audio)")

    lines += [
        "",
        "---",
        "",
        "## Next Steps",
        "",
        "1. Fill in all TODO values in this report or re-run with `--csv books.csv`.",
        "2. Prioritize incomplete books (<60) for content team assignment.",
        "3. Schedule audio recording for books without summaries.",
        "4. Add SEO metadata for any book missing meta title/description.",
        "5. Re-run audit weekly to track completeness progress.",
        "",
        "_Data source: MindPrism `books` and `book_chapters` tables. Run SQL query or export CSV from admin panel._",
    ]

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
