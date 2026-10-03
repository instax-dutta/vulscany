## Purpose

Next.js App Router pages and route handlers for the vulscany UI.

## Ownership

Owns `src/app/**` pages (landing, dashboard, pricing, features, why, privacy, terms) and API routes under `app/api/`.

## Local Contracts

- Server Components by default; `'use client'` only where interactivity requires it.
- Route handlers live in `route.ts` files under `app/api/`.
- Global styles in `globals.css`; dashboard-specific styles in `dashboard/mobile-responsive.css`.

## Work Guidance

- Keep API route logic thin; delegate to `src/lib/`.
- Dashboard page composes components from `src/components/dashboard` and `src/components/DashboardFeatures`.

## Verification

- `npm run build` (type-checks pages and route handlers)
- `npm run lint`

## Child DOX Index

- `api/` — REST-style route handlers (see `api/AGENTS.md`)
