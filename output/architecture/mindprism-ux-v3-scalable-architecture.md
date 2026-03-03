# Architecture V3: Scalable Plan

## Target Shape
1. Client: React UI with shared media render guards and fallback components.
2. API: Express routes with strict publish validation and typed payload checks.
3. Media: object storage served with range-enabled streaming and cache headers.
4. Delivery: feature-flagged UX rollout with observability gates.

## Core Flows
1. Upload flow: client upload -> storage URL -> persisted media fields.
2. Publish flow: validate media contract -> publish short.
3. Render flow: URL sanity check -> media render attempt -> fallback surface.

## Scale Considerations
1. Media streaming supports partial content (`206`) to reduce replay cost.
2. CDN/object cache headers retained for static assets.
3. Dashboard can evolve to aggregated endpoint if query fan-out grows.

## Reliability Controls
1. Local fallback for every card-level media render.
2. Server-side publish contract enforcement.
3. E2E checks for critical browse and playback journeys.

## ADR Index
- `ADR-V3-001` Brand lockup standard
- `ADR-V3-002` Client media render guard pattern
- `ADR-V3-003` Range-enabled media delivery
- `ADR-V3-004` Publish contract enforcement
- `ADR-V3-005` Release gating policy
