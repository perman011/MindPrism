# Technical PRD V3: MindPrism Onboarding + Dashboard

## Problem
Current app has three blocking issues:
1. Brand inconsistency (non-transparent logo tile, mixed naming/case treatment).
2. Theme contrast drift in dark backgrounds.
3. Shorts/book thumbnails and media intermittently failing to render.

## Goals
1. Ship a consistent dark-purple onboarding + dashboard UX.
2. Enforce brand lockup: transparent pen icon + lowercase `mindprism`.
3. Eliminate broken media rendering states in user-visible cards.
4. Establish release gates for production readiness.

## Non-Goals
1. Full admin redesign.
2. New content models.
3. Native app changes.

## Functional Requirements
1. Unified logo lockup component and theme-aware contrast.
2. 3-step onboarding flow with persistence.
3. Dashboard hierarchy refresh with Chakra/Shorts switch.
4. Media URL validation before render.
5. Image/video fallback rendering on load failure.
6. Byte-range support for streamed media.
7. Upload format policy limited to browser-safe formats.
8. E2E coverage for media + onboarding + dashboard critical paths.

## NFRs
1. No broken-image icons in primary dashboard rails.
2. Dashboard key sections render with fallback under partial data failure.
3. p75 dashboard FMP <= 2.5s.
4. Feature-flagged rollout with rollback switch.

## Delivery Plan
1. Correctness and media reliability first.
2. Brand/theming unification second.
3. Architecture + QA gates third.
