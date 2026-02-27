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

### Admin Book Management (`server/admin-routes.ts`)
- **Book Listing**: `GET /api/admin/books` (authenticated, admin+) returns ALL books including drafts. Customer `/api/books` only returns published/published_with_changes books.
- **Draft Workflow**: Published books edited via draft layer (`book_versions` table). Endpoints: GET/PUT `/api/admin/books/:id/draft`, POST `publish-draft`, POST `discard-draft`, GET `diff`, GET `versions`.
- **Book Statuses**: `draft` (admin-only), `published` (customer-visible), `published_with_changes` (customer sees live version, admin sees pending draft).
- **Data Isolation**: Public `/api/books/:id` blocks access to draft-status books. No `includeAll` parameter on public endpoints.

### Recommendation Algorithm (`server/routes.ts`, `client/src/pages/dashboard.tsx`)
- **Endpoint**: `GET /api/books/recommended` (authenticated) reads user onboarding interests from `user_interests` table, maps them to category slugs via `INTEREST_TO_CATEGORY_SLUGS`, filters published books by matching `categoryId`, excludes books the user has started (via `user_progress.currentCardIndex > 0`), falls back to featured then remaining books if < 3 matches, returns up to 10 books.
- **Dashboard Carousel**: "Recommended For You" section with gold "Based on your interests" label, positioned between "Jump Back In" and "All Books". Hidden if user has no onboarding preferences.
- **Interest-to-Category Mapping**: 12 onboarding interest IDs (anxiety, productivity, body-language, leadership, mindfulness, habits, relationships, decision-making, confidence, stoicism, creativity, emotional-iq) mapped to 5 category slugs (habits, mindset, mindfulness, emotions, meaning).

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

### User Activity & Personal Stats (`server/routes.ts`, `client/src/components/personal-stats.tsx`)
- **Activity Log**: `user_activity_log` table tracks timestamped events: book_opened, chapter_completed, section_viewed, audio_played, exercise_completed, journal_entry_created, book_completed, session_start, session_end.
- **Log Endpoint**: `POST /api/user/activity` (authenticated) accepts eventType, eventData (JSON), bookId, sessionDuration.
- **Stats Endpoint**: `GET /api/user/stats` (authenticated) returns aggregated stats: booksStarted, booksCompleted, principlesMastered, exercisesDone, categoriesExplored, totalTimeInvested, avgTimePerBook, streaks, journalEntries, weeklyActivity (7-day bar chart data).
- **Vault Integration**: Stats tab added as first tab in Vault page (My Vault > Stats). Shows 6 stat cards, weekly activity Recharts bar chart, and 4 highlight cards.

### Analytics (`server/routes/analytics.ts`, `client/src/lib/analytics.ts`)
- **Event Tracking**: `POST /api/analytics/events` ingests events (authenticated users). Schema: eventType, eventData (JSON), pageUrl, sessionId.
- **Frontend Tracker** (`client/src/lib/analytics.ts`): `trackEvent()`, `trackPageView()`, `trackBookOpen()`, `trackAudioPlay()`, etc. Debounced, sessionId via sessionStorage, `sendBeacon` in production.
- **Tracked Events**: `page_view` (dashboard), `book_open` (book detail), `audio_play` (audio page), `chapter_start`/`chapter_complete` (story engine).
- **Admin Dashboard** (`/admin/analytics`): Overview cards, recharts line/bar charts (DAU, signup trend, popular books), event breakdown badges, recent events feed.
- **Admin API**: `GET /api/analytics/overview` (stats + charts), `GET /api/analytics/admin-events` (paginated events). Admin role required.

### Push Notifications (`server/routes/notifications.ts`, `server/services/notificationScheduler.ts`)
- **Service Worker** (`client/public/sw.js`): Handles push events, shows rich notifications, click-to-navigate.
- **Notification Routes**: GET/PUT `/api/notifications/preferences`, POST `/api/notifications/subscribe`, POST `/api/notifications/test`, POST `/api/notifications/dismiss-prompt`, GET `/api/notifications/vapid-key`.
- **Permission Prompt** (`client/src/components/notification-prompt.tsx`): Modal with MindPrism logo, shown after onboarding, 7-day dismiss cooldown.
- **User Preferences** (`client/src/components/notification-settings.tsx`): In Vault > Settings — toggles for daily reminder, streak alerts, new content, weekly summary; time picker for reminder time; test notification button.
- **Scheduler** (`server/services/notificationScheduler.ts`): node-cron jobs for daily reminders (hourly check matching user's configured time), streak risk (8PM UTC), weekly summary (Sun 10AM UTC).
- **New Book Notifications**: `sendNewBookNotification()` function available for admin book publish flow.
- **Database**: `notification_preferences` table with user preferences, push subscription (JSONB), permission status, dismiss tracking.
- **VAPID Keys**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VITE_VAPID_PUBLIC_KEY` env vars.

### PWA & Offline Mode
- **Web App Manifest** (`client/public/manifest.json`): name, short_name, theme_color (#d4a017), background_color (#000000), display standalone, portrait orientation, categories.
- **PWA Icons** (`client/public/icons/`): icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png, apple-touch-icon.png. Generated from golden feather logo on black background.
- **Service Worker** (`client/public/sw.js`): Merged caching + push notifications. Cache-First for static assets (JS/CSS/images/fonts), Network-First for API book/category data, offline fallback page with MindPrism branding.
- **Offline Banner** (`client/src/components/offline-banner.tsx`): Subtle gold "You're offline" banner at top when connection lost.
- **Install Prompt** (`client/src/components/install-prompt.tsx`): Custom PWA install modal after 2+ visits, 30-day dismiss cooldown, MindPrism logo, gold Install button.
- **Meta Tags** (`client/index.html`): apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style (black-translucent), theme-color, manifest link, apple-touch-icon.
- **Background Sync**: Queued offline actions synced when back online via `sync` event.

### Affiliate Buy Button & Social Sharing
- **Affiliate URL**: `affiliate_url` column on `books` table (VARCHAR 500). Admin-editable via Book Setup Editor (`input-affiliate-url`).
- **Buy Button** (`client/src/pages/book-detail.tsx`): Gold-outlined "Buy This Book" button with shopping cart icon, shown below Read/Listen when `affiliateUrl` is set. Opens in new tab, tracks `affiliate_click` event via activity log.
- **Share Modal** (`client/src/components/share-modal.tsx`): Reusable share component with Copy Link, Twitter/X, LinkedIn, WhatsApp options. Uses Web Share API on mobile, falls back to modal on desktop. Black/gold themed.
- **Share Button**: Added to book detail page top-right action bar alongside bookmark button.
- **Progress Share Card** (`client/src/components/progress-share-card.tsx`): Canvas-generated branded PNG showing user stats (books, streak, principles, minutes). Uses Web Share API with file sharing or falls back to download. Placed at bottom of PersonalStats in Vault > Stats tab.

## External Dependencies
- **Authentication:** Replit Auth (OpenID Connect)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Payments:** Stripe (for premium subscriptions and billing portal)
- **Security:** Helmet.js (security headers), express-rate-limit (rate limiting)
- **Error Monitoring:** Sentry (`@sentry/react` client, `@sentry/node` server) — requires `SENTRY_DSN` secret and `VITE_SENTRY_DSN` env var; gracefully disabled when DSN absent