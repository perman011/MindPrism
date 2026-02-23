# MindSpark - Psychology Made Simple

## Overview
MindSpark is a mobile-first web application that transforms dense psychology and self-help books into bite-sized, interactive learning experiences. Instead of reading 500-page books, users get a structured psychological taxonomy: core thesis, chapter summaries, mental models, principles with stories, common mistakes, exercises ranked by impact, and action items.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + TailwindCSS + Shadcn/UI
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Replit Auth (OpenID Connect)
- **Routing:** Wouter
- **State:** TanStack React Query
- **Audio:** Global AudioContext with simulated playback

## Content Architecture (Psychological Taxonomy)
Every book follows this hierarchical structure:
```
BOOK OBJECT
├── Core Thesis        (1-2 sentence "Big Idea" of the whole book)
├── Chapter Summaries  (Tap-through breakdown per chapter, Instagram Stories-style)
├── Mental Models      (Reusable visual frameworks with tap-to-reveal steps)
├── Principles         (Fundamental rules to live/work by)
│   └── Stories        (Real-world anecdotes proving parent principle)
├── Common Mistakes    (Anti-patterns with do/don't corrections)
├── Infographics       (Visual step-by-step frameworks with tap-to-reveal)
├── Exercises          (Interactive prompts ranked by impact: high/medium/low)
└── Action Items       (Categorized: immediate vs long-term checklists)
```

## Project Structure
```
client/src/
  pages/
    landing.tsx          - Marketing landing page (unauthenticated) with auto-swiping carousel
    onboarding.tsx       - Interest selection & personalization flow
    dashboard.tsx        - Home page with daily spark, streaks, carousels
    discover.tsx         - Book library with search, category pills, book grid
    audio.tsx            - Audio summaries listing page
    vault.tsx            - Growth vault: journal, highlights, stats, settings
    book-detail.tsx      - Book Master Hub with core thesis + Blueprint Grid (6 tiles)
    story-engine.tsx     - Interactive Engine with 6 card templates per content type
    not-found.tsx        - 404 page
  components/
    book-card.tsx        - Reusable book card (compact/full/audio modes)
    bottom-nav.tsx       - Fixed bottom navigation (Home/Discover/Audio/Vault)
    mini-player.tsx      - Persistent mini audio player above bottom nav
    full-screen-player.tsx - Full-screen audio player with controls
    category-icon.tsx    - Dynamic category icon mapper
    ui/                  - Shadcn components
  hooks/
    use-auth.ts          - Authentication hook
  lib/
    queryClient.ts       - TanStack Query setup with getQueryFn
    audio-context.tsx    - Global AudioProvider with play/pause/seek/speed/skip
    auth-utils.ts        - Auth utility functions

server/
  index.ts              - Express server entry
  routes.ts             - API endpoints
  storage.ts            - Database storage layer (IStorage interface)
  db.ts                 - Database connection
  seed.ts               - Database seed data (5 books with full taxonomy)
  replit_integrations/  - Auth integration

shared/
  schema.ts             - Drizzle schema + types (books, principles, stories, exercises,
                          chapter_summaries, mental_models, common_mistakes, action_items,
                          user_progress, journal_entries, user_interests, daily_sparks,
                          user_streaks, saved_highlights)
  models/auth.ts        - Auth schema
```

## Database Tables
- `books` - title, author, coreThesis, coverImage, readTime, listenTime, audioUrl, featured
- `categories` - name, slug, icon, color
- `chapter_summaries` - bookId, chapterNumber, chapterTitle, cards (jsonb array)
- `mental_models` - bookId, title, description, steps (jsonb array), orderIndex
- `principles` - bookId, title, content, orderIndex, icon
- `stories` - bookId, principleId (nullable FK), title, content, moral, orderIndex
- `exercises` - bookId, title, description, type, content (jsonb), impact (high/medium/low), orderIndex
- `common_mistakes` - bookId, mistake, correction, orderIndex
- `infographics` - bookId, title, description, imageUrl, steps (jsonb array), orderIndex
- `action_items` - bookId, text, type (immediate/long_term), orderIndex
- `user_progress` - userId, bookId, completedPrinciples, bookmarked, currentCardIndex, currentSection
- `journal_entries` - userId, exerciseId (optional), content
- `user_interests` - userId, interests array, onboardingCompleted
- `daily_sparks` - quote, author, bookId, category
- `user_streaks` - userId, currentStreak, longestStreak, totalMinutesListened, etc.
- `saved_highlights` - userId, bookId, content, type

## API Endpoints
- `GET /api/categories` - List categories
- `GET /api/books` - List all books
- `GET /api/books/:id` - Get single book (includes coreThesis)
- `GET /api/books/:id/content-counts` - Get counts for all 6 content types
- `GET /api/books/:id/chapter-summaries` - Get chapter summaries
- `GET /api/books/:id/mental-models` - Get mental models
- `GET /api/books/:id/principles` - Get principles
- `GET /api/books/:id/stories` - Get stories
- `GET /api/books/:id/exercises` - Get exercises (sorted by impact)
- `GET /api/books/:id/common-mistakes` - Get common mistakes
- `GET /api/books/:id/infographics` - Get infographics
- `GET /api/books/:id/action-items` - Get action items (optional ?type filter)
- `GET /api/books/:id/cards/:section` - Get cards for Interactive Engine by section
- `GET /api/books/:id/cards` - Get legacy combined cards
- `GET /api/progress` - Get all user progress (auth required)
- `GET /api/progress/:bookId` - Get user progress for a book (auth required)
- `POST /api/progress/:bookId/bookmark` - Toggle bookmark (auth required)
- `POST /api/progress/:bookId/card` - Update card progress with section (auth required)
- `GET /api/journal` - Get journal entries (auth required)
- `POST /api/journal` - Save journal entry (auth required)
- `GET /api/interests` - Get user interests (auth required)
- `POST /api/interests` - Save user interests (auth required)
- `GET /api/daily-spark` - Get daily spark quote
- `GET /api/streak` - Get user streak stats (auth required)
- `POST /api/streak/activity` - Update streak (auth required)
- `POST /api/streak/listening` - Add listening time (auth required)
- `GET /api/highlights` - Get saved highlights (auth required)
- `POST /api/highlights` - Save highlight (auth required)
- `DELETE /api/highlights/:id` - Delete highlight (auth required)

## Interactive Engine Card Templates
1. **Chapter Summaries**: Tap-through cards with 1-2 sentences, chapter transitions
2. **Mental Models**: Intro card + tap-to-reveal step cards with animation
3. **Principles & Stories**: Principle card with "See the Proof" flip to reveal story
4. **Common Mistakes**: Do/Don't split card (red mistake vs green correction)
5. **Infographics**: Intro card + tap-to-reveal step cards with progress indicators
6. **Exercises**: Workbook with impact badges, reflection/quiz/action_plan types, confetti
7. **Action Items**: Checklist with immediate/long-term toggle, checkbox animations

## App Flow
1. Landing page (unauthenticated) → Auto-swiping carousel with 3 slides
2. Login via Replit Auth
3. Onboarding (first login) → Select 3+ interests from 12 tiles
4. Dashboard → Daily spark, streak, horizontal carousels, category grid
5. Book Detail (Master Hub) → Core thesis + Blueprint Grid (6 tiles)
6. Interactive Engine → Section-specific card templates
7. Audio → Browse and play audio summaries via global audio player

## Design
- Purple/gold color scheme
- Plus Jakarta Sans (body), Playfair Display (headings)
- Mobile-first with fixed bottom navigation
- Dark gradient backgrounds on landing/onboarding
- Card-based UI with hover-elevate interactions
