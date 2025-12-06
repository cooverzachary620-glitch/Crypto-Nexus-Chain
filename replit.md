# Cryptocurrency Trading Platform

## Overview

This is a full-stack cryptocurrency trading simulation platform built with React, Express, and TypeScript. The application allows users to view real-time cryptocurrency prices, manage a portfolio, execute buy/sell trades, convert between cryptocurrencies, and track transaction history. It features a modern UI built with shadcn/ui components and follows a financial dashboard design pattern inspired by platforms like Coinbase and Robinhood.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight React Router alternative)
- TanStack Query (React Query) for server state management and caching

**UI Component System**
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design system follows "New York" style variant
- Custom color system with theme support (light/dark modes)
- Responsive layout with mobile-first approach

**State Management Strategy**
- Server state: TanStack Query with query invalidation patterns
- Local state: React hooks (useState, useEffect)
- Theme state: Context API via ThemeProvider
- No global state management library (Redux/Zustand) - relies on React Query cache

**Component Structure**
- Page-level components in `client/src/pages/`
- Reusable UI components in `client/src/components/`
- shadcn/ui primitives in `client/src/components/ui/`
- Custom hooks in `client/src/hooks/`

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- HTTP-only API (no WebSocket implementation currently)
- RESTful endpoint design
- Session-based architecture prepared (via express-session imports)

**Data Layer Strategy**
- In-memory storage implementation (IStorage interface)
- Mock cryptocurrency data for development/demo purposes
- Drizzle ORM configured for PostgreSQL (schema defined but not actively used)
- Storage abstraction allows swapping implementations without changing business logic

**API Design Pattern**
- Resource-based REST endpoints (`/api/cryptocurrencies`, `/api/portfolio`, etc.)
- Standard HTTP methods (GET, POST, PATCH)
- JSON request/response format
- Centralized error handling approach

**Build & Deployment**
- Custom build script using esbuild for server bundling
- Vite for client bundling
- Dependency allowlist strategy to reduce cold start times
- Production mode serves static client files from Express

### Database Schema (Drizzle ORM)

**Tables Defined**
- `cryptocurrencies`: Market data for crypto assets
- `wallet_holdings`: User portfolio positions
- `transactions`: Trade history (buy/sell/convert)
- `users`: User authentication data (prepared but not actively used)
- `user_settings`: User preferences

**Schema Organization**
- Shared schema in `shared/schema.ts` for type safety across client/server
- Zod validation schemas generated from Drizzle tables
- TypeScript inference for insert/select operations
- PostgreSQL dialect with `drizzle-kit` for migrations

**Current Implementation Note**
- Database schema is defined but the application currently uses in-memory storage
- This allows the app to run without database provisioning
- Production deployment would require activating the database layer

### Key Architectural Decisions

**Monorepo Structure**
- **Problem**: Managing shared types between client and server
- **Solution**: Shared TypeScript types in `shared/` directory accessible to both
- **Benefits**: Single source of truth for data models, compile-time type checking across stack
- **Trade-offs**: Tighter coupling between frontend/backend

**Storage Abstraction Layer**
- **Problem**: Need flexibility to switch between mock data and real database
- **Solution**: IStorage interface with pluggable implementations
- **Benefits**: Easy testing, development without database, clean separation
- **Trade-offs**: Additional abstraction layer adds complexity

**React Query for Data Fetching**
- **Problem**: Managing server state, caching, and synchronization
- **Solution**: TanStack Query with custom queryClient configuration
- **Benefits**: Automatic caching, background refetching, optimistic updates
- **Configuration**: Infinite stale time, no automatic refetching (manual invalidation pattern)

**shadcn/ui Component Library**
- **Problem**: Need consistent, accessible UI components
- **Solution**: Copy-paste component library based on Radix UI
- **Benefits**: Full component customization, no package lock-in, TypeScript support
- **Trade-offs**: Components live in project (not npm package), manual updates

**Path Alias Configuration**
- **Problem**: Avoiding relative import hell
- **Solution**: TypeScript path aliases (`@/`, `@shared/`, `@assets/`)
- **Benefits**: Clean imports, easier refactoring
- **Configuration**: Defined in tsconfig.json, vite.config.ts, and components.json

## External Dependencies

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing (alternative to React Router)
- **@radix-ui/***: Unstyled, accessible component primitives
- **recharts**: Chart visualization library for price charts
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **date-fns**: Date manipulation and formatting
- **class-variance-authority & clsx**: Conditional className utilities
- **tailwind-merge**: Tailwind class merging utility

### Backend Libraries
- **express**: Web server framework
- **drizzle-orm**: TypeScript ORM for PostgreSQL
- **drizzle-zod**: Generate Zod schemas from Drizzle tables
- **pg**: PostgreSQL client (configured but not actively used)
- **connect-pg-simple**: PostgreSQL session store for express-session
- **zod & zod-validation-error**: Request validation

### Build & Development Tools
- **vite**: Frontend build tool and dev server
- **esbuild**: Fast JavaScript bundler for server code
- **tsx**: TypeScript execution for development
- **drizzle-kit**: Database migration tool
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Styling System
- **tailwindcss**: Core styling framework
- **autoprefixer**: CSS vendor prefixing
- **Custom theme**: HSL-based color system with CSS variables for theme switching

### Design System Resources
- **Google Fonts**: Inter, DM Sans, Fira Code, Geist Mono (referenced in HTML)
- **Design Guidelines**: Custom design system documented in `design_guidelines.md`