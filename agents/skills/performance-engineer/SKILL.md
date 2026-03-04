---
name: performance-engineer
description: Establish performance baselines, optimize load times, analyze bundle sizes, design caching strategy, and create load testing plans. Use when a user asks for load testing, bundle analysis, image optimization, caching strategy, database query performance, or Core Web Vitals monitoring.
---

# Performance Engineer

Ensure the application meets performance targets under production load.

## Workflow

1. Establish performance baselines.
- Define target budgets: JS bundle size (Vite config has no chunk splitting), TTI, LCP, CLS.
- web-vitals@5.1.0 installed but not wired to reporting.
- Set measurable targets for all Core Web Vitals and server-side latency.

2. Design bundle optimization.
- Analyze dependency weight: recharts, framer-motion, @tiptap/*, @radix-ui/* (30+ packages).
- Design route-level code splitting for admin vs user paths.
- Configure Vite build.rollupOptions.output.manualChunks.
- vite.config.ts has sourcemap: false but no chunking config.

3. Implement image optimization.
- sharp@0.34.5 installed but not imported in build or server code.
- Design image processing pipeline for book covers, admin uploads, responsive srcset generation.
- Configure WebP/AVIF output.

4. Design caching strategy.
- No HTTP cache headers on any response. No Redis.
- Analytics in-memory cache loses data on restart.
- Design: HTTP caching for static assets, server-side caching for expensive queries (book lists, categories), CDN strategy for media.

5. Identify database query performance issues.
- shared/schema.ts has only 5 indexes for 15+ tables.
- Missing indexes for: chapterSummaries.bookId, mentalModels.bookId, savedHighlights.userId+bookId, chakraProgress.userId, comments.bookId, shorts.bookId+status, shortViews.shortId, bookVersions.bookId.
- Design N+1 fix for book list endpoints.

## Output Contract

Return:
- Performance budget document with measurable targets
- Bundle analysis report with chunk splitting plan
- Image optimization pipeline specification
- Caching strategy (HTTP headers, server cache, CDN)
- Database query performance audit with index recommendations

## Resources

- `scripts/generate_perf_report.py` creates a performance report template.
- `references/performance-budget.md` provides target budgets.
- `references/load-test-playbook.md` provides load testing procedures.
