# Data Retention Policy

## Per-Table Retention Rules

| Table | Retention (Hot) | Retention (Archive) | Auto-Delete | Justification |
|---|---|---|---|---|
| analyticsEvents | 90 days | 1 year cold archive | Yes | High volume; older events aggregated into daily summaries |
| userActivityLog | 90 days | No archive | Yes | Session-level data; value diminishes rapidly |
| shortViews | 30 days | No archive | Yes | View counts rolled up into aggregate totals before deletion |
| journalEntries | Permanent | N/A | No | User-owned content; deletion only by user request |
| quizResults | Permanent | N/A | No | Learning history; retained for progress tracking |
| users | Permanent | N/A | No | Account data; deleted only on account deletion |
| books | Permanent | N/A | No | Content catalog; never auto-deleted |
| chapterSummaries | Permanent | N/A | No | Content; lifecycle tied to parent book |
| savedHighlights | Permanent | N/A | No | User-owned content; deletion only by user request |
| userProgress | Permanent | N/A | No | Learning state; retained for continuity |

## Archival Strategy

### Partition by Month

For high-volume tables (analyticsEvents, userActivityLog, shortViews):

1. Partition analyticsEvents by `created_at` using monthly range partitions.
2. At the start of each month, detach partitions older than 90 days from the hot table.
3. Export detached partitions to compressed Parquet or CSV for cold storage.
4. Retain cold archives for 1 year (analyticsEvents only), then delete.
5. Maintain a daily_aggregates table with pre-computed metrics for historical queries.

### Aggregation Before Deletion

Before deleting raw events, compute and store:
- Daily active users (DAU) by date
- Event counts by type and date
- Funnel stage counts by date
- Popular books by date (views, opens, completions)

## GDPR Compliance

### Right to Erasure (Article 17)

When a user requests account deletion, cascade through all tables referencing userId:

| Table | Column | Action |
|---|---|---|
| users | id | Hard delete |
| userProgress | userId | Hard delete |
| journalEntries | userId | Hard delete |
| savedHighlights | userId | Hard delete |
| quizResults | userId | Hard delete |
| userStreaks | userId | Hard delete |
| chakraProgress | userId | Hard delete |
| comments | userId | Anonymize (set userId to null, keep content) |
| analyticsEvents | userId | Anonymize (set userId to 0) |
| userActivityLog | userId | Hard delete |
| notificationPreferences | userId | Hard delete |
| userInterests | userId | Hard delete |
| subscriptions | userId | Hard delete after grace period |

### Data Export (Article 20 -- Portability)

On user request, generate a JSON export containing:

```json
{
  "user": { "id": 1, "email": "...", "displayName": "..." },
  "progress": [ { "bookId": 1, "completionPercentage": 75, "lastReadAt": "..." } ],
  "journals": [ { "bookId": 1, "content": "decrypted text", "createdAt": "..." } ],
  "highlights": [ { "bookId": 1, "chapterId": 2, "text": "...", "createdAt": "..." } ],
  "quizResults": [ { "bookId": 1, "score": 8, "total": 10, "completedAt": "..." } ],
  "streaks": { "currentStreak": 5, "longestStreak": 14 }
}
```

### Anonymization Approach

For tables where deletion would break referential integrity or aggregate reporting:

1. Replace userId with a sentinel value (0 or a dedicated "deleted-user" row).
2. Remove or hash any free-text fields that could contain PII.
3. Retain the row for aggregate reporting purposes only.
4. Log the anonymization event for audit trail.

### Deletion SLA

- Erasure requests must be completed within 30 days (GDPR requirement).
- Automated deletion job runs nightly for retention-expired rows.
- Manual erasure requests processed via admin endpoint with audit logging.
