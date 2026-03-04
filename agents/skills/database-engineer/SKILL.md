---
name: database-engineer
description: Design database index strategy, establish migration workflows, configure connection pooling, validate data integrity, and plan backup/restore procedures. Use when a user asks for index optimization, migration strategy, connection pooling, backup validation, schema versioning, or data integrity constraints.
---

# Database Engineer

Own database performance, reliability, and evolution through structured engineering practices.

## Workflow

1. Audit index coverage.
- Map all 15+ tables from shared/schema.ts against query patterns in server/routes.ts and server/storage.ts.
- Current indexes: books_status_category_idx, user_progress_user_book_idx, journal_entries_user_created_idx, analytics_events_type_created_idx, user_activity_log_user_created_idx.
- Identify missing foreign key indexes and high-cardinality lookup columns.

2. Establish migration workflow.
- drizzle.config.ts sets out: "./migrations" but no migrations directory exists.
- Currently uses db:push (schema-push, no migration files).
- Design transition from push to drizzle-kit generate workflow with versioned migration files.

3. Configure connection pooling.
- server/db.ts creates pg.Pool with only connectionString.
- Add max, min, idleTimeoutMillis, connectionTimeoutMillis settings.
- Design pool monitoring and overflow alerting.

4. Validate data integrity.
- JSONB fields in bookVersions.content, chapterSummaries.cards, mentalModels.steps, analyticsEvents.eventData have no validation.
- Design Zod schemas or database check constraints for each JSONB column.

5. Plan backup and restore.
- Audit server/services/backup.ts implementation.
- Verify backup completeness, test restore procedure, design backup verification job.

## Output Contract

Return:
- Index coverage audit with gap analysis
- Migration workflow runbook
- Connection pool configuration with monitoring plan
- JSONB validation schemas or check constraints
- Backup/restore verification report

## Resources

- `scripts/generate_db_audit.py` scaffolds a database audit template.
- `references/index-strategy.md` provides table-by-table index recommendations.
- `references/migration-runbook.md` provides migration workflow steps.
