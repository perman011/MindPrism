# MindPrism - Psychology Made Simple

## Overview
MindPrism is a mobile-first web application designed to make psychology and self-help concepts accessible and engaging. It transforms extensive books into structured, interactive learning experiences by breaking down complex information into a streamlined taxonomy: core theses, chapter summaries, and mental models. The project aims to provide users with a streamlined path to personal growth and psychological understanding, focusing on mobile accessibility and engaging content delivery.

## User Preferences
I prefer clear and concise communication. When making changes, please explain the rationale briefly. For development, prioritize mobile-first design principles. I value iterative development, so incremental updates with clear descriptions are preferred.

**Critical mandate:** "Make sure you do not change anything on this app I really like it" — all changes purely additive/visual; user can explicitly request removals.

## System Architecture
MindPrism utilizes a modern web stack: React, TypeScript, Vite, TailwindCSS, and Shadcn/UI for the frontend, and Express.js with TypeScript for the backend. PostgreSQL with Drizzle ORM handles data persistence, incorporating Row-Level Security for sensitive data. Authentication is managed via Replit Auth.

The content is organized into a hierarchical "Psychological Taxonomy." The application features a consumer-facing app with pages for landing, onboarding, a personalized dashboard, book discovery, audio summaries, and a "Growth Vault" for journaling and progress tracking. A comprehensive admin portal (`/admin`) is also included for content creation, editing, and user management, featuring a 3-panel editor with a Mind Tree navigator, Block Builder, and mobile preview.

### Design System
- **Theme:** Light mode default with full Dark Mode support (toggle in Vault > Settings). Headway-inspired cream/blue/white aesthetic for consumer; admin retains purple (#341539).
- **Colors (Consumer):** Primary blue (#3B82F6, CSS var `--primary: 217 91% 60%`); background cream (#F5F0EB, `30 23% 94%`); cards white; text #111827; muted #6B7280; streak/warning orange (#F97316, `24 94% 53%`); success green (#4CAF7D).
- **Colors (Admin):** Hardcoded purple hex (#341539, #1A1225) — NOT affected by CSS variable changes.
- **Dark Mode:** Primary → `213 94% 68%` (#60A5FA blue); background: #0F0A14; cards: #1A1225; borders: #2A1E35. ThemeProvider wraps App with localStorage persistence and system preference detection.
- **Typography:** Inter (sans-serif) for ALL consumer text (headings, body, UI labels, buttons, navigation). Playfair Display removed from consumer pages.
- **Components:** Buttons pill-shaped (48px h) with blue primary and visible outline variants, cards rounded-2xl with p-4 and hover shadow transitions, inputs 48px tall with 10px radius. Cards have transition-shadow duration-200 ease-out for hover elevation.
- **Accessibility:** ARIA labels on all icon-only buttons, aria-current on active nav, keyboard navigation in Story Engine, prefers-reduced-motion CSS media query, minimum 44px touch targets.
- **Animation:** Framer Motion 200ms fade-in animations, reduced motion support.
- **Charts:** 6-color palette using design tokens (chart-1 through chart-6).

### Features
- **Chakra Energy Map** and Interactive Engine for dynamic content rendering
- **Full-Text Search** with ILIKE across books, debounced suggestions, recent searches (localStorage), clear all button
- **Recommendation V2** with collaborative filtering and "Because You Read" carousel
- **Dashboard Mode Toggle** — pill-shaped Chakra/Reels segmented control switches between ChakraAvatar energy map and inline shorts/reels grid
- **Shorts Pipeline** with admin gradient picker, rich text editing, trending sort by views, share button, 12+ seed shorts
- **Audio Management** with audioDuration field, continue listening section on dashboard, sample audio URLs for all books
- **Social Sharing** with branded progress share card, Web Share API, milestone triggers (7/30/100 day streaks)
- **Streak Gamification** with freeze mechanic, milestone badges (7/14/30/60/100 days), celebration modal
- **Content Paywalling** with PremiumGate overlay in Story Engine
- **Analytics V2** with DAU/WAU/MAU cards, engagement chart, funnel visualization, content performance, tabbed layout (Overview/Engagement/Content/Events), plus Revenue tab for subscription analytics, date range filter (7d/30d/90d)
- **Content Quality Scoring** with completeness percentages and "Content Health" overview in admin
- **Image Optimization** with lazy loading, explicit width/height, skeleton states
- **Database Performance** with composite indexes on user_progress, journal_entries, analytics_events, books, user_activity_log; query timing logging for >500ms queries
- **PWA** features including offline mode, service worker, install prompt
- **Push Notifications** with daily reminders, streak alerts, new content notifications
- **Landing Page** with animated gradient hero, Inter headline, OG meta tags
- **Story Engine** with keyboard navigation (arrow keys), tap zones, reduced motion support, blue accent colors
- **Growth Vault** with book attribution on highlights, loading skeletons, dark mode heatmap
- **Lazy Loading** — all page routes use React.lazy + Suspense for code splitting
- **Skeleton Loading** — all consumer pages show layout-matching skeleton screens instead of spinners
- **Shorts Viewer Controls** — tap-to-pause/play with centered icon overlay, interactive progress bar scrubbing, default blue gradients for text shorts

### Security
- AES-256-GCM encryption for journal entries
- RLS policies
- RBAC: user < writer < editor < admin < super_admin
- Helmet.js for CSP and security headers
- express-rate-limit for API rate limiting
- Stripe integration (graceful degradation when keys not configured)
- Sentry error tracking (guarded by SENTRY_DSN env var)

### Admin Portal
- **Persistent Sidebar Navigation** — collapsible left sidebar with Books, Shorts, Users, Analytics, Media nav items; replaces distributed header buttons
- **File Upload System** — multer memory + Replit Object Storage upload API (`POST /api/admin/upload`), drag-and-drop FileUpload component with progress bar, URL fallback, image/audio/video preview; files stored persistently in Object Storage (survive deployments); served via `/objects/uploads/...` URLs; integrated in Book Setup Editor and Shorts Creator. **Note:** Express 5 `{*param}` wildcard returns arrays — the `/objects/` route joins array params before path resolution. `normalizeMediaUrl` handles `/objects/uploads/...`, `/uploads/...`, `objects/uploads/...`, and absolute URLs with console warnings for unrecognized formats.
- **Media Library** — `/admin/media` page listing all uploaded files from Object Storage with type filters, copy URL, and delete (super_admin only)
- **Admin Preview Mode** — full-screen preview from book editor with Desktop/Tablet/Mobile viewport switching, preview warning banner, and book detail simulation
- Draft workflow for content editing with publish cycle
- 3-panel editor with Mind Tree navigator, Block Builder, mobile preview
- Admin-specific book API (`/api/admin/books/:id`) that loads books regardless of status (draft/published)
- Publishing validation checklist: core thesis 50+ chars, 3+ chapters, 1+ mental model, description, cover image, category required
- Content Quality Scoring with completeness % per book and tooltip formula breakdown
- Auto-save indicator showing "Saving...", "All changes saved" status, plus explicit "Save Changes" button in editor header
- Book list with search, status filter (All/Published/Draft), sort (Name/Completeness), and bulk publish/unpublish with validation
- User management with role assignment, email privacy masking (show/hide toggle), user activity details (last login, books started, progress), and Remove User (super_admin, DELETE endpoint)
- Analytics dashboard (Overview/Engagement/Content/Revenue tabs) with events pagination, type filtering, and CSV export
- Shorts management with gradient picker, rich text editing, 12 seed shorts across all 5 books
- Consistent admin access control middleware (isAdmin/requireAdminRole) across all admin API endpoints

## External Dependencies
- **Authentication:** Replit Auth (OpenID Connect)
- **Database:** PostgreSQL
- **Object Storage:** Replit Object Storage (Google Cloud Storage) for persistent media uploads
- **ORM:** Drizzle ORM
- **Payments:** Stripe (graceful degradation if not configured)
- **Security:** Helmet.js, express-rate-limit
- **Error Monitoring:** Sentry (optional, guarded by env var)
- **Typography:** Google Fonts (Inter)
- **Icons:** Lucide React
- **Animation:** Framer Motion
- **Charts:** Recharts

## Key Documentation
- `docs/PRODUCT_BACKLOG.md` — Full product backlog with 20 tickets across 8 epics
- `docs/UI_DESIGN_SYSTEM.md` — Complete visual design guide with color palettes, typography, component tokens, animation presets, dark mode mapping
