# MindSpark - Psychology Made Simple

## Overview
MindSpark is a mobile-first web application that transforms dense psychology and self-help books into bite-sized, interactive learning experiences. Instead of reading 500-page books, users get core principles, extracted stories, interactive exercises, and audio summaries.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + TailwindCSS + Shadcn/UI
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Replit Auth (OpenID Connect)
- **Routing:** Wouter
- **State:** TanStack React Query
- **Audio:** Global AudioContext with simulated playback

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
    book-detail.tsx      - Book detail with hero image, Start Journey, tabs
    story-engine.tsx     - Instagram Stories-style card swiping for principles/stories/exercises
    not-found.tsx        - 404 page
  components/
    book-card.tsx        - Reusable book card (compact/full/audio modes)
    bottom-nav.tsx       - Fixed bottom navigation (Home/Discover/Audio/Vault)
    mini-player.tsx      - Persistent mini audio player above bottom nav
    full-screen-player.tsx - Full-screen audio player with controls
    category-icon.tsx    - Dynamic category icon mapper
    audio-player.tsx     - Legacy standalone audio player (deprecated)
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
  seed.ts               - Database seed data
  replit_integrations/  - Auth integration

shared/
  schema.ts             - Drizzle schema + types
  models/auth.ts        - Auth schema
```

## API Endpoints
- `GET /api/categories` - List categories
- `GET /api/books` - List all books
- `GET /api/books/:id` - Get single book
- `GET /api/books/:id/principles` - Get principles for a book
- `GET /api/books/:id/stories` - Get stories for a book
- `GET /api/books/:id/exercises` - Get exercises for a book
- `GET /api/books/:id/cards` - Get combined cards (principles+stories+exercises) for story engine
- `GET /api/progress` - Get all user progress (auth required)
- `GET /api/progress/:bookId` - Get user progress for a book (auth required)
- `POST /api/progress/:bookId/bookmark` - Toggle bookmark (auth required)
- `POST /api/progress/:bookId/principle/:principleId` - Toggle principle completion (auth required)
- `POST /api/progress/:bookId/card` - Update card progress (auth required)
- `GET /api/journal` - Get journal entries (auth required)
- `POST /api/journal` - Save journal entry (auth required)
- `GET /api/interests` - Get user interests (auth required)
- `POST /api/interests` - Save user interests and complete onboarding (auth required)
- `GET /api/daily-spark` - Get daily spark quote
- `GET /api/streak` - Get user streak stats (auth required)
- `POST /api/streak/activity` - Update streak (auth required)
- `POST /api/streak/listening` - Add listening time (auth required)
- `GET /api/highlights` - Get saved highlights (auth required)
- `POST /api/highlights` - Save highlight (auth required)
- `DELETE /api/highlights/:id` - Delete highlight (auth required)

## App Flow
1. Landing page (unauthenticated) → Auto-swiping carousel with 3 slides
2. Login via Replit Auth
3. Onboarding (first login) → Select 3+ interests from 12 tiles
4. Dashboard → Daily spark, streak, horizontal carousels, category grid
5. Book Detail → Hero image, Start Journey button, Principles/Stories/Exercises tabs
6. Story Engine → Card-by-card journey through principles → stories → exercises
7. Audio → Browse and play audio summaries via global audio player

## Design
- Purple/gold color scheme
- Plus Jakarta Sans (body), Playfair Display (headings)
- Mobile-first with fixed bottom navigation
- Dark gradient backgrounds on landing/onboarding
- Card-based UI with hover-elevate interactions

## Key Features
1. Auto-swiping splash carousel (3 slides, 3.5s interval)
2. Personalization onboarding with 12 interest tiles
3. Bottom navigation: Home / Discover / Audio / My Vault
4. Dashboard with daily spark quotes, streak badge, horizontal carousels
5. Discover page with search bar and category filtering
6. Story Engine: Instagram Stories-style card swiping
7. Three exercise types: Reflection (journal), Quiz, Action Plan
8. Global audio player with mini-player and full-screen mode
9. Streak tracking and stats (days, minutes listened, exercises done)
10. Growth Vault with journal entries, saved highlights, settings
11. Bookmark and progress tracking per book
12. Replit Auth for login
