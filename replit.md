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
    admin/
      admin-books.tsx      - Admin book list with create/delete, status badges
      admin-book-editor.tsx - 3-panel workspace (Mind Tree + Block Builder + Mobile Preview)
      mind-tree.tsx        - Collapsible navigation tree with section counts
      mobile-preview.tsx   - iPhone-frame live preview of content
      block-controls.tsx   - Floating toolbar (Add/Copy/Delete/Comment)
      comment-thread.tsx   - Comment thread panel for review workflow
      publish-panel.tsx    - Pre-publish checklist and publish/unpublish actions
      editors/
        book-setup-editor.tsx    - Title, author, metadata, core thesis (200-char limit)
        chapter-editor.tsx       - Chapter summaries with tap-through card builder
        mental-model-editor.tsx  - Mental models with tap-to-reveal steps
        principle-editor.tsx     - Principles with nested story attachments
        mistake-editor.tsx       - Common mistakes (red/green do/don't split)
        infographic-editor.tsx   - Infographics with reveal steps
        exercise-editor.tsx      - Exercises with type/impact selectors
        action-item-editor.tsx   - Action items with immediate/long-term toggle
  components/
    book-card.tsx        - Reusable book card (compact/full/audio modes)
    bottom-nav.tsx       - Fixed bottom navigation (Home/Discover/Audio/Vault)
    mini-player.tsx      - Persistent mini audio player above bottom nav
    full-screen-player.tsx - Full-screen audio player with controls
    category-icon.tsx    - Dynamic category icon mapper
    ui/                  - Shadcn components
  hooks/
    use-auth.ts          - Authentication hook
    use-auto-save.ts     - Debounced auto-save hook for admin editors
  lib/
    queryClient.ts       - TanStack Query setup with getQueryFn
    audio-context.tsx    - Global AudioProvider with play/pause/seek/speed/skip
    auth-utils.ts        - Auth utility functions

server/
  index.ts              - Express server entry
  routes.ts             - Consumer API endpoints
  admin-routes.ts       - Admin CRUD endpoints (auth + role gated)
  storage.ts            - Database storage layer (IStorage interface)
  db.ts                 - Database connection
  seed.ts               - Database seed data (5 books with full taxonomy)
  replit_integrations/  - Auth integration

shared/
  schema.ts             - Drizzle schema + types (books, principles, stories, exercises,
                          chapter_summaries, mental_models, common_mistakes, action_items,
                          user_progress, journal_entries, user_interests, daily_sparks,
                          user_streaks, saved_highlights, comments)
  models/auth.ts        - Auth schema (users table with role field)
```

## Database Tables
- `books` - title, author, coreThesis, coverImage, readTime, listenTime, audioUrl, featured, status (draft/published), updatedAt
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
- `comments` - bookId, blockType, blockId, userId, content, resolved, createdAt

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

## Admin API Endpoints (role-gated: admin/editor/writer)
- `POST /api/admin/books` - Create new book (draft)
- `PUT /api/admin/books/:id` - Update book metadata
- `DELETE /api/admin/books/:id` - Cascade delete book + all content
- `POST /api/admin/books/:id/publish` - Set status to published
- `POST /api/admin/books/:id/unpublish` - Set status to draft
- `POST /api/admin/books/:bookId/chapters` - Create chapter summary
- `PUT /api/admin/chapters/:id` - Update chapter
- `DELETE /api/admin/chapters/:id` - Delete chapter
- `POST /api/admin/books/:bookId/mental-models` - Create mental model
- `PUT /api/admin/mental-models/:id` - Update mental model
- `DELETE /api/admin/mental-models/:id` - Delete mental model
- `POST /api/admin/books/:bookId/principles` - Create principle
- `PUT /api/admin/principles/:id` - Update principle
- `DELETE /api/admin/principles/:id` - Delete principle
- `POST /api/admin/books/:bookId/stories` - Create story
- `PUT /api/admin/stories/:id` - Update story
- `DELETE /api/admin/stories/:id` - Delete story
- `POST /api/admin/books/:bookId/common-mistakes` - Create mistake
- `PUT /api/admin/common-mistakes/:id` - Update mistake
- `DELETE /api/admin/common-mistakes/:id` - Delete mistake
- `POST /api/admin/books/:bookId/infographics` - Create infographic
- `PUT /api/admin/infographics/:id` - Update infographic
- `DELETE /api/admin/infographics/:id` - Delete infographic
- `POST /api/admin/books/:bookId/exercises` - Create exercise
- `PUT /api/admin/exercises/:id` - Update exercise
- `DELETE /api/admin/exercises/:id` - Delete exercise
- `POST /api/admin/books/:bookId/action-items` - Create action item
- `PUT /api/admin/action-items/:id` - Update action item
- `DELETE /api/admin/action-items/:id` - Delete action item
- `PUT /api/admin/reorder` - Reorder content blocks
- `GET /api/admin/books/:bookId/comments` - Get comments for book
- `POST /api/admin/comments` - Create comment
- `PATCH /api/admin/comments/:id` - Update/resolve comment
- `DELETE /api/admin/comments/:id` - Delete comment

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

## Admin Portal Flow (at /admin)
1. Admin Books List → Grid of all books with Draft/Published badges
2. Create New Book → Creates draft book, redirects to editor
3. 3-Panel Editor → Mind Tree (left) + Block Builder (center) + Mobile Preview (right)
4. Edit content → All 8 section editors with auto-save
5. Comment/Review → Add/resolve comments on any content block
6. Publish → Pre-publish checklist validation → Set book to published → Visible in consumer app

### User Roles
- `user` (default) → Consumer app access only
- `writer` → Can create/edit book content in admin portal
- `editor` → Same as writer + can manage comments
- `admin` → Full access including publish/unpublish and delete

## Design
- Purple/gold color scheme
- Plus Jakarta Sans (body), Playfair Display (headings)
- Mobile-first with fixed bottom navigation
- Dark gradient backgrounds on landing/onboarding
- Card-based UI with hover-elevate interactions
