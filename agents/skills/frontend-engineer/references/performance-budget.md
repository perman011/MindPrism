# Performance Budget

## Bundle Targets

| Metric | Budget |
|---|---|
| JS bundle total | < 250KB gzipped |
| Largest chunk | < 80KB |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTI | < 3.5s on 3G |

## Tooling

- Use `vite-plugin-visualizer` to inspect bundle composition after each build.
- Run `npx vite build --report` to generate size reports.

## Route-Level Budgets

| Route Group | JS Budget | Notes |
|---|---|---|
| User routes (library, reader, shorts, profile) | < 150KB gzipped | Core experience, must load fast on mobile |
| Admin routes (dashboard, analytics, content mgmt) | < 200KB gzipped | Acceptable higher budget, desktop-primary |
| Shared chunks (React, router, query) | < 60KB gzipped | Framework baseline |

## Image Budget

| Asset Type | Max Size | Format |
|---|---|---|
| Book cover thumbnail | 50KB | WebP |
| Book cover full | 150KB | WebP |
| Avatar / icon | 10KB | WebP or SVG |
| Shorts background | 100KB | WebP |
| Marketing / hero | 200KB | WebP with AVIF fallback |
