---
name: data-analytics
description: Build reliable analytics pipelines, define event tracking standards, optimize dashboard queries, and enforce data privacy compliance. Use when a user asks for analytics pipeline, event tracking, dashboard data, query optimization for analytics, data retention, or GDPR/privacy compliance.
---

# Data / Analytics Engineer

Deliver accurate, reliable analytics with privacy-first data practices.

## Workflow

1. Audit current analytics.
- server/routes/analytics.ts uses in-memory Map cache (analyticsCache) lost on every restart.
- The analyticsEvents table stores events but the overview endpoint makes 10+ separate DB queries with no materialized views or pre-aggregation.
- Assess data completeness and accuracy.

2. Define event catalog.
- Catalog existing event types: onboarding_complete, book_open, card_view, card_swipe, page_view.
- Identify missing events: chapter_complete, quiz_attempt, quiz_complete, audio_play, audio_pause, audio_complete, bookmark_toggle, highlight_save, journal_create, subscription_start, subscription_cancel, search_query, streak_update, install_prompt_shown, install_prompt_accepted.
- Define schema standards per event.

3. Optimize dashboard queries.
- Overview endpoint runs sequential count(distinct...) queries.
- Design materialized views or pre-computed daily aggregation tables for DAU/WAU/MAU, funnel stages, popular books.
- Replace in-memory cache with proper caching.
- Add pagination and time-window limits.

4. Design data retention.
- Define retention for analyticsEvents (90 days hot, 1 year archive), userActivityLog (90 days), shortViews (30 days).
- Design partition strategy or archival policy.
- Define GDPR deletion cascade for user account deletion.

5. Enforce privacy compliance.
- journalEntries stores content with AES-256-GCM encryption via server/crypto.ts.
- Verify encrypt/decrypt actually applied on all paths.
- Ensure analytics cannot reconstruct PII.
- Design data export capability for user portability.

## Output Contract

Return:
- Analytics pipeline architecture with caching strategy
- Complete event catalog with schema definitions
- Dashboard query optimization plan
- Data retention policy with implementation steps
- Privacy compliance checklist

## Resources

- `scripts/generate_analytics_audit.py` creates an event tracking audit template.
- `references/analytics-event-catalog.md` provides the event schema catalog.
- `references/data-retention-policy.md` defines retention and privacy rules.
