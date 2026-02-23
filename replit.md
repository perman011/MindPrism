# MindSpark - Psychology Made Simple

## Overview
MindSpark is a web application that transforms dense psychology and self-help books into bite-sized, interactive learning experiences. Instead of reading 500-page books, users get core principles, extracted stories, interactive exercises, and audio summaries.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + TailwindCSS + Shadcn/UI
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Replit Auth (OpenID Connect)
- **Routing:** Wouter
- **State:** TanStack React Query

## Project Structure
```
client/src/
  pages/
    landing.tsx          - Marketing landing page (unauthenticated)
    dashboard.tsx        - Home page (authenticated)
    library.tsx          - Book library with search/filter
    book-detail.tsx      - Book detail with principles/stories/exercises tabs
    not-found.tsx        - 404 page
  components/
    book-card.tsx        - Reusable book card component
    audio-player.tsx     - Audio player UI component
    ui/                  - Shadcn components
  hooks/
    use-auth.ts          - Authentication hook
  lib/
    queryClient.ts       - TanStack Query setup
    auth-utils.ts        - Auth utility functions

server/
  index.ts              - Express server entry
  routes.ts             - API endpoints
  storage.ts            - Database storage layer
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
- `GET /api/progress/:bookId` - Get user progress (auth required)
- `POST /api/progress/:bookId/bookmark` - Toggle bookmark (auth required)
- `POST /api/progress/:bookId/principle/:principleId` - Toggle principle completion (auth required)
- `POST /api/journal` - Save journal entry (auth required)

## Design
- Purple/gold color scheme
- Plus Jakarta Sans (body), Playfair Display (headings), JetBrains Mono (code)
- Dark mode supported via class toggle

## Key Features
1. Beautiful landing page with feature cards
2. Book library with category filtering and search
3. Interactive book detail with tabs: Principles, Stories, Exercises
4. Exercise types: Reflection (journal), Quiz, Action Plan
5. Audio player UI
6. Bookmark and progress tracking per book
7. Replit Auth for login
