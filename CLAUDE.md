# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Promii is a local promotions marketplace built with Next.js 14 (App Router) and Supabase. It connects merchants (businesses) with consumers and influencers. The platform is in Spanish (Venezuela-focused, with state/city data for VE).

## Commands

```bash
npm run dev        # Start dev server (Turbopack disabled via NEXT_DISABLE_TURBOPACK=1)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
```

## Tech Stack

- **Framework**: Next.js 14.2.28, React 18, TypeScript 5
- **Styling**: Tailwind CSS 4, Radix UI primitives, Shadcn/ui, Tremor (charts), Lucide + Remix icons
- **State**: Zustand 5 with persist middleware (primary), React Context (convenience wrapper)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Auth SSR**: `@supabase/ssr` for cookie-based session sync in middleware

## Architecture

### Routing (App Router)

- `(site)/` — Public browsing: homepage, `/c/[category]`, `/p/[id]`, `/influencers`
- `auth/` — Sign-in, sign-up, OAuth callback, logout
- `business/(auth)/` — Merchant onboarding: apply, sign-in, pending approval
- `business/(portal)/dashboard/` — Protected merchant area: create/edit promiis, validate, manage influencers
- `inf/` — Influencer portal (future, mostly placeholder)

### Authentication Flow

1. Root layout wraps the app with `<AuthProvider>` (Zustand init + `onAuthStateChange` listener)
2. `useAuth()` hook (from `AuthContext.tsx`) exposes: `profile`, `user`, `session`, `status`, `isMerchant`, `isInfluencer`
3. `<AuthGate roles={[ProfileRole.Merchant]}>` protects route content by role
4. `<BusinessPortalGate>` in the portal layout handles merchant-specific redirects based on approval state
5. Middleware (`src/middleware.tsx`) syncs Supabase cookies on every request
6. Server-only profile fetching via `auth.service.server.ts`

**User roles**: `user`, `merchant`, `influencer` — with profile states: `pending`, `approved`, `rejected`, `blocked`

### State Management

- **Zustand store** (`lib/stores/auth/authStore.tsx`): persists `profile` to localStorage key `promii:auth`. Tracks `status`, `session`, `user`, `profile`, `_hasHydrated`.
- **Merchant state cache**: separate localStorage key `promii:merchantState:v1` for approval status
- **Draft persistence**: business application form saves to localStorage key `promii_business_apply_draft_v1`

### Service Layer

Services live in `lib/services/` and return typed `SupabaseResponse<T>` wrappers with normalized errors.

- `myPromiss.service.ts` — CRUD for promiis (fetch, create, pause, activate, search with `ilike`)
- `promiiPhotoUpload.service.ts` — Upload to Supabase Storage bucket `"promii"`, path: `{merchantId}/{promiiId}/{sort}_{timestamp}.{ext}`. Validates 1-4 images, rolls back storage on DB failure.

### Key Supabase Tables

`profiles`, `promiis`, `promii_photos`, `merchants`, `business_applications`

### Client Instances

- `lib/supabase/supabase.client.ts` — Browser-side Supabase client
- `lib/supabase/supabase.legacy.ts` — Legacy SSR setup (unused)

## Conventions

- Path alias: `@/` maps to `src/`
- Type definitions in `config/types/` (ProfileRole enum, UserRole enum, Promii types, SupabaseResponse)
- Category/location configs in `config/` (categories with icons/subcategories, VE states/cities)
- UI components in `components/ui/`, layout in `components/layout/`, auth in `components/auth/`
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge)
- Toast notifications via `ToastService.showSuccessToast()` / `showErrorToast()`

## Environment Variables

All client-side (prefixed `NEXT_PUBLIC_`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
