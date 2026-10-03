## Purpose

Next.js App Router pages and route handlers for the vulscany UI.

## Ownership

Owns `src/app/**` pages (landing, dashboard, pricing, features, why, privacy, terms) and API routes under `app/api/`.

## Local Contracts

- Server Components by default; `'use client'` only where interactivity requires it.
- Route handlers live in `route.ts` files under `app/api/`.
- Global styles in `globals.css`; dashboard-specific styles in `dashboard/mobile-responsive.css`.
- Indexable marketing pages are `/`, `/features`, `/why`, `/pricing`, `/privacy`, `/terms`. `/dashboard` is `noindex, nofollow` via its own `layout.tsx`.
- Brand assets: `icon.svg` is the single source of truth for the app icon. Raster renditions live in `public/` (`logo.png`, `favicon.png`, `apple-touch-icon.png`). Never add a second `icon.svg`/`apple-icon.png` under `public/`, because a public file shadows the app-dir route.
- Machine-readable surfaces: `robots.ts`, `sitemap.ts`, `llms.txt/route.ts`, and JSON-LD in the root `layout.tsx`. Canonical URL comes from `NEXT_PUBLIC_SITE_URL` (see `env.example`).

## Work Guidance

- Keep API route logic thin; delegate to `src/lib/`.
- Dashboard page composes components from `src/components/dashboard` and `src/components/DashboardFeatures`.

## Verification

- `npm run build` (type-checks pages and route handlers)
- `npm run lint`

## Child DOX Index

- `api/` — REST-style route handlers (see `api/AGENTS.md`)
