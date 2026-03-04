#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate performance report template.")
    parser.add_argument("--system", default="full", help="System scope: full, frontend, or backend")
    parser.add_argument("--out", default="output/performance/perf-report.md")
    args = parser.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    sections = [
        ("Bundle Size Analysis", _bundle_size_analysis(args.system)),
        ("Core Web Vitals", _core_web_vitals()),
        ("API Latency", _api_latency(args.system)),
        ("Database Query Times", _database_query_times(args.system)),
        ("Caching Status", _caching_status()),
        ("Image Optimization Status", _image_optimization_status()),
    ]

    lines = [f"# Performance Report\n", f"**System scope:** {args.system}\n"]
    for title, body in sections:
        lines.append(f"\n## {title}\n")
        lines.append(body)

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


def _bundle_size_analysis(system: str) -> str:
    if system == "backend":
        return "_Not applicable for backend-only scope._\n"
    chunks = [
        ("vendor (total)", "< 250 KB gzip"),
        ("framework (react + react-dom)", "< 45 KB gzip"),
        ("recharts", "< 50 KB gzip"),
        ("framer-motion", "< 30 KB gzip"),
        ("@tiptap/*", "< 40 KB gzip"),
        ("@radix-ui/*", "< 30 KB gzip"),
        ("app (route chunks)", "< 80 KB gzip per chunk"),
    ]
    header = "| Chunk | Target | Actual | Status |\n"
    sep = "|-------|--------|--------|--------|\n"
    body = ""
    for chunk, target in chunks:
        body += f"| {chunk} | {target} | | |\n"
    return header + sep + body


def _core_web_vitals() -> str:
    metrics = [
        ("Largest Contentful Paint (LCP)", "< 2.5 s"),
        ("First Input Delay (FID)", "< 100 ms"),
        ("Cumulative Layout Shift (CLS)", "< 0.1"),
        ("Time to Interactive (TTI)", "< 3.5 s"),
        ("First Contentful Paint (FCP)", "< 1.8 s"),
        ("Interaction to Next Paint (INP)", "< 200 ms"),
    ]
    header = "| Metric | Target | Actual | Status |\n"
    sep = "|--------|--------|--------|--------|\n"
    body = ""
    for metric, target in metrics:
        body += f"| {metric} | {target} | | |\n"
    return header + sep + body


def _api_latency(system: str) -> str:
    if system == "frontend":
        return "_Not applicable for frontend-only scope._\n"
    endpoints = [
        ("GET /api/books", "200 ms"),
        ("GET /api/books/:id", "150 ms"),
        ("GET /api/chapters/:id", "200 ms"),
        ("GET /api/shorts", "200 ms"),
        ("POST /api/progress", "300 ms"),
        ("GET /api/analytics", "500 ms"),
        ("POST /api/admin/books", "500 ms"),
        ("GET /api/categories", "100 ms"),
    ]
    header = "| Endpoint | p95 Target | p50 Actual | p95 Actual | p99 Actual | Status |\n"
    sep = "|----------|-----------|------------|------------|------------|--------|\n"
    body = ""
    for endpoint, target in endpoints:
        body += f"| {endpoint} | {target} | | | | |\n"
    return header + sep + body


def _database_query_times(system: str) -> str:
    if system == "frontend":
        return "_Not applicable for frontend-only scope._\n"
    tables = [
        ("books", "books_status_category_idx", ""),
        ("chapterSummaries", "NONE", "Missing: bookId"),
        ("mentalModels", "NONE", "Missing: bookId"),
        ("savedHighlights", "NONE", "Missing: userId+bookId"),
        ("chakraProgress", "NONE", "Missing: userId"),
        ("comments", "NONE", "Missing: bookId"),
        ("shorts", "NONE", "Missing: bookId+status"),
        ("shortViews", "NONE", "Missing: shortId"),
        ("bookVersions", "NONE", "Missing: bookId"),
        ("userProgress", "user_progress_user_book_idx", ""),
        ("journalEntries", "journal_entries_user_created_idx", ""),
        ("analyticsEvents", "analytics_events_type_created_idx", ""),
    ]
    header = "| Table | Existing Index | Missing Index | Avg Query Time | Status |\n"
    sep = "|-------|---------------|---------------|----------------|--------|\n"
    body = ""
    for table, existing, missing in tables:
        body += f"| {table} | {existing} | {missing} | | |\n"
    return header + sep + body


def _caching_status() -> str:
    layers = [
        ("Static assets (JS/CSS/images)", "Cache-Control with content hash", ""),
        ("API responses (book lists)", "ETag or stale-while-revalidate", ""),
        ("API responses (categories)", "Cache-Control: max-age=300", ""),
        ("Server-side query cache", "In-memory LRU or Redis", ""),
        ("CDN for media files", "CDN with long TTL", ""),
        ("Analytics data cache", "In-memory (loses on restart)", ""),
    ]
    header = "| Layer | Target Strategy | Current Status | Action Required |\n"
    sep = "|-------|----------------|----------------|----------------|\n"
    body = ""
    for layer, target, status in layers:
        body += f"| {layer} | {target} | {status} | |\n"
    return header + sep + body


def _image_optimization_status() -> str:
    checks = [
        ("sharp imported and configured", ""),
        ("WebP output generation", ""),
        ("AVIF output generation", ""),
        ("Responsive srcset for book covers", ""),
        ("Lazy loading on below-fold images", ""),
        ("Image dimension hints (width/height)", ""),
        ("Admin upload pipeline (resize on ingest)", ""),
    ]
    header = "| Check | Status | Notes |\n"
    sep = "|-------|--------|-------|\n"
    body = ""
    for check, status in checks:
        body += f"| {check} | {status} | |\n"
    return header + sep + body


if __name__ == "__main__":
    main()
