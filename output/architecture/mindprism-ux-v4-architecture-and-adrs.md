# ARCH V4: Scalable Architecture from PRD + RCA

## 1. Architecture Goals
1. Make rendering resilient to imperfect/legacy data.
2. Keep API contracts canonical and enforceable.
3. Scale media delivery reliability for image/audio/video.
4. Formalize release gating and observability.

## 2. Proposed Architecture
### Client Layer
- Shared `resolveMediaUrl()` in UI layer.
- Shared fallback components for cover/thumbnail/media preview.
- Dashboard/shorts/book cards consume a single contract.

### API Layer
- Validate and normalize media fields at create/update boundaries.
- Enforce publish contract by media type.
- Keep canonical path output in API responses.

### Media Delivery Layer
- Object serving with cache headers + byte-range support.
- Strict allowlist for browser-safe formats.

### Data Quality Layer
- Scheduled detector for stale/orphaned media paths.
- Optional backfill script for legacy records.

### Delivery/Ops Layer
- CI quality gates for P0 media journeys.
- Feature-flag rollout and fast rollback.

## 3. Scalability Notes
1. Stateless API; horizontal scale safe.
2. Media traffic offloaded to object/CDN path with range.
3. Optional future: aggregated dashboard endpoint for reduced client fan-out.

## 4. ADR Map
- ADR-V4-001 Canonical media path contract.
- ADR-V4-002 Client rendering fallback standard.
- ADR-V4-003 Range-first media serving policy.
- ADR-V4-004 Publish enforcement policy.
- ADR-V4-005 Release gate and observability policy.
