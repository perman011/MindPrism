# MindPrism - Psychology Made Simple

## Overview
MindPrism is a mobile-first web application designed to make psychology and self-help concepts accessible and engaging. It transforms extensive books into structured, interactive learning experiences by breaking down complex information into a psychological taxonomy. This includes core theses, chapter summaries, mental models, principles with real-world stories, common mistakes, interactive exercises, and actionable items. The project aims to provide users with a streamlined path to personal growth and psychological understanding, focusing on mobile accessibility and engaging content delivery.

## User Preferences
I prefer clear and concise communication. When making changes, please explain the rationale briefly. For development, prioritize mobile-first design principles. I value iterative development, so incremental updates with clear descriptions are preferred.

## System Architecture
MindPrism utilizes a modern web stack: React, TypeScript, Vite, TailwindCSS, and Shadcn/UI for the frontend, and Express.js with TypeScript for the backend. PostgreSQL with Drizzle ORM handles data persistence, incorporating Row-Level Security for sensitive data. Authentication is managed via Replit Auth.

The content is organized into a hierarchical "Psychological Taxonomy." The application features a consumer-facing app with pages for landing, onboarding, a personalized dashboard, book discovery, audio summaries, and a "Growth Vault" for journaling and progress tracking. A comprehensive admin portal (`/admin`) is also included for content creation, editing, and user management, featuring a 3-panel editor with a Mind Tree navigator, Block Builder, and mobile preview.

UI/UX emphasizes a deep navy-violet color scheme. The design is mobile-first, card-based, with interactive elements and animations powered by Framer Motion. Key interactive components include a Chakra Energy Map and an Interactive Engine that dynamically renders content. Security is managed through AES-256-GCM encryption for journal entries, RLS policies, and a Role-Based Access Control (RBAC) system.

The admin book management supports a draft workflow for content editing, allowing published books to be edited via a draft layer before changes go live. A recommendation algorithm personalizes book suggestions based on user interests. Security middleware includes Helmet.js for CSP and other headers, `express-rate-limit` for API rate limiting, and a query logger for performance monitoring. SEO is managed with `react-helmet-async` for dynamic metadata, with most authenticated pages set to `noIndex`.

Database backups are handled by a dedicated service using `pg_dump`, scheduled daily, with admin-only routes for management. User activity is logged, and aggregated personal stats are displayed in the "Growth Vault." Analytics track user events, providing insights in an admin dashboard with overview cards and charts.

"Story Shorts" offer TikTok-style vertical video content, integrated into the dashboard, book detail pages, and a dedicated shorts section. Push notifications, managed by a service worker and scheduler, provide daily reminders, streak alerts, and new content notifications. The application also supports PWA features, including offline mode with a service worker for caching and background sync, and an install prompt. Affiliate buy buttons and social sharing features (including a branded progress share card) are integrated into book detail pages.

## External Dependencies
- **Authentication:** Replit Auth (OpenID Connect)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Payments:** Stripe
- **Security:** Helmet.js, express-rate-limit
- **Error Monitoring:** Sentry