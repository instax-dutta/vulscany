---
phase: 1
slug: configuration-infrastructure-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^4.0.18 |
| **Config file** | `./vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~7 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 7 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | REQ-1 | T-1-01 / — | Build fails on TS error | manual-only | `npx next build` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | REQ-2 | T-1-02 / — | Headers consolidated, no duplicates | manual-only | `curl -I` inspection | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | REQ-3 | T-1-03 / — | CSP nonce rotates per request | manual-only | `curl -I` to check nonce | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | REQ-4 | T-1-04 / — | Import paths point to memory-cache | build | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 1-01-05 | 01 | 1 | REQ-5 | T-1-05 / — | upstash.io not in CSP header | manual-only | grep on proxy.ts | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing 47 tests pass after all changes (`npx vitest run`)
- [ ] `npx next build` succeeds without `ignoreBuildErrors` (Wave 0 gate)

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Build succeeds without ignoreBuildErrors | REQ-1 | Requires full Next.js build pipeline | `npx next build` — must exit 0 |
| Security headers set correctly, no duplicates | REQ-2 | Header inspection requires live server | `curl -I http://localhost:3000` — check X-Frame-Options, Referrer-Policy appear exactly once |
| CSP nonce is unique per request | REQ-3 | Nonce generation is per-request | `curl -I http://localhost:3000` twice — nonce values must differ |
| upstash.io not in CSP header | REQ-5 | Config value check | `grep upstash` on proxy.ts — must return no matches |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 7s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
