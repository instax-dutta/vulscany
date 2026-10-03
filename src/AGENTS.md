## Purpose

All application source for vulscany: a Next.js 16 App Router app with co-located Vitest tests.

## Ownership

Owns the `src/` tree: app routes, components, and the `lib/` core (scanner, AI, threat intel, GitHub, storage).

## Local Contracts

- Path alias `@/*` maps to `src/*` (see tsconfig).
- Tests are colocated as `*.test.ts` / `*.test.tsx` next to the code they cover.
- No server-side secrets in client components; env access goes through server-only modules.

## Work Guidance

- Read the nearest child AGENTS.md before editing anything under `app/`, `components/`, or `lib/`.
- Follow existing formatting (4-space indent in lib files, double quotes).

## Verification

- `npm run lint`
- `npm run test:run`
- `npm run build` for route/type breakage

## Child DOX Index

- `app/` — Next.js routes: landing, dashboard, legal pages (see `app/AGENTS.md`)
- `app/api/` — HTTP API routes: auth, scan, batch-scan, ai, threat-intel, user, repos (see `app/api/AGENTS.md`)
- `components/` — React UI: dashboard, landing, ui primitives (see `components/AGENTS.md`)
- `lib/` — core logic: scanner, AI, threat-intel, github, cache, validators (see `lib/AGENTS.md`)
- `config/`, `constants/`, `proxy.ts` — site config, static text, request proxy/middleware
