# vulscany Requirements

**Source:** Comprehensive code review

---

| ID | Description | Phase | Priority |
|----|-------------|-------|----------|
| REQ-1 | Remove or document `ignoreBuildErrors: true` in next.config.ts | 1 | Critical |
| REQ-2 | Consolidate duplicate security headers between middleware.ts and next.config.ts | 1 | High |
| REQ-3 | Tighten Content-Security-Policy to use nonces instead of `unsafe-inline` | 1 | High |
| REQ-4 | Rename `redis-cache.ts` to `memory-cache.ts` and update all imports | 1 | Medium |
| REQ-5 | Remove stale `*.upstash.io` from CSP connect-src | 1 | Low |
| REQ-6 | Standardize API authentication — middleware should protect API routes consistently | 2 | Critical |
| REQ-7 | Add `Secure; SameSite=Lax` to session cookies | 2 | High |
| REQ-8 | Replace `error: any` in catch blocks with `unknown` + type guards | 2 | Medium |
| REQ-9 | Replace custom `hashDependencies` with `crypto.createHash('sha256')` | 2 | Medium |
| REQ-10 | Refactor `dashboard/page.tsx` (<1016 lines) into smaller components | 3 | High |
| REQ-11 | Refactor `DashboardFeatures.tsx` (<834 lines) into focused modules | 3 | High |
| REQ-12 | Extract SSR injection check from `scanFileContent` into separate utility | 3 | Medium |
| REQ-13 | Replace naive line-by-line diff with proper diff library | 3 | Low |
| REQ-14 | Normalize indentation and semicolon style across the codebase | 3 | Low |
| REQ-15 | Add tests for threat-intel orchestration (orchestrator, CVE fetcher, risk analyzer) | 4 | High |
| REQ-16 | Add tests for all `/api/ai/*` endpoints | 4 | High |
| REQ-17 | Add tests for GitHub client and PR creator | 4 | Medium |
| REQ-18 | Add tests for local-store persistence (CRUD operations) | 4 | Medium |
| REQ-19 | Add integration test for full scan pipeline (scan → cache → store) | 4 | Medium |
| REQ-20 | Add tests for AI fallback logic (AI fail → pattern fix → comment) | 4 | Low |
