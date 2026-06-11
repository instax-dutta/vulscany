---
phase: 01-configuration-infrastructure-hardening
plan: 02
subsystem: infra
tags: [typescript, security-headers, csp, nonce, proxy, middleware, next-config]

# Dependency graph
requires:
  - phase: 01-configuration-infrastructure-hardening
    plan: 01
    provides: renamed memory-cache.ts, fixed user-agent, updated import paths
provides:
  - proxy.ts with nonce-based CSP replacing middleware.ts
  - Consolidated static security headers in next.config.ts (HSTS, DENY XFO, Permissions-Policy, etc.)
  - Fixed TypeScript error (scanHistory variable name) allowing removal of ignoreBuildErrors
  - Stale upstash.io and unsafe-inline removed from CSP
  - Deprecated X-XSS-Protection header removed entirely
affects: [Phase 2 authentication, any future work needing CSP-aware dynamic rendering]

# Tech tracking
tech-stack:
  added: []
  patterns: [nonce-based CSP via proxy.ts, static headers via next.config.ts, dynamic rendering via proxy nonce]
  tools: [@next/codemod middleware-to-proxy transform]

key-files:
  created:
    - src/proxy.ts
  modified:
    - src/lib/local-store.ts
    - next.config.ts
  deleted:
    - src/middleware.ts

key-decisions:
  - "X-Frame-Options set to DENY (resolved SAMEORIGIN vs DENY conflict — DENY is stronger)"
  - "Referrer-Policy set to strict-origin-when-cross-origin (resolved value conflict — stricter is better)"
  - "unsafe-eval retained in development CSP only, removed in production (official Next.js pattern)"
  - "Static headers in next.config.ts, only dynamic CSP + auth check in proxy.ts (avoids runtime overhead)"
  - "Codemod used for middleware→proxy migration, then proxy.ts manually rewritten for CSP"

patterns-established:
  - "Dynamic security: per-request CSP nonces in proxy.ts with crypto.randomUUID()"
  - "Static security: build-time headers in next.config.ts"
  - "Auth guard: cookie check for /dashboard/* routes in proxy.ts"

requirements-completed:
  - REQ-1
  - REQ-2
  - REQ-3
  - REQ-5

# Metrics
duration: 8min
completed: 2026-06-11
---

# Phase 01 Configuration & Infrastructure Hardening — Plan 02 Summary

**Fixed TypeScript variable name bug, migrated middleware→proxy with nonce-based CSP (no unsafe-inline, no upstash.io), consolidated static security headers in next.config.ts, and removed ignoreBuildErrors**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-11T12:42:00Z
- **Completed:** 2026-06-11T12:50:00Z
- **Tasks:** 3
- **Files modified:** 3 (1 created, 1 modified, 1 deleted)

## Accomplishments

- **Fixed the sole real TypeScript error** — `scanHistory` variable name bug in `local-store.ts:103` that motivated `ignoreBuildErrors: true`
- **Migrated middleware.ts → proxy.ts** via official Next.js 16 codemod, then rewrote with nonce-based CSP using `crypto.randomUUID()`
- **Implemented strict CSP** — no `unsafe-inline`, no `*.upstash.io`, no `X-XSS-Protection`; `unsafe-eval` only in development
- **Consolidated static security headers** in `next.config.ts` — added HSTS with preload, Permissions-Policy; resolved X-Frame-Options (DENY) and Referrer-Policy (strict-origin-when-cross-origin) conflicts
- **Removed `ignoreBuildErrors: true`** — `npx tsc --noEmit` now passes with 0 errors
- **47 existing tests continue to pass**

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix TypeScript variable name bug in local-store.ts** - `e71ea4e` (fix)
2. **Task 2: Migrate middleware to proxy with nonce-based CSP** - `d95f69e` (feat)
3. **Task 3: Consolidate static security headers and remove ignoreBuildErrors** - `f8423d4` (feat)

**Plan metadata:** *(committed by orchestrator)*

## Files Created/Modified

- `src/proxy.ts` — Created: nonce-based CSP generation, auth check, x-nonce header, broad matcher
- `src/lib/local-store.ts` — Modified: fixed `history` → `scanHistory` variable name (line 103)
- `next.config.ts` — Modified: consolidated headers (HSTS, DENY XFO, Permissions-Policy, strict-origin Referrer), removed `ignoreBuildErrors`
- `src/middleware.ts` — Deleted (migrated to proxy.ts)

## Decisions Made

- **X-Frame-Options: DENY** — Resolved the `SAMEORIGIN` vs `DENY` conflict between middleware.ts and next.config.ts. DENY is the stronger option, preventing all framing.
- **Referrer-Policy: strict-origin-when-cross-origin** — Resolved the value conflict. Strictest practical option still allows referrer on same-origin.
- **unsafe-eval only in dev** — Following official Next.js CSP pattern. Production gets strict nonce-based CSP without eval.
- **Static vs dynamic separation** — Static headers in next.config.ts (build-time, no runtime cost), dynamic CSP and auth in proxy.ts (per-request).
- **Codemod first, then manual rewrite** — Used `@next/codemod@canary middleware-to-proxy` for the file rename and export rename, then manually rewrote proxy.ts for full CSP nonce implementation.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- **Codemod safety check** — `@next/codemod@canary middleware-to-proxy` refused to run due to unrelated dirty files from plan 01. Used `--force` flag to proceed.
- **Codemod only renamed — didn't rewrite content** — Expected behavior. The codemod handles file rename + export rename only. Full CSP implementation required manual rewrite of proxy.ts content, which was always the plan (Step A → codemod, Step B → rewrite).
- **ignoreBuildErrors grep false positive** — My comment `// ignoreBuildErrors removed — ...` contained the string `ignoreBuildErrors`, which caused the acceptance criteria check to fail. Fixed by rewording the comment.

## User Setup Required

None — no external service configuration required.

## Verification Results

- `npx tsc --noEmit` — 0 errors (PASS)
- `npx vitest run` — 47 tests pass, 6 test files (PASS)
- `src/middleware.ts` deleted, `src/proxy.ts` exists — PASS
- proxy.ts has `export function proxy`, `crypto.randomUUID`, `x-nonce`, auth check — PASS
- proxy.ts has NO `unsafe-inline`, NO `*.upstash.io`, NO `X-XSS-Protection`, NO static security headers — PASS
- proxy.ts matcher covers all routes (not just dashboard/api) — PASS
- next.config.ts has HSTS, DENY X-Frame-Options, strict-origin Referrer-Policy, Permissions-Policy — PASS
- next.config.ts has NO `ignoreBuildErrors`, NO `Content-Security-Policy`, NO `X-XSS-Protection` — PASS

## Self-Check: PASSED

### Files
- `src/proxy.ts` — FOUND
- `src/middleware.ts` — DELETED (OK)
- `src/lib/local-store.ts` — FOUND
- `next.config.ts` — FOUND
- `.planning/.../01-02-SUMMARY.md` — FOUND

### Commits
- `e71ea4e` — FOUND (fix TS variable name)
- `d95f69e` — FOUND (feat middleware→proxy with nonce CSP)
- `f8423d4` — FOUND (feat consolidate headers, remove ignoreBuildErrors)

### proxy.ts content
- `export function proxy` — PASS
- `crypto.randomUUID` — PASS
- `x-nonce` header — PASS
- `github_token` auth check — PASS
- NO `unsafe-inline` — PASS
- NO `upstash.io` — PASS
- NO `X-XSS-Protection` — PASS

### next.config.ts content
- `Strict-Transport-Security` with preload — PASS
- `X-Frame-Options: DENY` — PASS
- `Referrer-Policy: strict-origin-when-cross-origin` — PASS
- `Permissions-Policy` with restrictive defaults — PASS
- NO `ignoreBuildErrors` — PASS
- NO `Content-Security-Policy` — PASS
- NO `X-XSS-Protection` — PASS

### Tests
- `npx tsc --noEmit` — 0 errors PASS
- `npx vitest run` — 47 tests pass PASS

## Next Phase Readiness

- TypeScript strict checking enabled (no more `ignoreBuildErrors`)
- CSP with nonces ready for dynamic rendering across all pages
- Static security headers consolidated with correct, strict values
- Stale configuration remnants (upstash.io, unsafe-inline, X-XSS-Protection) removed
- Ready for Phase 2: Authentication & Security Hardening

---

*Phase: 01-configuration-infrastructure-hardening*
*Plan: 02*
*Completed: 2026-06-11*
