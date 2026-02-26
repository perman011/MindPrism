# MindPrism - Psychology Made Simple

## Overview
MindPrism is a mobile-first web application designed to make psychology and self-help concepts accessible and engaging. It transforms extensive books into structured, interactive learning experiences by breaking down complex information into a psychological taxonomy. This includes core theses, chapter summaries, mental models, principles with real-world stories, common mistakes, interactive exercises, and actionable items. The project aims to provide users with a streamlined path to personal growth and psychological understanding.

## User Preferences
I prefer clear and concise communication. When making changes, please explain the rationale briefly. For development, prioritize mobile-first design principles. I value iterative development, so incremental updates with clear descriptions are preferred.

## System Architecture
MindPrism utilizes a modern web stack with React, TypeScript, Vite, TailwindCSS, and Shadcn/UI for the frontend, and Express.js with TypeScript for the backend. PostgreSQL with Drizzle ORM handles data persistence, incorporating Row-Level Security for sensitive data like journal entries. Authentication is managed via Replit Auth (OpenID Connect).

The content is organized into a hierarchical "Psychological Taxonomy" featuring a core thesis, chapter summaries, mental models, principles with supporting stories, common mistakes, infographics, exercises, and action items.

The application features a consumer-facing app with pages for landing, onboarding, a personalized dashboard, book discovery, audio summaries, and a "Growth Vault" for journaling and progress tracking. A comprehensive admin portal (`/admin`) is also included for content creation, editing, and user management, featuring a 3-panel editor with a Mind Tree navigator, Block Builder, and mobile preview.

UI/UX emphasizes a purple/gold color scheme, "Plus Jakarta Sans" and "Playfair Display" fonts, and a mobile-first, card-based design with interactive elements and animations powered by Framer Motion. Key interactive components include a Chakra Energy Map and an Interactive Engine that dynamically renders content based on specific card templates for different content types.

Security is paramount, with AES-256-GCM encryption for journal entries, RLS policies, and a Role-Based Access Control (RBAC) system (super_admin > admin > editor > writer > user) governing access to features and content within both the consumer and admin applications.

## External Dependencies
- **Authentication:** Replit Auth (OpenID Connect)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Payments:** Stripe (for premium subscriptions and billing portal)