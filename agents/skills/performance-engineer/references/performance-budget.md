# Performance Budget -- MindPrism

## Client-Side Budgets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| JS bundle total (gzipped) | < 250 KB | -- | -- |
| Largest chunk (gzipped) | < 80 KB | -- | -- |
| CSS total (gzipped) | < 50 KB | -- | -- |
| Total page weight (gzipped) | < 500 KB | -- | -- |

## Core Web Vitals

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Largest Contentful Paint (LCP) | < 2.5 s | -- | -- |
| First Input Delay (FID) | < 100 ms | -- | -- |
| Cumulative Layout Shift (CLS) | < 0.1 | -- | -- |
| Time to Interactive (TTI) | < 3.5 s on 3G | -- | -- |
| First Contentful Paint (FCP) | < 1.8 s | -- | -- |
| Interaction to Next Paint (INP) | < 200 ms | -- | -- |

## Server-Side Budgets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| API response p50 | < 100 ms | -- | -- |
| API response p95 | < 500 ms | -- | -- |
| API response p99 | < 1500 ms | -- | -- |
| DB query per endpoint | < 5 queries | -- | -- |
| Connection pool utilization | < 80% | -- | -- |
| Memory usage (RSS) | < 512 MB | -- | -- |
| Event loop lag p95 | < 50 ms | -- | -- |

## Load Test Targets

| Metric | Target |
|--------|--------|
| Concurrent users | 100 |
| Sustained throughput | 1000 RPM |
| Error rate under load | < 1% |
| p95 response time under load | < 1000 ms |

## Per-Route Budgets

| Route | Max Response Time (p95) | Max DB Queries | Notes |
|-------|------------------------|----------------|-------|
| GET /api/books | 200 ms | 2 | Cacheable |
| GET /api/books/:id | 150 ms | 3 | Cacheable |
| GET /api/chapters/:id | 200 ms | 3 | Cacheable |
| GET /api/shorts | 200 ms | 2 | Cacheable |
| POST /api/progress | 300 ms | 2 | Write path |
| GET /api/analytics | 500 ms | 5 | Admin only |
