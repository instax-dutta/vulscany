---
phase: 03-code-quality-architecture-refinement
plan: 02
subsystem: ai-fix-generator
tags: [diff, unified-diff, createTwoFilesPatch, fix-generator]

requires:
  - phase: 03-code-quality-architecture-refinement
    provides: existing fix-generator with naive line-by-line diff
provides:
  - Proper unified diff generation in generateDiff using the diff library
  - Standard git-style diff output with ---/+++ headers, @@ chunk markers, context lines
affects: []

tech-stack:
  added: [diff@9.0.0]
  patterns:
    - "Use createTwoFilesPatch from the diff library for all before/after code comparisons"
    - "Standard 3-line context in unified diff format"

key-files:
  created: []
  modified:
    - package.json
    - package-lock.json
    - src/lib/ai/fix-generator.test.ts
    - src/lib/ai/fix-generator.ts

key-decisions:
  - "Use diff@9.0.0 library (ships own TypeScript types, no @types/diff needed)"
  - "Use createTwoFilesPatch with fileName args 'original'/'fixed' (not real file paths)"
  - "Use context: 3 for standard 3-line surrounding context like git diff"

patterns-established:
  - "Diff generation: import { createTwoFilesPatch } from 'diff'; createTwoFilesPatch('original', 'fixed', original, fixed, undefined, undefined, { context: 3 })"

requirements-completed: [REQ-13]

duration: 8min
completed: 2026-06-11
---

# Phase 03 Plan 02: Replace Naive Diff with Proper Unified Diff

**Replaced the naive index-based line-by-line diff in generateDiff with a proper unified diff using the industry-standard diff@9.0.0 library**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-11T13:55:00Z
- **Completed:** 2026-06-11T14:03:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Installed `diff@9.0.0` production dependency (ships own TypeScript types, no `@types/diff` needed)
- Rewrote `generateDiff` from naive same-index line comparison to `createTwoFilesPatch` with 3-line context
- Updated test assertions from `'- '`/`'+ '` (old format with space after prefix) to `'-'`/`'+'` (unified diff format)
- All 13 fix-generator tests pass; function signature preserved, call sites unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Install diff package and update test expectations** - `94a2270` (chore)
2. **Task 2: Replace generateDiff with proper unified diff** - `d4289e5` (feat)

## Files Modified

- `package.json` / `package-lock.json` - Added `diff@9.0.0` to dependencies
- `src/lib/ai/fix-generator.test.ts` - Updated Diff Generation test assertions from `'- '`/`'+ '` to `'-'`/`'+'`
- `src/lib/ai/fix-generator.ts` - Added import `{ createTwoFilesPatch } from 'diff'`, replaced ~21-line naive function with 9-line proper unified diff using `createTwoFilesPatch('original', 'fixed', original, fixed, undefined, undefined, { context: 3 })`

## Decisions Made

- **diff@9.0.0**: The diff library v9 ships its own TypeScript declarations (`libcjs/index.d.ts`), so no `@types/diff` dev dependency is needed
- **createTwoFilesPatch with 'original'/'fixed' labels**: Since we're comparing before/after content (not actual file paths), using descriptive labels in the patch headers is appropriate
- **context: 3**: Standard git-like 3 lines of surrounding context for readability while keeping patches concise

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Two pre-existing TypeScript errors in `src/lib/scanner/index.ts` (`extractSnippet` and `checkSsrInjection` not found). These are unrelated to this plan's changes (out of scope per scope boundary rules).

## Stub Tracking

No stubs were introduced. The implementation is complete and fully functional.

## Threat Surface Scan

No new threat surface introduced beyond what the plan's threat model covers (T-03-02: npm:diff dependency accepted as low risk).

## Next Phase Readiness

- `generateDiff` produces correct unified diffs with proper chunk markers and context
- Ready for downstream consumers that read the `diff` field of `FixResult`

---

## Self-Check: PASSED

- ✅ `package.json` - exists
- ✅ `src/lib/ai/fix-generator.ts` - exists, imports `createTwoFilesPatch` from `diff`
- ✅ `src/lib/ai/fix-generator.test.ts` - exists, assertions updated
- ✅ `03-02-SUMMARY.md` - exists
- ✅ Commit `94a2270` - install diff and update tests
- ✅ Commit `d4289e5` - replace generateDiff with unified diff
- ✅ `diff@9.0.0` - installed and listed in dependencies
- ✅ 13/13 tests pass

## Plan Completion

**Plan:** 03-02
**Tasks:** 2/2 complete
**SUMMARY:** `.planning/phases/03-code-quality-architecture-refinement/03-02-SUMMARY.md`

**Commits:**
- `94a2270`: chore(03-02): install diff package and update test expectations
- `d4289e5`: feat(03-02): replace generateDiff with proper unified diff using diff library

**Duration:** ~8 minutes

*Phase: 03-code-quality-architecture-refinement*
*Completed: 2026-06-11*
