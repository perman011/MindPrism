# Index Strategy -- MindPrism

## Existing Indexes

| Table | Index Name | Column(s) |
|---|---|---|
| books | books_status_category_idx | status, category_id |
| user_progress | user_progress_user_book_idx | user_id, book_id |
| journal_entries | journal_entries_user_created_idx | user_id, created_at |
| analytics_events | analytics_events_type_created_idx | event_type, created_at |
| user_activity_log | user_activity_log_user_created_idx | user_id, created_at |

## Missing Indexes

| Table | Column(s) | Index Type | Justification | Priority |
|---|---|---|---|---|
| chapter_summaries | book_id | B-tree | FK lookup -- join from books to chapters on every book detail page | P0 |
| mental_models | book_id | B-tree | FK lookup -- fetched alongside chapter summaries per book | P0 |
| saved_highlights | user_id, book_id | B-tree (composite) | User-scoped highlight retrieval; both columns appear in WHERE clauses | P0 |
| chakra_progress | user_id | B-tree | Dashboard loads all chakra rows per user | P1 |
| comments | book_id | B-tree | FK lookup -- comment threads loaded per book version | P1 |
| short_views | short_id | B-tree | FK lookup -- view counts aggregated per short | P1 |
| book_versions | book_id | B-tree | FK lookup -- version history loaded per book | P1 |
| shorts | book_id, status | B-tree (composite) | Filtered queries for published shorts by book | P2 |
| quiz_results | user_id, book_id | B-tree (composite) | Quiz history lookup per user per book | P2 |
| user_interests | user_id | B-tree | FK lookup -- onboarding status check per user | P2 |
| user_streaks | user_id | B-tree | FK lookup -- streak data loaded on every session | P2 |
| notification_preferences | user_id | Unique (already unique constraint) | Already covered by unique constraint on user_id | -- |

## Full-Text Search (Future)

Consider adding a GIN index on books for full-text search:

```sql
CREATE INDEX books_fts_idx ON books
  USING GIN (to_tsvector('english', title || ' ' || author || ' ' || description));
```

This supports search-as-you-type across title, author, and description without a separate search service.

## JSONB Indexes (Future)

If query patterns emerge that filter on JSONB keys:

```sql
CREATE INDEX analytics_event_data_idx ON analytics_events USING GIN (event_data);
```

Only add GIN indexes on JSONB columns when there are confirmed query patterns filtering on nested keys. Premature JSONB indexing increases write overhead with no read benefit.

## Implementation Notes

- Add missing indexes via drizzle-kit migration, not manual SQL.
- Test each index with EXPLAIN ANALYZE on representative queries before and after.
- Monitor pg_stat_user_indexes after deployment to confirm indexes are being used.
- Drop any index that shows zero scans after 30 days in production.
