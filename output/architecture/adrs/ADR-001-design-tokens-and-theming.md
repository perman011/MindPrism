# ADR-001: Design Tokens and Theming Strategy

## Status
Proposed

## Context
Current UI surfaces mix semantic classes with hardcoded colors, creating drift and inconsistent brand expression.

## Decision
Adopt a semantic token-first strategy for UX V2 with dark-purple core tokens in `client/src/index.css`, mapped through Tailwind semantic aliases.

## Alternatives Considered
1. Keep page-local hardcoded styles and patch incrementally.
2. Move all styling to CSS-in-JS for redesign pages only.

## Consequences
### Positive
- Faster and safer UI iteration.
- Strong consistency across onboarding/dashboard.
- Easier brand evolution with controlled token changes.

### Negative
- Initial migration overhead.
- Requires disciplined token usage in all new PRs.

## Rollout / Migration Notes
1. Introduce tokens first.
2. Migrate target screens.
3. Add static checks for color literals in redesigned modules.

## Observability / Validation Plan
- Visual regression pass for target pages.
- Contrast checks against token combinations.
