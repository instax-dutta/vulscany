# vulscany — Code Quality & Security Hardening Roadmap

**Created:** 2026-06-11
**Source:** Comprehensive code review

---

## Phase 1: Configuration & Infrastructure Hardening

**Goal:** Fix configuration-level issues, consolidate security headers, remove stale Redis references, and tighten CSP.

**Requirements:** REQ-1, REQ-2, REQ-3, REQ-4, REQ-5

| Area | Issue | Fix |
|------|-------|-----|
| Build | `ignoreBuildErrors: true` in next.config.ts | Remove or document with remediation plan |
| Security Headers | Duplicate in middleware.ts and next.config.ts with conflicting values | Consolidate into middleware.ts |
| CSP | `unsafe-eval` and `unsafe-inline` across all script-src | Use nonces or tighten |
| Naming | `redis-cache.ts` is in-memory Map, not Redis | Rename to `memory-cache.ts`, update imports |
| CSP residue | `connect-src *.upstash.io` but no Upstash dependency | Remove stale CSP entry |
| Naming | `VulnScany` user-agent in github/client.ts | Fix to `vulscany` |

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Rename redis-cache.ts to memory-cache.ts, update all imports, fix user-agent
- [x] 01-02-PLAN.md — Fix TS bug, migrate middleware→proxy with nonce CSP, consolidate headers, remove ignoreBuildErrors

**Depends on:** None

---

## Phase 2: Authentication & Security Hardening

**Goal:** Close auth gaps, harden cookie security, fix type safety in catch blocks, and eliminate collision-prone hashing.

**Requirements:** REQ-6, REQ-7, REQ-8, REQ-9

| Area | Issue | Fix |
|------|-------|-----|
| Auth | Middleware protects `/dashboard` but API routes check cookie internally — inconsistent | Standardize API auth |
| Cookies | No `Secure; SameSite=Lax` attributes on session cookies | Add cookie options |
| Type safety | `error: any` in catch blocks across API routes | Use `unknown` with type guards |
| Hash collision | Custom `hashDependencies` in threat-intel/index.ts | Replace with `crypto.createHash('sha256')` |
| API key rotation | Random selection from key list; rate-limited keys still selected | Round-robin with failure penalty |

**Depends on:** Phase 1

**Plans:** 4 plans

Plans:
- [x] 02-01-PLAN.md — Standardize API auth in proxy.ts, add defense-in-depth checks to unguarded routes, verify key rotation
- [x] 02-02-PLAN.md — Replace hashDependencies with crypto.createHash('sha256'), verify cookie security attributes
- [x] 02-03-PLAN.md — Fix error:any → unknown in API route catch blocks (7 files, 10 instances)
- [x] 02-04-PLAN.md — Fix error:any → unknown in library catch blocks (5 files, 15 instances)

---

## Phase 3: Code Quality & Architecture Refinement

**Goal:** Break down oversized components, extract complex functions, fix style inconsistencies, and replace naive utilities.

**Requirements:** REQ-10, REQ-11, REQ-12, REQ-13, REQ-14

| Area | Issue | Fix |
|------|-------|-----|
| Size | `dashboard/page.tsx` — 1016 lines | Extract sub-components |
| Size | `DashboardFeatures.tsx` — 834 lines | Split into focused modules |
| Complexity | `scanFileContent` mixes pattern matching, SSR injection, string context detection | Extract SSR injection check |
| Diff | `generateDiff` compares lines index-by-index | Use proper diff library |
| Style | Mixed indentation (2 vs 4 spaces) | Normalize to project standard |
| Style | Inconsistent semicolon usage | Configure ESLint to enforce |

**Depends on:** Phase 2

**Plans:** 5 plans

Plans:
- [x] 03-01-PLAN.md — Extract SSR injection check from scanFileContent into ssr-detector.ts
- [x] 03-02-PLAN.md — Replace naive line-by-line diff with proper diff library
- [x] 03-03-PLAN.md — Normalize indentation and semicolon style via ESLint
- [x] 03-04-PLAN.md — Split DashboardFeatures.tsx into focused modules
- [x] 03-05-PLAN.md — Refactor dashboard/page.tsx into smaller components

---

## Phase 4: Test Coverage Expansion

**Goal:** Achieve meaningful test coverage for critical paths — threat-intel, AI routes, GitHub client, local-store, and integration tests.

**Requirements:** REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20

| Area | Current Coverage | Target |
|------|-----------------|--------|
| Threat-intel | None | Orchestrator + CVE fetcher + risk analyzer |
| AI routes | `fix-generator.test.ts` exists | All `/api/ai/*` endpoints |
| GitHub client | None | Client + PR creator |
| Local-store | None | CRUD + persistence |
| Auth flow | `GitHubAuthButton.test.tsx` exists | Full OAuth callback + session |
| Scan pipeline | Unit tests exist | Integration test: scan → cache → store |
| AI fallback | Not explicitly tested | AI fail → pattern fix → comment path |

**Plans:** 6/6 plans complete

Plans:
- [x] 04-01-PLAN.md — Unit tests for src/lib/local-store.ts (CRUD + I/O mocking)
- [x] 04-02-PLAN.md — Unit tests for src/proxy.ts (CSP generation + auth guard)
- [x] 04-03-PLAN.md — Unit tests for threat-intel: memory-cache + cve-fetcher
- [x] 04-04-PLAN.md — Unit tests for threat-intel: github-advisories + risk-analyzer
- [x] 04-05-PLAN.md — Unit tests for threat-intel index orchestrator + hashDependencies
- [x] 04-06-PLAN.md — Integration test for scan-fix pipeline

**Depends on:** Phase 3
