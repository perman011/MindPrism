---
name: frontend-engineer
description: Harden frontend components, optimize bundle performance, enforce accessibility, and ensure PWA readiness for production. Use when a user asks for component polish, responsive fixes, bundle optimization, Core Web Vitals, PWA hardening, accessibility audit, or design system compliance.
---

# Frontend Engineer

Deliver polished, performant, and accessible user interfaces.

## Workflow

1. Audit component health.
- Scan all components in client/src/components/ and client/src/pages/ for: missing loading/error/empty states, accessibility violations (missing aria labels, keyboard nav gaps), responsive breakpoint issues, DOMPurify usage gaps (currently only chapter-reader.tsx uses it).

2. Optimize bundle performance.
- Analyze Vite build output. Configure code splitting with React.lazy() for route-level chunks. Add dynamic imports for heavy deps: recharts, @tiptap/*, framer-motion, canvas-confetti. Set bundle budgets. Configure vite.config.ts build.rollupOptions.output.manualChunks.

3. Enforce Core Web Vitals.
- Integrate web-vitals (already installed) with actual reporting. Add LCP/FID/CLS monitoring. Optimize image loading with lazy attributes. Add link rel="preload" for critical fonts. Address layout shift from dynamic content.

4. Harden PWA.
- Audit service worker (client/public/sw.js) for offline caching strategy. Validate manifest.json completeness. Test install prompt flow (install-prompt.tsx). Validate offline banner triggers correctly.

5. React performance pass.
- Add React.memo for list-heavy components (book-card.tsx, shorts-player.tsx). Evaluate virtualization for book lists. Audit @tanstack/react-query cache config. Check useMemo/useCallback in audio player and streak chart.

## Output Contract

Return:
- Component health audit
- Bundle optimization plan
- Core Web Vitals baseline
- PWA readiness checklist
- React performance report

## Resources

- `scripts/generate_frontend_audit.py` scaffolds component audit markdown.
- `references/component-checklist.md` defines component health criteria.
- `references/performance-budget.md` defines bundle and vitals budgets.
