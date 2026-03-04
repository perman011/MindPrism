# Migration Runbook

## Current State

The application uses `db:push` (drizzle-kit push) to apply schema changes directly. This works for early development but bypasses version-controlled migration files. The `drizzle.config.ts` sets `out: "./migrations"` but no migrations directory exists yet.

## Transition Plan: push to generate

1. Freeze schema changes during transition.
2. Run `npx drizzle-kit generate` to produce the initial baseline migration from the current schema.
3. Verify the generated SQL matches the live database state.
4. Commit the migrations directory to version control.
5. Update `package.json` scripts to replace `db:push` with `db:migrate`.
6. Remove or gate `db:push` behind a `--dev-only` flag.

## Migration Workflow

### Step 1: Generate Migration

```bash
npx drizzle-kit generate
```

This reads `shared/schema.ts` and produces a numbered SQL migration file in `./migrations`.

### Step 2: Review Migration SQL

- Open the generated `.sql` file in `./migrations`.
- Verify each statement: CREATE TABLE, ALTER TABLE, CREATE INDEX.
- Check for destructive operations: DROP COLUMN, DROP TABLE, ALTER TYPE.
- Flag any data-loss risks for team review.

### Step 3: Test in Staging

```bash
DATABASE_URL=$STAGING_DATABASE_URL npx drizzle-kit migrate
```

- Run the migration against a staging database with production-like data.
- Execute application smoke tests against staging.
- Verify no query regressions with EXPLAIN ANALYZE on critical queries.

### Step 4: Apply in Production

```bash
DATABASE_URL=$PRODUCTION_DATABASE_URL npx drizzle-kit migrate
```

- Run during the maintenance window.
- Monitor database logs for lock contention or long-running statements.
- Keep a terminal open with `SELECT * FROM pg_stat_activity WHERE state = 'active'`.

### Step 5: Verify Post-Migration

- Run application health check endpoint.
- Verify all tables exist with expected columns: `\dt` and `\d table_name` in psql.
- Check index creation: `SELECT indexname FROM pg_indexes WHERE tablename = 'target_table';`
- Run the full E2E test suite against the migrated database.

### Step 6: Rollback (if needed)

Drizzle-kit does not auto-generate rollback files. For each migration, manually prepare a rollback script:

```sql
-- Example rollback for an added column
ALTER TABLE books DROP COLUMN IF EXISTS new_column;
```

Store rollback scripts alongside migrations: `./migrations/NNNN_rollback.sql`.

## Pre-Migration Checklist

- [ ] Database backup completed and verified
- [ ] Maintenance window scheduled and communicated
- [ ] Rollback script written and tested on staging
- [ ] Staging migration succeeded without errors
- [ ] Application smoke tests pass on staging
- [ ] On-call engineer aware and available
- [ ] Monitoring dashboards open (connections, query latency, error rate)
- [ ] `pg_stat_activity` monitoring ready

## Post-Migration Checklist

- [ ] All health checks passing
- [ ] No elevated error rates in application logs
- [ ] Query latency within expected bounds
- [ ] New indexes confirmed via `pg_indexes`
- [ ] Rollback script archived (not deleted) for future reference
