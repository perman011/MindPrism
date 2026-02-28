# MindPrism Product Backlog

**Product:** MindPrism — Psychology Made Simple
**Last Updated:** 2026-02-28
**Product Owner:** PM/PO Agent Team
**Priority Framework:** MoSCoW (Must / Should / Could / Won't)

---

## Current State Assessment

### Completed Features
- Landing page with animated carousel
- Replit Auth (OIDC) with session management and RBAC
- Onboarding flow with interest-based personalization
- Dashboard with greeting, Daily Spark, recommendation carousels
- Discover page with search, category pills, 2-column book grid
- Book Detail page with hero, metric badges, syllabus accordion
- Interactive Story Engine (Instagram Stories-style card swiping)
- Audio player with mini-player
- Growth Vault with SummaryStats, 30-day StreakChart, journal, highlights
- Chakra Energy Map / Personal Aura
- Admin CMS portal with draft workflow, 3-panel editor
- Admin user management (role assignment, premium toggling)
- Security middleware (Helmet.js, CORS, rate limiting)
- Dream Curtain (#341539) design system
- Push notifications (service worker, daily reminders, streak alerts)
- PWA offline mode with install prompt
- Database backup scheduler
- Analytics event tracking

### Gaps Identified
- Stripe subscriptions configured in code but not live (missing price IDs)
- Premium content gating is basic (isPremium flag, no granular paywalling)
- Shorts feature partially implemented (player works, content sparse)
- Audio content URLs mostly empty in seed data
- No social/community layer
- Analytics dashboard has structural UI but limited real visualizations
- Search is basic title/author matching (no full-text, no trending)

---

## Epic 1: Premium Monetization & Stripe

### MIND-100: Configure Live Stripe Integration
**Priority:** Must Have
**Story Points:** 5
**Blocked By:** User must provide Stripe keys

**User Story:**
As a user, I want to subscribe to MindPrism Premium so that I can access exclusive content and features.

**Technical Spec:**
- Set up `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_YEARLY_PRICE_ID` environment variables
- Verify webhook endpoint (`POST /api/webhooks/stripe`) handles all subscription lifecycle events
- Test checkout flow end-to-end: free user → checkout → webhook → `isPremium = true`
- Test portal session: manage/cancel subscription
- Ensure `customer.subscription.deleted` webhook sets `isPremium = false`

**Acceptance Criteria:**
- [ ] Monthly and yearly checkout sessions create real Stripe subscriptions
- [ ] Webhook correctly updates user `isPremium` and `stripeCustomerId`
- [ ] Portal session allows subscription management
- [ ] Cancellation webhook revokes premium status within 60 seconds
- [ ] Error states show user-friendly messages (not raw Stripe errors)
- [ ] PremiumGate component correctly blocks/allows content

**Files:** `server/stripe-routes.ts`, `client/src/components/premium-gate.tsx`

---

### MIND-101: Granular Content Paywalling
**Priority:** Should Have
**Story Points:** 8
**Blocked By:** MIND-100

**User Story:**
As a product owner, I want to control which content requires Premium so that free users get value while Premium users get exclusive deep dives.

**Technical Spec:**
- Add `premiumOnly` boolean field to `books` table (default false)
- Add `freePreviewCards` integer field to `books` table (default 5) — number of Story Engine cards free users can view
- Modify Story Engine card loading: after `freePreviewCards`, show PremiumGate overlay
- Modify book detail page: show "Premium" badge on premium books
- Admin editor: add toggle for "Premium Only" and "Free Preview Cards" count
- Modify `/api/books/:id/cards/:section` to enforce preview limit for non-premium users

**Acceptance Criteria:**
- [ ] Free users can preview first N cards of premium books
- [ ] PremiumGate overlay appears after preview limit with CTA to subscribe
- [ ] Admin can toggle premium status and set preview card count per book
- [ ] Premium users see all content without gates
- [ ] Free books remain fully accessible regardless of subscription
- [ ] API enforces limits server-side (not just client-side)

**Files:** `shared/schema.ts`, `server/routes.ts`, `client/src/pages/story-engine.tsx`, `client/src/pages/book-detail.tsx`, `server/admin-routes.ts`

---

### MIND-102: Subscription Analytics Dashboard
**Priority:** Could Have
**Story Points:** 5
**Blocked By:** MIND-100

**User Story:**
As an admin, I want to see subscription metrics so that I can track revenue and conversion.

**Technical Spec:**
- Add admin route `GET /api/admin/subscription-stats` returning: total subscribers, monthly vs yearly breakdown, MRR, churn rate (last 30 days), conversion rate (free → premium)
- Add a "Revenue" tab to existing admin analytics dashboard
- Display: subscriber count card, MRR card, conversion funnel chart, churn trend line
- Query: count users where `isPremium = true`, group by `stripeCustomerId` patterns

**Acceptance Criteria:**
- [ ] Revenue tab shows total subscribers, MRR, and churn rate
- [ ] Numbers update in real-time when subscriptions change
- [ ] Only super_admin can access this data
- [ ] Charts use Dream Curtain design system

**Files:** `server/admin-routes.ts`, `client/src/pages/admin/analytics-dashboard.tsx`

---

## Epic 2: Content Quality & Shorts

### MIND-200: Shorts Content Pipeline
**Priority:** Should Have
**Story Points:** 8
**Blocked By:** None

**User Story:**
As a user, I want to discover bite-sized psychology insights through short-form content so that I can learn during quick breaks.

**Technical Spec:**
- Enhance admin Short Editor (`/admin/shorts/new`) with:
  - Rich text content editor (not just plain text)
  - Background gradient picker (predefined palette based on Dream Curtain)
  - Media upload support (thumbnail, optional video URL)
  - Preview panel showing mobile render
- Add "trending" sort to `GET /api/shorts` based on `short_views` count
- Add share button to ShortsPlayer component
- Create seed data: 10+ shorts across different books with varied media types

**Acceptance Criteria:**
- [ ] Admin can create shorts with rich content, gradient backgrounds, and thumbnails
- [ ] Shorts appear in dashboard carousel and dedicated `/shorts` page
- [ ] View counts increment correctly (one per user per short per day)
- [ ] Trending sort returns most-viewed shorts first
- [ ] Share button generates shareable link
- [ ] Mobile-first TikTok-style swipe works smoothly

**Files:** `client/src/pages/admin/admin-short-editor.tsx`, `server/routes.ts`, `client/src/components/shorts-player.tsx`, `server/seed.ts`

---

### MIND-201: Audio Content Management
**Priority:** Should Have
**Story Points:** 5
**Blocked By:** None

**User Story:**
As a user, I want to listen to audio summaries of books so that I can learn while commuting or exercising.

**Technical Spec:**
- Admin book editor: add audio URL field with validation (must be valid URL or upload)
- Add `audioDuration` field to books schema (integer, seconds)
- Update audio page (`/audio`) to only show books with non-null `audioUrl`
- Mini-player: persist across page navigation (already partially implemented)
- Track listening progress in `user_streaks.totalMinutesListened`
- Add "Continue Listening" section to dashboard for partially-listened books

**Acceptance Criteria:**
- [ ] Admin can set audio URL and duration for each book
- [ ] Audio page shows only books with audio content
- [ ] Mini-player persists across navigation
- [ ] Listening time accurately tracked in user stats
- [ ] "Continue Listening" carousel appears on dashboard when applicable
- [ ] Audio player handles errors gracefully (missing URL, network failure)

**Files:** `shared/schema.ts`, `server/admin-routes.ts`, `client/src/pages/audio.tsx`, `client/src/components/audio-player.tsx`, `client/src/pages/dashboard.tsx`

---

## Epic 3: Search & Discovery

### MIND-300: Enhanced Search with Full-Text
**Priority:** Should Have
**Story Points:** 8
**Blocked By:** None

**User Story:**
As a user, I want to search across book titles, authors, principles, and content so that I can find specific insights quickly.

**Technical Spec:**
- Add PostgreSQL full-text search index on `books.title`, `books.author`, `books.description`, `principles.title`, `principles.content`
- Create `GET /api/search?q=<query>&type=<books|principles|all>` endpoint
- Return results ranked by relevance with highlighted matching text
- Client: update Discover page search to call new endpoint
- Add search suggestions dropdown (top 5 results as user types, debounced 300ms)
- Add "Recent Searches" stored in localStorage (last 5 queries)

**Acceptance Criteria:**
- [ ] Search returns results from books AND principles
- [ ] Results show matching text highlighted
- [ ] Suggestions appear within 500ms of typing (debounced)
- [ ] Empty query shows recent searches
- [ ] No results state shows helpful message
- [ ] Search works on mobile with proper keyboard handling

**Files:** `server/routes.ts`, `client/src/pages/discover.tsx`, `shared/schema.ts`

---

### MIND-301: Book Recommendation Algorithm V2
**Priority:** Could Have
**Story Points:** 8
**Blocked By:** None

**User Story:**
As a user, I want increasingly personalized book recommendations so that my learning path feels curated for me.

**Technical Spec:**
- Current algorithm uses onboarding interests only
- Enhance with:
  - Collaborative filtering: "Users who read X also read Y" based on `user_progress`
  - Content-based: match unread books to categories/chakras of completed books
  - Recency weighting: boost recently active categories
  - Completion signal: higher weight for completed books vs abandoned
- Add `GET /api/books/recommended/for-you` with personalized scoring
- Add "Because You Read [Book]" carousel to dashboard

**Acceptance Criteria:**
- [ ] Recommendations improve as user reads more books
- [ ] "Because You Read" carousel shows relevant connections
- [ ] New users get interest-based recommendations (existing behavior preserved)
- [ ] Algorithm runs in < 200ms per request
- [ ] Diversity: no single category dominates recommendations

**Files:** `server/routes.ts`, `client/src/pages/dashboard.tsx`

---

## Epic 4: Social & Engagement

### MIND-400: Progress Sharing & Social Cards
**Priority:** Should Have
**Story Points:** 5
**Blocked By:** None

**User Story:**
As a user, I want to share my learning milestones on social media so that I can inspire others and feel accomplished.

**Technical Spec:**
- Enhance existing `ProgressShareCard` component with:
  - Generated OG image (server-side using canvas or SVG template)
  - Stats: books read, streak, principles mastered
  - Branded with MindPrism logo and Dream Curtain colors
- Add `POST /api/share/generate-card` endpoint that returns a shareable image URL
- Add share triggers: book completion, streak milestones (7, 30, 100 days), first journal entry
- Integrate Web Share API with fallback to copy-to-clipboard

**Acceptance Criteria:**
- [ ] Share card shows personalized stats with MindPrism branding
- [ ] Card renders correctly as an image (not just HTML)
- [ ] Share triggers fire at appropriate milestones
- [ ] Web Share API works on supported browsers, clipboard fallback on others
- [ ] Generated images are cached (don't regenerate on every view)

**Files:** `client/src/components/progress-share-card.tsx`, `server/routes.ts`

---

### MIND-401: Daily Learning Reminders & Streak Gamification
**Priority:** Should Have
**Story Points:** 5
**Blocked By:** None

**User Story:**
As a user, I want streak-based motivation and daily nudges so that I build consistent learning habits.

**Technical Spec:**
- Enhance streak system:
  - Add "freeze" mechanic: users can freeze streak 1x per week (store in `user_streaks`)
  - Add streak milestones: 7, 14, 30, 60, 100 days with visual badges
  - Show milestone celebration modal when reached
- Notification enhancements:
  - "Streak at risk" push notification at 8 PM if no activity today
  - Weekly summary email/notification with stats
- Dashboard: streak counter with fire animation when active

**Acceptance Criteria:**
- [ ] Streak freeze prevents streak reset (1x per week max)
- [ ] Milestone badges appear in Growth Vault stats section
- [ ] Celebration modal fires on milestone achievement
- [ ] "Streak at risk" notification sends at 8 PM local time
- [ ] Weekly summary includes: books read, streak, principles learned
- [ ] Streak counter on dashboard animates when active

**Files:** `server/routes.ts`, `client/src/pages/dashboard.tsx`, `client/src/pages/vault.tsx`, `shared/schema.ts`

---

## Epic 5: Admin & Analytics

### MIND-500: Analytics Dashboard V2
**Priority:** Should Have
**Story Points:** 8
**Blocked By:** None

**User Story:**
As an admin, I want actionable analytics so that I can understand user engagement and content performance.

**Technical Spec:**
- Redesign analytics dashboard with these sections:
  - **Overview cards:** DAU, WAU, MAU, total users, premium %, avg session time
  - **Engagement chart:** Daily active users trend (30 days line chart)
  - **Content performance:** Top 10 books by starts, completions, and completion rate
  - **Funnel:** Onboarding → First Book → First Completion → Premium conversion
  - **Retention:** Day 1, Day 7, Day 30 retention cohorts
- Backend: aggregate queries from `user_activity_log` and `analytics_events`
- All charts use Recharts with Dream Curtain color palette
- Cache results for 5 minutes (avoid expensive queries on every load)

**Acceptance Criteria:**
- [ ] Dashboard loads in < 2 seconds with cached data
- [ ] All charts render with real data from the database
- [ ] Date range selector (7d, 30d, 90d) filters all charts
- [ ] Only admin+ roles can access
- [ ] Mobile-responsive layout (stacked on small screens)

**Files:** `client/src/pages/admin/analytics-dashboard.tsx`, `server/routes/analytics.ts`

---

### MIND-501: Content Quality Scoring
**Priority:** Could Have
**Story Points:** 5
**Blocked By:** MIND-500

**User Story:**
As an admin, I want to see which books have complete content so that I can prioritize filling gaps.

**Technical Spec:**
- Add content completeness score per book: `(filled fields / total possible fields) * 100`
- Fields checked: coreThesis, description, coverImage, audioUrl, at least 3 principles, at least 3 stories, at least 2 exercises, at least 1 chapter summary, at least 1 mental model
- Display score as progress bar in admin book list
- Add "Content Health" overview: total books, avg completeness, books below 50%
- Sortable/filterable by completeness score

**Acceptance Criteria:**
- [ ] Each book shows a completeness percentage in admin list
- [ ] Score calculation matches the defined criteria
- [ ] Books can be sorted by completeness (ascending to find gaps)
- [ ] "Content Health" section on admin dashboard shows aggregate stats
- [ ] Score updates in real-time when content is added/removed

**Files:** `server/admin-routes.ts`, `client/src/pages/admin/admin-books.tsx`

---

## Epic 6: Performance & Quality

### MIND-600: Image Optimization & CDN
**Priority:** Should Have
**Story Points:** 5
**Blocked By:** None

**User Story:**
As a user, I want pages to load quickly even on slow connections so that I can learn anywhere.

**Technical Spec:**
- Implement lazy loading for all book cover images (use `loading="lazy"` and Intersection Observer)
- Add image dimension hints to prevent CLS (Content Layout Shift)
- Optimize cover images: serve WebP format, use srcset for responsive sizes
- Add skeleton loading states for all image-heavy components
- Implement route-based code splitting for admin pages (already lazy-loaded, verify chunk sizes)

**Acceptance Criteria:**
- [ ] Lighthouse Performance score > 80 on mobile
- [ ] No CLS from image loading (score < 0.1)
- [ ] Images below fold only load when scrolled into view
- [ ] Admin bundle is separate from consumer bundle
- [ ] First Contentful Paint < 2 seconds on 3G

**Files:** `client/src/pages/discover.tsx`, `client/src/pages/dashboard.tsx`, `client/src/components/book-card.tsx`

---

### MIND-601: Error Monitoring with Sentry
**Priority:** Should Have
**Story Points:** 3
**Blocked By:** User must provide SENTRY_DSN

**User Story:**
As a developer, I want runtime errors captured automatically so that I can fix issues before users report them.

**Technical Spec:**
- Install `@sentry/react` and `@sentry/node`
- Initialize Sentry in `client/src/main.tsx` with React error boundary
- Initialize Sentry in `server/index.ts` with Express error handler
- Set environment tag (development/production)
- Capture: unhandled exceptions, promise rejections, API 500 errors
- Add breadcrumbs for: page navigation, API calls, user actions

**Acceptance Criteria:**
- [ ] Frontend errors appear in Sentry dashboard with stack traces
- [ ] Backend errors appear with request context (URL, user ID, method)
- [ ] Source maps uploaded for readable stack traces
- [ ] No PII (passwords, tokens) sent to Sentry
- [ ] Error boundary shows fallback UI instead of white screen

**Files:** `client/src/main.tsx`, `server/index.ts`

---

### MIND-602: Accessibility Audit & Fixes
**Priority:** Must Have
**Story Points:** 5
**Blocked By:** None

**User Story:**
As a user with disabilities, I want the app to be fully keyboard-navigable and screen-reader compatible.

**Technical Spec:**
- Audit all interactive elements for:
  - Focus ring visibility (already using Dream Curtain ring color)
  - ARIA labels on icon-only buttons
  - Alt text on all images
  - Semantic HTML (headings hierarchy, landmarks)
  - Touch target sizes (minimum 44x44px)
- Story Engine: ensure card navigation works with keyboard (left/right arrows)
- Bottom nav: add aria-current for active tab
- Color contrast: verify 4.5:1 ratio for all text against backgrounds
- Add `prefers-reduced-motion` media query to disable Framer Motion animations

**Acceptance Criteria:**
- [ ] All pages pass axe-core automated accessibility checks (0 critical violations)
- [ ] Full keyboard navigation works for all interactive flows
- [ ] Screen reader announces page changes and dynamic content
- [ ] Reduced motion preference disables all animations
- [ ] Color contrast meets WCAG 2.1 AA standard

**Files:** All component files in `client/src/components/` and `client/src/pages/`

---

## Epic 7: Data & Infrastructure

### MIND-700: Database Performance Optimization
**Priority:** Should Have
**Story Points:** 5
**Blocked By:** None

**User Story:**
As a developer, I want the database to handle growing user traffic efficiently.

**Technical Spec:**
- Add indexes:
  - `user_progress(userId, bookId)` composite unique index
  - `user_activity_log(userId, createdAt)` for stats queries
  - `analytics_events(eventType, createdAt)` for dashboard aggregations
  - `books(status, categoryId)` for filtered queries
  - `journal_entries(userId, createdAt)` for vault timeline
- Review and eliminate N+1 queries in:
  - Dashboard book carousels (batch load progress)
  - Admin book list (batch load content counts)
- Add connection pooling configuration review
- Add query timing logging for queries > 500ms

**Acceptance Criteria:**
- [ ] All listed indexes created without data loss
- [ ] Dashboard loads in < 1 second for users with 50+ books in progress
- [ ] Admin book list loads in < 2 seconds with 100+ books
- [ ] No N+1 query patterns in hot paths
- [ ] Slow query log captures queries > 500ms

**Files:** `shared/schema.ts`, `server/routes.ts`, `server/storage.ts`

---

### MIND-701: Automated Testing Suite
**Priority:** Should Have
**Story Points:** 8
**Blocked By:** None

**User Story:**
As a developer, I want automated tests so that new features don't break existing functionality.

**Technical Spec:**
- API integration tests (using vitest + supertest):
  - Auth flow: login, session, logout
  - Book CRUD: list, detail, progress tracking
  - Journal: create, list, encryption/decryption
  - Streak: activity logging, streak calculation
  - Admin: book creation, draft publish, user management
- E2E tests (using Playwright):
  - Onboarding flow
  - Book discovery → detail → story engine journey
  - Growth Vault: stats display, journal, tab switching
  - Admin: create book, edit content, publish
- CI integration: run tests before deployment

**Acceptance Criteria:**
- [ ] 80%+ API route coverage
- [ ] Critical user journeys covered by E2E tests
- [ ] Tests run in < 5 minutes total
- [ ] Tests can run against test database (isolated from production)
- [ ] Failing tests block deployment

**Files:** New `tests/` directory, `vitest.config.ts`

---

## Epic 8: Visual Design Enhancement

### MIND-800: Extended Color Palette Implementation
**Priority:** Should Have
**Story Points:** 5
**Blocked By:** None

**User Story:**
As a user, I want a richer visual experience with purposeful color variety so that different content types and states feel distinct and intuitive.

**Technical Spec:**
- Implement "Warm Prism" extended palette (see `docs/UI_DESIGN_SYSTEM.md`)
- Add CSS variables to `client/src/index.css`: `--primary-light`, `--primary-lighter`, `--primary-surface`, `--success`, `--warning`, `--accent-teal`, `--accent-gold`
- Update Tailwind config to expose new colors
- Apply semantic colors: success (Sage Green) for completed states, warning (Warm Amber) for streak risk, accent-teal for chakra info, accent-gold for premium/achievements
- Update chart palette to use 6-color system instead of monochromatic
- Update dark mode variables for all new tokens

**Acceptance Criteria:**
- [ ] All new CSS variables defined in both :root and .dark
- [ ] Completed/success states use Sage Green (#4CAF7D) not purple
- [ ] Warning states use Warm Amber (#E8A838)
- [ ] Premium badges use Dusty Gold (#C4A35A)
- [ ] Charts display in the 6-color palette
- [ ] Dark mode correctly inverts all new tokens
- [ ] No existing Dream Curtain primary usage broken

**Files:** `client/src/index.css`, `tailwind.config.ts`, `client/src/components/personal-stats.tsx`, `client/src/components/streak-chart.tsx`

---

### MIND-801: Typography Enhancement — Serif Headings
**Priority:** Could Have
**Story Points:** 3
**Blocked By:** None

**User Story:**
As a user, I want book titles and page headings to feel literary and premium so that the app conveys intellectual credibility.

**Technical Spec:**
- Add Playfair Display (Google Fonts) as display/serif font
- Keep Inter for all body text, UI labels, buttons, navigation
- Apply Playfair Display to: page titles (h1), book titles in cards, book detail hero title, quote/insight cards, "Daily Spark" heading
- Update Tailwind fontFamily: `serif: ['Playfair Display', 'serif']`
- Load only weights 500 and 700 to minimize font payload
- Ensure fallback to Georgia/serif if font fails to load

**Acceptance Criteria:**
- [ ] Page headings render in Playfair Display serif font
- [ ] Book titles in cards and detail pages use serif
- [ ] All UI elements (buttons, labels, nav) remain in Inter
- [ ] Font loads within 200ms (preload via link tag)
- [ ] Fallback renders correctly without visual jarring
- [ ] Mobile readability maintained (minimum 18px for serif headings)

**Files:** `client/index.html`, `tailwind.config.ts`, `client/src/pages/dashboard.tsx`, `client/src/pages/book-detail.tsx`, `client/src/components/book-card.tsx`

---

### MIND-802: Elevation & Hover Polish
**Priority:** Could Have
**Story Points:** 3
**Blocked By:** MIND-800

**User Story:**
As a user, I want interactive elements to feel responsive and tactile so that the app feels polished and premium.

**Technical Spec:**
- Implement 4-level elevation system (see Design System doc)
- Add hover shadow transitions to all clickable Cards (200ms ease-out)
- Book cards: subtle lift on hover (shadow level 1 → 2)
- Bottom nav: add press feedback (scale 0.95 on active, 100ms)
- Tab switches: smooth background slide animation (not just color swap)
- Button press: subtle inset shadow on active state
- All transitions respect `prefers-reduced-motion`

**Acceptance Criteria:**
- [ ] Cards have visible hover state with shadow elevation change
- [ ] Transitions are 200ms, no layout shift
- [ ] Reduced motion users see instant state changes (no animation)
- [ ] Touch devices: active state triggers on press, not hover
- [ ] Consistent elevation values across all card types

**Files:** `client/src/components/ui/card.tsx`, `client/src/components/book-card.tsx`, `client/src/components/bottom-nav.tsx`, `client/src/index.css`

---

### MIND-803: Dark Mode Implementation
**Priority:** Should Have
**Story Points:** 8
**Blocked By:** MIND-800

**User Story:**
As a user, I want a dark mode option so that I can read comfortably at night without eye strain.

**Technical Spec:**
- Create ThemeProvider component with system preference detection + manual toggle
- Store preference in localStorage, sync with system `prefers-color-scheme`
- Define `.dark` class color mappings (see Design System dark mode table)
- Dark backgrounds: deep purple-tinted (`#0F0A14`), not pure black
- Dark cards: subtle plum surface (`#1A1225`)
- Primary accent in dark mode: Lavender Mist (`#D4B8D6`) instead of Dream Curtain
- Add toggle in Settings tab of Growth Vault
- Ensure all charts, heatmaps, and visualizations work in dark mode
- Book cover images: no filter needed (natural images work in both modes)

**Acceptance Criteria:**
- [ ] Toggle in settings switches between light/dark/system modes
- [ ] Preference persists across sessions
- [ ] All text meets 4.5:1 contrast ratio in dark mode
- [ ] Charts and heatmaps are readable in dark mode
- [ ] No white flashes during page navigation in dark mode
- [ ] System preference is respected on first visit
- [ ] Chakra Energy Map colors remain vibrant in dark mode

**Files:** `client/src/components/theme-provider.tsx` (new), `client/src/index.css`, `client/src/pages/vault.tsx`, all component files

---

## Priority Matrix

| Ticket | Title | Priority | Points | Blocked By | Status |
|--------|-------|----------|--------|------------|--------|
| MIND-100 | Live Stripe Integration | Must | 5 | User keys | Pending |
| MIND-602 | Accessibility Audit | Must | 5 | None | Pending |
| MIND-101 | Content Paywalling | Should | 8 | MIND-100 | Pending |
| MIND-200 | Shorts Pipeline | Should | 8 | None | Pending |
| MIND-201 | Audio Management | Should | 5 | None | Pending |
| MIND-300 | Full-Text Search | Should | 8 | None | Pending |
| MIND-400 | Social Sharing | Should | 5 | None | Pending |
| MIND-401 | Streak Gamification | Should | 5 | None | Pending |
| MIND-500 | Analytics V2 | Should | 8 | None | Pending |
| MIND-600 | Image Optimization | Should | 5 | None | Pending |
| MIND-601 | Sentry Integration | Should | 3 | User DSN | Pending |
| MIND-700 | DB Performance | Should | 5 | None | Pending |
| MIND-701 | Test Suite | Should | 8 | None | Pending |
| MIND-800 | Extended Color Palette | Should | 5 | None | Pending |
| MIND-801 | Serif Typography | Could | 3 | None | Pending |
| MIND-802 | Elevation & Hover Polish | Could | 3 | MIND-800 | Pending |
| MIND-803 | Dark Mode | Should | 8 | MIND-800 | Pending |
| MIND-102 | Subscription Analytics | Could | 5 | MIND-100 | Pending |
| MIND-301 | Recommendation V2 | Could | 8 | None | Pending |
| MIND-501 | Content Quality Scoring | Could | 5 | MIND-500 | Pending |

**Total Story Points:** 115
**Estimated Sprints:** 7-8 (2-week sprints, ~15 points velocity)

---

## Sprint Recommendations

### Sprint 1 (Foundation)
- MIND-602: Accessibility Audit (5 pts)
- MIND-700: Database Performance (5 pts)
- MIND-100: Stripe Integration (5 pts) — if keys available

### Sprint 2 (Monetization + Visual)
- MIND-101: Content Paywalling (8 pts)
- MIND-800: Extended Color Palette (5 pts)

### Sprint 3 (Discovery + Design)
- MIND-300: Full-Text Search (8 pts)
- MIND-803: Dark Mode (8 pts)

### Sprint 4 (Engagement)
- MIND-401: Streak Gamification (5 pts)
- MIND-200: Shorts Pipeline (8 pts)

### Sprint 5 (Audio + Social)
- MIND-201: Audio Management (5 pts)
- MIND-400: Social Sharing (5 pts)
- MIND-601: Sentry Integration (3 pts)

### Sprint 6 (Analytics & Quality)
- MIND-500: Analytics V2 (8 pts)
- MIND-600: Image Optimization (5 pts)

### Sprint 7 (Polish)
- MIND-701: Test Suite (8 pts)
- MIND-801: Serif Typography (3 pts)
- MIND-802: Elevation & Hover Polish (3 pts)
