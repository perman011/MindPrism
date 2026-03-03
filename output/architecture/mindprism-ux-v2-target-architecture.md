# Target Architecture Proposal: MindPrism UX V2 Dark Purple

## 1. Current-State Snapshot

### Runtime Topology
- Client: React + Vite SPA (`client/src/*`)
- API: Express monolith (`server/index.ts`, `server/routes.ts`, route modules)
- Data: PostgreSQL via Drizzle ORM (`server/db.ts`, `shared/schema.ts`)
- Auth: Replit auth integration and role checks
- Analytics: `/api/analytics/events` ingestion + admin analytics reporting

### Pain Points Relevant to UX V2
1. Visual primitives are partly centralized and partly hardcoded per page.
2. Onboarding/dashboard share patterns but not enough reusable components.
3. Dashboard data fetch strategy may create fragmented loading behavior.
4. Rollout safety for major UX changes is not formalized.

## 2. Target-State Architecture

## 2.1 Frontend Architecture Layers
1. **Design Token Layer**
- Central token source in `client/src/index.css`.
- Semantic aliases consumed by Tailwind and components.

2. **UI Primitive Layer**
- Shared `LogoLockup` and Button V2 primitives.
- Unified state styles (focus, loading, disabled).

3. **Feature Composition Layer**
- Onboarding step shell and dashboard block composition.
- Block-level empty/loading/error boundaries.

4. **Instrumentation Layer**
- Typed analytics helper events for onboarding and dashboard funnel.

## 2.2 Backend/API Layer
1. Reuse existing endpoints for onboarding submission and content retrieval.
2. Add optional `GET /api/dashboard/home` aggregation endpoint for scalable dashboard loading.
3. Keep analytics ingestion on existing `/api/analytics/events` with schema-safe payloads.

## 2.3 Deployment and Scale Path
1. Keep API stateless across instances.
2. Maintain PostgreSQL as source of truth.
3. Ensure static assets are cacheable and immutable (hashed builds).
4. Introduce feature flag gate for controlled UX rollout.

## 3. NFR and SLO Targets

### Availability
- UX V2 path availability target: 99.9% monthly.

### Performance
- Dashboard p75 first meaningful paint <= 2.5s (mobile broadband profile).
- Additional CSS payload increase <= 35KB gzip.

### Reliability
- Onboarding submission failure does not lose selected interests.
- Dashboard supports graceful block-level degradation.

### Security
- No new unauthenticated write endpoints.
- Analytics write path remains authenticated and schema-validated.

### Observability
- Required UX events visible in analytics within 5 minutes.
- Error rates segmented by `ux_v2_dark_purple` flag variant.

## 4. Proposed Data and Contract Changes

### Required for MVP
- No schema migration required.
- Event taxonomy extension only (new event names/payload keys).

### Recommended v2.1
- Add server-side UI preference storage if persistent UX customization is needed.

## 5. Reliability and Security Controls
1. Feature flag kill switch for full UX rollback.
2. Component-level error boundaries for critical blocks.
3. Retry policies for key dashboard data queries.
4. Preserve auth and role middleware patterns unchanged.

## 6. Migration Roadmap

### Phase A
- Tokens, button primitives, logo component.

### Phase B
- Onboarding 3-step flow and analytics events.

### Phase C
- Dashboard hierarchy refactor and data adapter.

### Phase D
- Feature-flag rollout, monitoring, and post-launch review.

## 7. Risk Register and Mitigations
1. **Token drift risk**
- Mitigation: static scan for hardcoded color literals in target pages.

2. **Dashboard regression risk**
- Mitigation: block-level loading/error states and e2e regression tests.

3. **Rollout impact risk**
- Mitigation: cohort rollout + kill switch + event-based quality gates.

## 8. Architecture Decision Summary
- See ADR set:
  - `ADR-001`: Design tokens and theming strategy
  - `ADR-002`: Shared button primitive strategy
  - `ADR-003`: Dashboard data aggregation strategy
  - `ADR-004`: Onboarding state persistence strategy
  - `ADR-005`: Feature-flag rollout and observability strategy
