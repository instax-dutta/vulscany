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

Run all four before considering work done; CI enforces the same four.

- `npm run lint`
- `npm run typecheck` (must be clean, including test files)
- `npm run test:run`
- `npm run build` for route/type breakage

## Child DOX Index

- `app/` — Next.js routes: landing, dashboard, legal pages (see `app/AGENTS.md`)
- `app/api/` — HTTP API routes: auth, scan, batch-scan, ai, threat-intel, user, repos (see `app/api/AGENTS.md`)
- `components/` — React UI: dashboard, landing, ui primitives (see `components/AGENTS.md`)
- `lib/` — core logic: scanner, AI, threat-intel, github, cache, validators (see `lib/AGENTS.md`)
- `lib/report/` — SARIF 2.1.0, JUnit, and Markdown exporters from a `ScanResult`
- `cli/` — `vulscany scan` CLI; writes a report and exits non-zero on high or critical findings (`npm run scan:cli`)
- `config/`, `constants/`, `proxy.ts` — site config, static text, request proxy/middleware
