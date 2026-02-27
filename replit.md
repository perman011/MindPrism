# MindPrism - Psychology Made Simple

## Overview
MindPrism is a mobile-first web application designed to make psychology and self-help concepts accessible and engaging. It transforms extensive books into structured, interactive learning experiences by breaking down complex information into a psychological taxonomy. This includes core theses, chapter summaries, mental models, principles with real-world stories, common mistakes, interactive exercises, and actionable items. The project aims to provide users with a streamlined path to personal growth and psychological understanding.

## User Preferences
I prefer clear and concise communication. When making changes, please explain the rationale briefly. For development, prioritize mobile-first design principles. I value iterative development, so incremental updates with clear descriptions are preferred.

## System Architecture
MindPrism utilizes a modern web stack with React, TypeScript, Vite, TailwindCSS, and Shadcn/UI for the frontend, and Express.js with TypeScript for the backend. PostgreSQL with Drizzle ORM handles data persistence, incorporating Row-Level Security for sensitive data like journal entries. Authentication is managed via Replit Auth (OpenID Connect).

The content is organized into a hierarchical "Psychological Taxonomy" featuring a core thesis, chapter summaries, mental models, principles with supporting stories, common mistakes, infographics, exercises, and action items.

The application features a consumer-facing app with pages for landing, onboarding, a personalized dashboard, book discovery, audio summaries, and a "Growth Vault" for journaling and progress tracking. A comprehensive admin portal (`/admin`) is also included for content creation, editing, and user management, featuring a 3-panel editor with a Mind Tree navigator, Block Builder, and mobile preview.

UI/UX emphasizes a **black & gold** color scheme (primary gold: HSL 43 75% 49%, backgrounds: pure black/very dark gray, accent: darker gold HSL 43 89% 38%). The logo is a golden feather/pen (`@assets/77531E8D-...png`) displayed with `mix-blend-screen` on wrapper divs. Fonts: 'Inter' (sans), 'Source Serif Pro' (serif), 'Nunito' (mono). Mobile-first, card-based design with interactive elements and animations powered by Framer Motion. Key interactive components include a Chakra Energy Map and an Interactive Engine that dynamically renders content based on specific card templates for different content types.

Security is paramount, with AES-256-GCM encryption for journal entries, RLS policies, and a Role-Based Access Control (RBAC) system (super_admin > admin > editor > writer > user) governing access to features and content within both the consumer and admin applications.

### Security Middleware (`server/middleware/`)
- **Helmet.js** (`security.ts`): CSP headers (dev mode allows `unsafe-inline`/`unsafe-eval` for Vite, production is strict), HSTS, X-Frame-Options DENY, noSniff, referrer-policy. CORS configured for `.replit.app`, `.repl.co`, `mindprism.io`, `localhost`.
- **Rate Limiting** (`rateLimiter.ts`): `authLimiter` (5/min) on `/api/login`, `/api/callback`, `/api/auth`; `apiLimiter` (100/min) on all `/api/*`; `publicLimiter` (20/min) available for unauthenticated endpoints.
- **Query Logger** (`queryLogger.ts`): Per-request query count/avg tracking via WeakMap; logs slow queries (>500ms) as warnings.
- **Web Vitals** (`client/src/lib/performance.ts`): Tracks LCP, FID, CLS, TTFB, INP; logs to console in dev, sends to `POST /api/metrics` in production.
- **Metrics Endpoint** (`server/routes/metrics.ts`): Receives Web Vitals data; rate-limited to 30/min; logs metrics server-side.
- Applied in `server/index.ts` before body parsing and route registration.

### SEO (`client/src/components/SEOHead.tsx`)
- Reusable `<SEOHead>` component using `react-helmet-async` for dynamic per-page `<title>`, `<meta description>`, Open Graph, and Twitter Card tags.
- `HelmetProvider` wraps the app in `App.tsx`.
- All consumer pages (landing, dashboard, discover, vault, audio, book-detail, onboarding, not-found) and admin pages have `SEOHead`.
- Only the landing page is indexable; all authenticated and admin pages use `noIndex`.

### Database Backups (`server/services/`)
- **Backup Service** (`backup.ts`): pg_dump to gzip-compressed SQL files, list/delete/download/rotate operations.
- **Backup Scheduler** (`backupScheduler.ts`): Daily at 3:00 AM UTC via `node-cron`, keeps last 7 backups.
- **Backup Routes** (`server/routes/backup.ts`): GET/POST/DELETE at `/api/admin/backups` (admin/super_admin only).
- Graceful shutdown on SIGTERM/SIGINT stops scheduler.

### Analytics (`server/routes/analytics.ts`, `client/src/lib/analytics.ts`)
- **Event Tracking**: `POST /api/analytics/events` ingests events (authenticated users). Schema: eventType, eventData (JSON), pageUrl, sessionId.
- **Frontend Tracker** (`client/src/lib/analytics.ts`): `trackEvent()`, `trackPageView()`, `trackBookOpen()`, `trackAudioPlay()`, etc. Debounced, sessionId via sessionStorage, `sendBeacon` in production.
- **Tracked Events**: `page_view` (dashboard), `book_open` (book detail), `audio_play` (audio page), `chapter_start`/`chapter_complete` (story engine).
- **Admin Dashboard** (`/admin/analytics`): Overview cards, recharts line/bar charts (DAU, signup trend, popular books), event breakdown badges, recent events feed.
- **Admin API**: `GET /api/analytics/overview` (stats + charts), `GET /api/analytics/admin-events` (paginated events). Admin role required.

## External Dependencies
- **Authentication:** Replit Auth (OpenID Connect)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Payments:** Stripe (for premium subscriptions and billing portal)
- **Security:** Helmet.js (security headers), express-rate-limit (rate limiting)
- **Error Monitoring:** Sentry (`@sentry/react` client, `@sentry/node` server) — requires `SENTRY_DSN` secret and `VITE_SENTRY_DSN` env var; gracefully disabled when DSN absent