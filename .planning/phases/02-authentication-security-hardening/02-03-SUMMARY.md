---
phase: 02-authentication-security-hardening
plan: 03
subsystem: api
tags: [typescript, error-handling, type-safety, unknown-type]
requires:
  - phase: 01-configuration-infrastructure-hardening
    provides: TypeScript configuration with strict mode
provides:
  - All 10 API route catch blocks converted from `error: any` to `error: unknown` with proper type guards
affects: [03-code-quality-architecture-refinement, 04-test-coverage-expansion]
tech-stack:
  added: []
  patterns:
    - "`error: unknown` with `error instanceof Error` type guard in catch blocks"
    - "Controlled error messages via `error instanceof Error ? error.message : 'Unknown error'` instead of raw property access"
key-files:
  created: []
  modified:
    - src/app/api/scan/route.ts
    - src/app/api/batch-scan/route.ts
    - src/app/api/ai/explain/route.ts
    - src/app/api/ai/generate-prompt/route.ts
    - src/app/api/repos/webapp/route.ts
    - src/app/api/user/export/route.ts
    - src/app/api/threat-intel/route.ts
key-decisions:
  - "Used `error instanceof Error ? error.message : 'Unknown error'` for .message access in error responses to prevent accidental leakage of internal error details"
  - "Used `error instanceof Error ? error.message : String(error)` for console.error template literals to handle non-Error thrown values"
  - "Bare `error` in `console.error('msg:', error)` kept unguarded since console.error accepts `unknown`"
patterns-established:
  - "Catch block type guard: use `error: unknown` always, guard `.message` access with `error instanceof Error`"
requirements-completed: [REQ-8]
duration: 8min
completed: 2026-06-11
---

# Phase 02 Plan 03: Replace error:any with error:unknown in API Routes Summary

**Converted all 10 catch blocks across 7 API route files from `error: any` to `error: unknown` with proper `instanceof Error` type guards, eliminating unsafe member access on caught exceptions**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-11T13:37:00Z
- **Completed:** 2026-06-11T13:40:30Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Removed all 10 instances of `error: any` across 7 API route catch blocks
- Added proper `error instanceof Error` type guards wherever `.message` was accessed (6 guarded accesses)
- For catch blocks with only `console.error('msg:', error)`, left `error` bare since `console.error` accepts `unknown`
- TypeScript compiles cleanly (`npx tsc --noEmit` — 0 errors)
- All 47 existing tests pass (`npx vitest run` — 6 test files, all passing)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix error:any in scan/route.ts and batch-scan/route.ts** — `d2704f1` (fix)
2. **Task 2: Fix error:any in remaining 5 API route files** — `4fdf78a` (fix)

## Files Created/Modified

- `src/app/api/scan/route.ts` — 2 catch blocks converted (GET no `.message`, POST with `.message` guard)
- `src/app/api/batch-scan/route.ts` — 2 catch blocks converted (inner with 2 `.message` guards, outer with 1)
- `src/app/api/ai/explain/route.ts` — 1 catch block converted (no `.message` access)
- `src/app/api/ai/generate-prompt/route.ts` — 1 catch block converted (no `.message` access)
- `src/app/api/repos/webapp/route.ts` — 2 catch blocks converted (inner no `.message`, outer with `.message` guard)
- `src/app/api/user/export/route.ts` — 1 catch block converted (with `.message` guard)
- `src/app/api/threat-intel/route.ts` — 2 catch blocks converted (GET and POST, both with `.message` guard)

## Decisions Made

- **Bare `error` in console.error:** When `console.error('prefix:', error)` is the only use, no type guard is needed since `console.error` accepts `unknown`. This avoids unnecessary `instanceof Error` ceremony.
- **Error response messages:** All error response `.message` accesses use `error instanceof Error ? error.message : 'Unknown error'` to prevent accidental leakage of non-Error thrown values to the client (aligned with threat model T-02-05/T-02-06).
- **Template literal console.error:** When `.message` appears inside a template literal (e.g., `Failed to scan ${name}:`), the guard uses `String(error)` fallback to ensure a string is always interpolated.

## Deviations from Plan

None - plan executed exactly as written.

## Threats Mitigated

Per the threat model in PLAN.md:
- **T-02-05 (Information Disclosure):** `error: unknown` prevents accessing `.message` without a type guard, ensuring only properly-typed error messages reach response bodies.
- **T-02-06 (Information Disclosure):** All error responses use controlled message strings (`'Unknown error'`), not raw caught values.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All API routes now use `error: unknown` with proper type guards
- Ready for Phase 03 (Code Quality & Architecture Refinement)

## Self-Check: PASSED

- [x] SUMMARY.md exists at `.planning/phases/02-authentication-security-hardening/02-03-SUMMARY.md`
- [x] Commit `d2704f1` exists (Task 1)
- [x] Commit `4fdf78a` exists (Task 2)
- [x] No `error: any` found in any API route file
- [x] TypeScript compiles without errors

---

*Phase: 02-authentication-security-hardening*
*Plan: 03*
*Completed: 2026-06-11*
