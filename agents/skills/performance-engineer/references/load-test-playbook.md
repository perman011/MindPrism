# Load Test Playbook -- MindPrism

## Tool Selection

- **Primary:** k6 (Grafana) -- scriptable in JavaScript, lightweight, CI-friendly.
- **Alternative:** Artillery -- YAML-based, good for quick scenario definition.
- **Monitoring:** Grafana + Prometheus or built-in k6 Cloud dashboards.

## Test Scenarios

| Scenario | Description | Weight |
|----------|-------------|--------|
| Browse books | GET /api/books, GET /api/books/:id, GET /api/categories | 40% |
| Read chapter | GET /api/chapters/:id, POST /api/progress | 25% |
| Take quiz | GET /api/quizzes/:id, POST /api/quiz-responses | 10% |
| Listen audio | GET /api/audio/:id (streaming endpoint) | 10% |
| Admin upload | POST /api/admin/books, POST /api/admin/chapters (authenticated) | 5% |
| User activity | POST /api/highlights, POST /api/journal, GET /api/dashboard | 10% |

## Ramp-Up Profile

```
Stage 1: 0 -> 100 virtual users over 5 minutes (warm-up)
Stage 2: Hold 100 virtual users for 10 minutes (steady state)
Stage 3: Spike to 200 virtual users, hold 2 minutes (spike test)
Stage 4: Return to 100 virtual users for 3 minutes (recovery)
Stage 5: Ramp down to 0 over 2 minutes (cool-down)
```

Total duration: ~22 minutes per run.

## Metrics to Capture

| Metric | Tool | Threshold |
|--------|------|-----------|
| Response time p50 | k6 | < 100 ms |
| Response time p95 | k6 | < 500 ms |
| Response time p99 | k6 | < 1500 ms |
| Error rate | k6 | < 1% |
| Throughput (req/s) | k6 | > 16 req/s (1000 RPM) |
| DB connection pool active | pg Pool monitoring | < 80% of max |
| DB connection pool waiting | pg Pool monitoring | 0 |
| Memory RSS | process.memoryUsage() | < 512 MB |
| Event loop lag | perf_hooks | < 50 ms p95 |
| CPU usage | OS metrics | < 80% |

## Acceptance Criteria

- [ ] All p95 response times under 500 ms at 100 concurrent users
- [ ] Error rate below 1% during steady state
- [ ] No connection pool exhaustion during spike test
- [ ] Memory does not grow unbounded over the 22-minute run (no memory leak)
- [ ] Recovery stage returns to baseline metrics within 60 seconds
- [ ] No HTTP 503 responses during the entire run

## Pre-Test Checklist

- [ ] Test environment matches production configuration
- [ ] Database seeded with representative data volume
- [ ] External service stubs in place (Stripe, push notifications)
- [ ] Monitoring dashboards configured and recording
- [ ] Baseline metrics captured from a single-user run

## CI Integration Notes

- Run smoke test (10 users, 2 minutes) on every PR merge to main.
- Run full load test (100 users, 22 minutes) nightly or before releases.
- Store k6 results as CI artifacts for trend analysis.
- Fail the pipeline if p95 > 500 ms or error rate > 1%.
- Use k6 `handleSummary()` to export JSON results for dashboard ingestion.

## Post-Test Analysis

1. Compare results against performance budget (see performance-budget.md).
2. Identify top 5 slowest endpoints and correlate with DB query counts.
3. Check for connection pool saturation events.
4. Review memory growth curve for leak indicators.
5. Document findings and file tickets for regressions.
