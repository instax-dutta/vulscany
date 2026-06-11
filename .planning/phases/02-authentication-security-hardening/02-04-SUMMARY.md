---
phase: 02-authentication-security-hardening
plan: 04
type: execute
subsystem: library-error-handling
tags:
  - type-safety
  - error-handling
  - unknown-type
  - catch-blocks
requires: [02-03]
provides: [REQ-8-completion]
affects:
  - src/lib/ai/mistral.ts
  - src/lib/ai/ollama.ts
  - src/lib/github/client.ts
  - src/lib/threat-intel/github-advisories.ts
  - src/lib/threat-intel/cve-fetcher.ts
tech-stack:
  added: []
  patterns:
    - "catch (error: unknown) with `error instanceof Error` type guard"
    - "catch (error: unknown) with `'status' in error` type guard for Octokit errors"
key-files:
  created: []
  modified:
    - src/lib/ai/mistral.ts
    - src/lib/ai/ollama.ts
    - src/lib/github/client.ts
    - src/lib/threat-intel/github-advisories.ts
    - src/lib/threat-intel/cve-fetcher.ts
decisions: []
metrics:
  duration: ~10m
  completed_date: "2026-06-11"
commits:
  - e031645: fix(02-auth-security): replace error:any with error:unknown in AI provider files
  - 21ffe74: fix(02-auth-security): replace error:any with error:unknown in github client
  - 55a52d3: fix(02-auth-security): replace error:any with error:unknown in threat-intel fetchers
---

# Phase 2 Plan 4: Fix catch block types in library files

Replace all `error: any` with `error: unknown` + type guards in 15 catch blocks across 5 library files (AI providers, GitHub client, CVE/advisory fetchers). Completes REQ-8 by fixing all non-API-route files.

## Tasks Executed

### Task 1: Fix error:any in AI provider files (mistral.ts, ollama.ts)

- **Commit:** `e031645`
- **Files:** `src/lib/ai/mistral.ts`, `src/lib/ai/ollama.ts`
- **Changes:**
  - `mistral.ts`: 2 catch blocks (Pattern A — `rotator.markKeyFailed`)
  - `ollama.ts`: 3 catch blocks (1 Pattern B — console.error; 2 Pattern A — `rotator.markKeyFailed`)
- **Verification:** 0 `error: any` in both files; 2 `instanceof Error` in mistral.ts, 3 in ollama.ts

### Task 2: Fix error:any in github/client.ts

- **Commit:** `21ffe74`
- **File:** `src/lib/github/client.ts`
- **Changes:**
  - 5 catch blocks converted:
    - 3 Pattern C (console.error + throw): `fetchUserRepositories`, `checkRateLimit`
    - 2 Pattern D (conditional 404 + console.error): `getFileContent`, `getDirectoryContents`
    - 1 Pattern D (no-op return false): `hasFile`
- **Verification:** 0 `error: any`; 4 `instanceof Error`; 2 `'status' in error`

### Task 3: Fix error:any in threat-intel fetcher files

- **Commit:** `55a52d3`
- **Files:** `src/lib/threat-intel/github-advisories.ts`, `src/lib/threat-intel/cve-fetcher.ts`
- **Changes:**
  - `github-advisories.ts`: 3 catch blocks (Pattern B — console.error)
  - `cve-fetcher.ts`: 2 catch blocks (Pattern B — console.error)
- **Verification:** 0 `error: any` in both files; 3 `instanceof Error` in github-advisories.ts, 2 in cve-fetcher.ts

## Global Verification

```
$ grep -rn "error: any" src/lib/
PASS: Zero instances of 'error: any' in src/lib/

$ npx tsc --noEmit
PASS: No TypeScript errors

$ npx vitest run
PASS: 47 tests passed, 6 test files (7.76s)
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. These are pure type-safety changes with zero behavioral impact.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes were introduced. The type guard changes strictly improve runtime safety by eliminating `error: any` patterns that could cause cascading failures in catch handlers.

## Type Patterns Applied

| Pattern | Count | Files |
|---------|-------|-------|
| Pattern A — `rotator.markKeyFailed` with `const errMsg` | 5 | mistral.ts (2), ollama.ts (2), — |
| Pattern B — `console.error + return []` | 6 | ollama.ts (1), github-advisories.ts (3), cve-fetcher.ts (2) |
| Pattern C — `console.error + throw new Error` | 3 | client.ts: fetchUserRepositories, checkRateLimit |
| Pattern D — `error.status` guarded with `'status' in error` | 2 | client.ts: getFileContent, getDirectoryContents |
| Pattern D — no-op return | 1 | client.ts: hasFile |

## Self-Check: PASSED

- [x] mistral.ts: 0 `error: any`, 2 `instanceof Error`
- [x] ollama.ts: 0 `error: any`, 3 `instanceof Error`
- [x] client.ts: 0 `error: any`, 4 `instanceof Error`, 2 `'status' in error`
- [x] github-advisories.ts: 0 `error: any`, 3 `instanceof Error`
- [x] cve-fetcher.ts: 0 `error: any`, 2 `instanceof Error`
- [x] `grep -rn "error: any" src/lib/`: Zero matches
- [x] `npx tsc --noEmit`: No errors
- [x] `npx vitest run`: 47/47 tests passed
- [x] 3 commits created (one per task)
