# Deferred Items — Phase 01 / Plan 01

## Pre-existing TypeScript Error (unrelated to this plan)

- **File:** `src/lib/local-store.ts:104`
- **Error:** `TS2552: Cannot find name 'scanHistory'. Did you mean 'getScanHistory'?`
- **Discovered during:** Post-task TypeScript verification (`npx tsc --noEmit`)
- **Root cause:** Pre-existing — not introduced by any changes in this plan. It's in an entirely different file/subsystem.
- **Action:** Logged for triage in a future code-quality phase. Do not fix as part of this plan per scope boundary rules.
