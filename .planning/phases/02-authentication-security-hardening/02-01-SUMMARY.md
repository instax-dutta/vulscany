---
phase: 02-authentication-security-hardening
plan: 01
subsystem: api
tags: [auth, nextjs, middleware, cookies, proxy]
requires:
  - phase: 01-configuration-infrastructure-hardening
    provides: proxy.ts with CSP nonces and security headers
provides:
  - API auth guard at proxy layer returning JSON 401 for /api/* routes
  - Defense-in-depth cookie-based auth checks in batch-fix and threat-intel route handlers
affects: []
tech-stack:
  added: []
  patterns:
    - API auth guard in proxy.ts: cookie check with JSON 401 response
    - Route-level defense-in-depth: cookies() import with github_token check before business logic
key-files:
  created: []
  modified:
    - src/proxy.ts
    - src/app/api/ai/batch-fix/route.ts
    - src/app/api/threat-intel/route.ts
key-decisions:
  - "API routes get JSON 401 (not redirect) at proxy layer — correct for API consumers"
  - "/api/auth/* excluded from proxy auth guard — OAuth callback, session, logout are public entry points"
  - "Route-level auth checks placed before business logic/JSON parsing to minimize attack surface"
patterns-established:
  - "API auth guard in proxy.ts: check github_token cookie, return JSON 401 for unauthenticated API requests"
  - "Route-level defense-in-depth: cookies() import from next/headers, check before any business logic"
requirements-completed: [REQ-6]
duration: 8min
completed: 2026-06-11
---

# Phase 02 Plan 01: Standardize API Authentication Summary

**Proxy-layer API auth guard returning JSON 401 for unauthenticated /api/* requests, plus defense-in-depth route-level auth checks in batch-fix and threat-intel endpoints**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-11T13:31:00Z
- **Completed:** 2026-06-11T13:39:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Proxy.ts now guards `/api/*` routes with JSON 401 response (matching the existing `/dashboard` redirect pattern)
- `/api/auth/*` excluded from proxy guard (OAuth callback, session, logout remain public)
- Defense-in-depth cookie-based auth checks added to batch-fix POST handler and threat-intel GET/POST handlers
- Verified rotation.ts already implements correct round-robin key rotation with failure penalty — no change needed
- All 47 existing tests pass, TypeScript compiles cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Add API auth guard to proxy.ts** - `124c310` (feat)
2. **Task 2: Add defense-in-depth auth checks to unguarded API routes** - `82082e1` (feat)

## Files Created/Modified

- `src/proxy.ts` - Added `/api/*` auth guard with JSON 401 response and `/api/auth/*` exclusion; existing `/dashboard` redirect auth unchanged
- `src/app/api/ai/batch-fix/route.ts` - Added cookies-based `github_token` auth check before JSON parsing in POST handler
- `src/app/api/threat-intel/route.ts` - Added cookies-based `github_token` auth check before business logic in both GET and POST handlers

## Decisions Made

- **JSON 401 for API routes, redirect for page routes**: API consumers expect JSON error responses, not HTTP redirects. The proxy now uses `NextResponse.json()` for API auth failures and `NextResponse.redirect()` for page auth failures.
- **`/api/auth/*` exclusion**: OAuth callback, session, and logout endpoints are public entry points required for the authentication flow to work.
- **Defense-in-depth pattern**: Route-level auth checks use the same `cookies()` pattern from `next/headers` established in other API routes, placed before any business logic or JSON parsing.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- API auth is now consistent across all routes via proxy layer with defense-in-depth at route level
- Next plan (02-02) can proceed with security hardening of component-level access controls

## Self-Check: PASSED

All modified files confirmed present on disk. Both task commits confirmed in git history. SUMMARY.md written to expected path.

---

*Phase: 02-authentication-security-hardening*
*Completed: 2026-06-11*
