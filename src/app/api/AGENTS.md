## Purpose

HTTP API surface for scans, batch jobs, GitHub OAuth, AI features, threat intel, and user data.

## Ownership

Owns route handlers under `src/app/api/**`. Each feature is a folder with a `route.ts`; tests are colocated (`route.test.ts` style: `*.test.ts` next to the route).

## Local Contracts

- Handlers validate input with `src/lib/validators/api-validators.ts` (zod).
- Rate limiting via `src/lib/rate-limit.ts`.
- Auth: GitHub OAuth. `api/auth/login` redirects to GitHub using server-side credentials; `api/auth/callback` exchanges the code and sets the session cookie; `api/auth/session` returns the current user.
- Long work delegates to `src/lib/` (scanner, ai, threat-intel); routes stay thin.
- Route list: `auth/{login,callback,logout,session}`, `scan`, `batch-scan`, `ai/{explain,batch-fix,generate-prompt,generate-pr}`, `threat-intel`, `repos/webapp`, `user/{export,stats}`.

## Work Guidance

- Never call GitHub or AI providers directly in the route; use the lib modules.
- Return consistent JSON errors; keep response shapes stable for the dashboard UI.

## Verification

- `npm run test:run` (route tests under `src/app/api/**`)
- `npm run build`

## Child DOX Index

- (none yet - per-route docs can be added as routes gain complexity)
