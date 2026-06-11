# Phase 1: Configuration & Infrastructure Hardening - Research

**Researched:** 2026-06-11
**Domain:** Next.js 16 configuration, security headers, Content Security Policy, file migration
**Confidence:** HIGH

## Summary

This phase addresses five configuration-level issues in the vulscany codebase. The most significant finding is that **Next.js 16 has deprecated `middleware.ts` in favor of `proxy.ts`**, which all security header work must account for. There is exactly **one real TypeScript error** that motivated `ignoreBuildErrors: true` — a variable name bug in `src/lib/local-store.ts:104` (`scanHistory` vs `history`). The duplicate security headers between `middleware.ts` and `next.config.ts` have conflicting values for `X-Frame-Options` (`DENY` vs `SAMEORIGIN`) and `Referrer-Policy` (`strict-origin-when-cross-origin` vs `origin-when-cross-origin`), both of which must be resolved. CSP nonce support requires migrating to `proxy.ts`, which runs in the Node.js runtime (not Edge) and provides access to `crypto.randomUUID()` for per-request nonce generation. The `redis-cache.ts` rename affects 4 import sites across 2 directories.

**Primary recommendation:** Migrate `middleware.ts` → `proxy.ts`, consolidate all static security headers in `next.config.ts`, implement nonce-based CSP in `proxy.ts`, fix the TS error and remove `ignoreBuildErrors: true`, rename `redis-cache.ts` → `memory-cache.ts` with import updates, and remove stale `*.upstash.io` from CSP.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REQ-1 | Remove or document `ignoreBuildErrors: true` in next.config.ts | **One real TS error found** — `src/lib/local-store.ts:104` references `scanHistory` but variable is `history`. Fix this bug, then safely remove the flag. Build compiles successfully otherwise. |
| REQ-2 | Consolidate duplicate security headers between middleware.ts and next.config.ts | **Conflicting values found**: `X-Frame-Options` (`DENY` vs `SAMEORIGIN`), `Referrer-Policy` (`strict-origin-when-cross-origin` vs `origin-when-cross-origin`). **Recommended split**: Static headers → `next.config.ts`, dynamic CSP with nonces → `proxy.ts` |
| REQ-3 | Tighten CSP to use nonces instead of `unsafe-inline` | Next.js 16 supports nonce-based CSP via `proxy.ts`. Official pattern: generate nonce via `crypto.randomUUID()`, set CSP header + `x-nonce` header. Requires dynamic rendering (`connection()`). |
| REQ-4 | Rename `redis-cache.ts` to `memory-cache.ts` | **4 files import from it**: `threat-intel/index.ts`, `threat-intel/github-advisories.ts`, `threat-intel/cve-fetcher.ts`, `ai/response-cache.ts` (2 import sites). All use relative imports. |
| REQ-5 | Remove stale `*.upstash.io` from CSP connect-src | `@upstash/redis` NOT in package.json dependencies (only in package-lock.json as transitive dependency). No source code references it. Safe to remove from CSP. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Security headers (static) | CDN / Static (next.config.ts) | — | Static values set at build time; no per-request logic needed [VERIFIED: securityheaders.com guides] |
| Content-Security-Policy with nonces | API / Backend (proxy.ts) | — | Nonce must be unique per request, can't be static [VERIFIED: nextjs.org CSP guide] |
| TypeScript compilation | Build system | — | Build-time check; affected files in src/ tree |
| File rename (redis-cache) | Source tree | — | Pure refactoring; no runtime state changes |
| User-agent string | API / Backend (github client) | — | Affects HTTP requests made by Octokit client |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.0.10 | Framework | Project dependency, defines proxy.ts middleware convention |
| @octokit/rest | ^22.0.1 | GitHub API client | Already installed; user-agent string needs fixing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@next/codemod@canary` | canary | Codemod for middleware→proxy migration | Use `npx @next/codemod@canary middleware-to-proxy .` — handles file rename and export rename automatically |

**Installation:**
```bash
# No new dependencies required for this phase
# Optional: run codemod for middleware-to-proxy migration
npx @next/codemod@canary middleware-to-proxy .
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@next/codemod` codemod | Manual rename | Manual: can validate CSP changes simultaneously; Codemod: faster, handles config renames automatically |

## Package Legitimacy Audit

> No new packages are installed in this phase. The `@next/codemod` is run via `npx` (not installed). All packages mentioned are already in the project's dependency tree.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| next | npm | 8+ yrs | 50M+/wk | vercel/next.js | [OK] | Already installed v16.0.10 |
| @octokit/rest | npm | 7+ yrs | 5M+/wk | octokit/rest.js | [OK] | Already installed v^22.0.1 |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client Request                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  proxy.ts (was middleware.ts)             │
│  ┌───────────────────────────────────────────────────┐   │
│  │  1. Generate nonce (crypto.randomUUID())           │   │
│  │  2. Set CSP header with nonce on response          │   │
│  │  3. Set x-nonce header on request                  │   │
│  │  4. Check auth cookie for /dashboard/* routes      │   │
│  └───────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              next.config.ts (static headers)             │
│  HSTS, X-Frame-Options, X-Content-Type-Options,         │
│  Referrer-Policy, Permissions-Policy, DNS-Prefetch      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          Next.js App Router (dynamic rendering)          │
│  - Connection() ensures dynamic rendering                │
│  - Next.js parses x-nonce from request headers           │
│  - Nonce automatically applied to inline scripts         │
└─────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
src/
├── lib/
│   ├── threat-intel/
│   │   ├── memory-cache.ts      # renamed from redis-cache.ts
│   │   ├── index.ts             # import updated
│   │   ├── cve-fetcher.ts       # import updated
│   │   ├── github-advisories.ts # import updated
│   │   └── ...
│   ├── ai/
│   │   ├── response-cache.ts    # import updated (2 sites)
│   │   └── ...
│   └── github/
│       ├── client.ts            # user-agent fix
│       └── ...
├── proxy.ts                     # renamed from middleware.ts
└── ...
```

### Pattern 1: Nonce-based CSP via proxy.ts (Official Next.js Pattern)
**What:** Generate a cryptographic nonce per-request in proxy.ts, set it in CSP header, and pass it via custom `x-nonce` header for Next.js to apply to inline scripts.
**When to use:** Every request when nonce-based CSP is required. All pages must be dynamically rendered.
**Source:** [VERIFIED: nextjs.org/docs/app/guides/content-security-policy]

```typescript
// proxy.ts (project root)
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')

  // Set x-nonce header for Next.js to read during rendering
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set CSP on the response
  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
```

### Pattern 2: Static Security Headers via next.config.ts
**What:** Non-dynamic security headers are set at build time in next.config.ts.
**When to use:** For headers with static values (X-Frame-Options, HSTS, Referrer-Policy, etc.)
**Source:** [VERIFIED: nextjs.org/docs/app/api-reference/next-config-js/headers]

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
    ];
  },

  // ... redirects, etc.
};
```

### Pattern 3: Force Dynamic Rendering for Nonce Support
**What:** Pages that expect to use nonces from the CSP must be dynamically rendered.
**When to use:** Any page that includes `<Script>` components with nonce support.
**Source:** [VERIFIED: nextjs.org/docs/app/guides/content-security-policy]

```tsx
import { connection } from 'next/server'

export default async function Page() {
  // Wait for incoming request — forces dynamic rendering
  await connection()

  return (
    <div>
      {/* Nonce automatically applied to next/script components */}
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Setting static headers in proxy.ts:** Static headers (HSTS, X-Frame-Options, etc.) belong in `next.config.ts`. Setting them in proxy.ts adds unnecessary runtime overhead for values that never change per-request.
- **Keeping both middleware.ts and proxy.ts:** Next.js 16 build will fail if both files coexist.
- **Using `unsafe-inline` with nonces:** Having both `unsafe-inline` and `'nonce-{value}'` in script-src makes the nonce ineffective — browsers ignore nonces when `unsafe-inline` is present.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Nonce generation | Custom random string | `crypto.randomUUID()` (Node.js built-in) | Available in proxy.ts (Node.js runtime); cryptographically secure per-request uniqueness |
| middleware→proxy migration | Manual rename + export changes | `@next/codemod@canary middleware-to-proxy .` | Handles file rename, export rename, config property renames, and type import renames automatically |

**Key insight:** proxy.ts runs in the **Node.js runtime** (not Edge), giving access to the full Node.js standard library including `crypto`. No polyfills or special libraries needed.

## Common Pitfalls

### Pitfall 1: `unsafe-inline` + nonces together
**What goes wrong:** Setting both `'unsafe-inline'` and `'nonce-{value}'` in the same `script-src` directive causes browsers to ignore the nonce and allow ALL inline scripts.
**Why it happens:** The CSP specification states that if `unsafe-inline` is present, nonces are ignored.
**How to avoid:** Remove `'unsafe-inline'` from `script-src` when using nonces. Only keep `'unsafe-eval'` in development.
**Warning signs:** CSP reports violations for scripts that should have nonces, or security test tools show "nonce ignored."

### Pitfall 2: Static pages can't use nonces
**What goes wrong:** Nonce-based CSP only works on dynamically rendered pages. Static pages generated at build time have no request context.
**Why it happens:** Nonces are per-request values; static pages have no request/response cycle.
**How to avoid:** Use `connection()` from `next/server` to force dynamic rendering on pages that need nonces. Alternatively, use hash-based CSP for static pages.
**Warning signs:** CSP violations on static pages after deploying nonce-based CSP.

### Pitfall 3: middleware.ts and proxy.ts both exist
**What goes wrong:** Next.js 16 build fails with an error about conflicting request interception files.
**Why it happens:** The deprecated `middleware.ts` and new `proxy.ts` can't coexist.
**How to avoid:** Delete `middleware.ts` after migrating to `proxy.ts`. Do not just rename — delete the old file.
**Warning signs:** Build error referencing duplicate middleware/proxy configuration.

### Pitfall 4: Referrer-Policy conflict between layers
**What goes wrong:** When `next.config.ts` sets `Referrer-Policy: origin-when-cross-origin` and `proxy.ts` sets `strict-origin-when-cross-origin`, downstream behavior is inconsistent and depends on route matching order.
**Why it happens:** Multiple configuration layers set headers; the last one wins.
**How to avoid:** Each header should be set in exactly one place. Static headers → `next.config.ts`, dynamic CSP → `proxy.ts`.

## Code Examples

Verified patterns from official sources:

### Complete proxy.ts with CSP Nonces + Auth Check
```typescript
// Source: [VERIFIED: nextjs.org/docs/app/guides/content-security-policy]
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // 1. Generate nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  // 2. Construct CSP with nonce
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://api.github.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ]

  // 3. Set x-nonce header for Next.js rendering
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // 4. Set CSP on response
  response.headers.set(
    'Content-Security-Policy',
    cspDirectives.join('; ')
  )

  // 5. Auth check for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('github_token')
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Complete next.config.ts Static Security Headers
```typescript
// Source: [VERIFIED: multiple security header guides]
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), payment=()',
        },
      ],
    },
  ];
},
```

### Fix redis-cache import paths (all 4 files)
```typescript
// src/lib/threat-intel/index.ts:9
import { getCachedThreatData, setCachedThreatData } from './memory-cache';

// src/lib/threat-intel/cve-fetcher.ts:7
import { getCachedThreatData, setCachedThreatData } from './memory-cache';

// src/lib/threat-intel/github-advisories.ts:7
import { getCachedThreatData, setCachedThreatData } from './memory-cache';

// src/lib/ai/response-cache.ts:7
import { getCachedThreatData, setCachedThreatData, getMultipleCachedThreatData } from '../threat-intel/memory-cache';

// src/lib/ai/response-cache.ts:186 (dynamic import)
const { getCachedKeys } = await import('../threat-intel/memory-cache');
```

### Fix the TypeScript error in local-store.ts
```typescript
// src/lib/local-store.ts:103-104
// CHANGE from:
// const history = await getScanHistory(githubId);
// return { user, scanHistory };  // ERROR: scanHistory doesn't exist

// TO:
const scanHistory = await getScanHistory(githubId);
return { user, scanHistory };
```

### Fix user-agent in github/client.ts
```typescript
// src/lib/github/client.ts:35
// CHANGE from:
// userAgent: 'VulnScany/1.0.0',
// TO:
userAgent: 'vulscany/1.0.0',
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts (Edge Runtime) | proxy.ts (Node.js Runtime) | Next.js 16.0 (2026) | Full Node.js API access, no 1MB code size limit, no Edge runtime restrictions |
| CSP with unsafe-inline | CSP with nonces | Industry standard (2020+) | Stronger XSS protection; requires dynamic rendering |
| X-XSS-Protection header | CSP + X-Content-Type-Options | Deprecated in Chrome 78 (2019) | Deprecated; browsers removed support; CSP is the modern replacement |

**Deprecated/outdated:**
- **`middleware.ts` file convention:** Deprecated in Next.js 16, renamed to `proxy.ts`. Build shows warning.
- **`X-XSS-Protection` header:** Deprecated, no longer supported in modern Chrome, Edge, Firefox, or Safari. The current `1; mode=block` value can actually introduce XSS vulnerabilities on legacy browsers. Remove entirely.
- **`unsafe-inline` in CSP:** Should be replaced with nonces or hashes for production security.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | proxy.ts runs in Node.js runtime with full crypto support | Architecture Patterns | LOW — verified by official Next.js 16 upgrade guide and migration docs |
| A2 | `@upstash/redis` is not used in any source code | Phase Requirements | LOW — verified by grep across src/; only in package-lock.json as sub-dependency |
| A3 | `connection()` from `next/server` forces dynamic rendering | Code Examples | LOW — verified by official Next.js CSP guide |

**If this table is empty:** Not applicable — verified claims dominate.

## Open Questions

1. **Should we migrate middleware.ts → proxy.ts as part of this phase, or defer to a separate task?**
   - What we know: Build shows deprecation warning. The CSP nonce implementation requires proxy.ts anyway (official pattern). Changing middleware means also migrating.
   - What's unclear: Whether the auth check in middleware should stay alongside CSP in the new proxy.ts, or be separated.
   - Recommendation: **Migrate now.** This phase already modifies middleware.ts for CSP changes. The codemod makes it trivial, and having both middleware and proxy is a build error.

2. **Should `unsafe-eval` be retained in production?**
   - What we know: Official Next.js CSP guide keeps `unsafe-eval` in development only, removes it in production. The current project has `unsafe-eval` in the CSP.
   - What's unclear: Whether any runtime code (Next.js itself, third-party scripts) requires `unsafe-eval`.
   - Recommendation: Keep `unsafe-eval` for dev, omit for production (following official Next.js CSP pattern). Flag for human review if production code breaks.

3. **Are any pages statically rendered that need nonces?**
   - What we know: Build output shows several static pages (`/`, `/features`, `/pricing`, etc.). Nonces won't apply to statically rendered pages.
   - What's unclear: Whether these static pages contain inline scripts that need nonces.
   - Recommendation: Use `connection()` on any page with `<Script>` components. For truly static pages without inline scripts, nonce CSP still applies via the header.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js build | ✓ | 25.8.2 | — |
| npm | Package management | ✓ | 11.11.1 | — |
| TypeScript | Type checking | ✓ | ^5 (in node_modules after npm install) | — |
| Next.js | Framework | ✓ | 16.0.10 | — |
| @next/codemod | middleware→proxy migration | ✓ (via npx) | canary | Manual migration |

**Missing dependencies with no fallback:** none
**Missing dependencies with fallback:** none

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest ^4.0.18 |
| Config file | `./vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-1 | Build succeeds without ignoreBuildErrors | manual-only | `npx next build` | ❌ (Wave 0) |
| REQ-2 | Security headers set correctly | manual-only | `curl -I` inspection | ❌ (Wave 0) |
| REQ-3 | CSP nonce generated per request | manual-only | `curl -I` to check nonce rotation | ❌ (Wave 0) |
| REQ-4 | Import paths updated after rename | build | `npx tsc --noEmit` | ❌ (Wave 0) |
| REQ-5 | upstash.io not in CSP header | manual-only | grep on proxy.ts | ❌ (Wave 0) |

### Sampling Rate
- **Per task commit:** `npx vitest run` (47 existing tests — ~7s)
- **Per wave merge:** `npx vitest run`
- **Phase gate:** `npx next build` must succeed (requires REQ-1 fix)

### Wave 0 Gaps
- [ ] Phase 1 is configuration/infrastructure — existing tests don't cover security headers, CSP nonces, or build config. Manual verification is appropriate (curl -I inspection). No new test files needed for this phase.

### Test Impact Assessment
- REQ-1 changes will make the TypeScript check run during builds; existing test files should remain unaffected
- REQ-2/3/5 are configuration-only changes — no new test files required
- REQ-4 is a rename — existing tests that indirectly use cache functions will pass once imports are updated
- The existing 47 tests all pass currently; verify they continue passing after changes

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | CSP with nonces controls inline script execution |
| V14 Configuration | yes | Remove insecure config defaults (ignoreBuildErrors) |
| V2 Authentication | partial | Auth cookie check in proxy.ts (same as current middleware) |

### Known Threat Patterns for Next.js 16 + proxy.ts

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via inline scripts | Tampering | CSP nonce blocks unauthorized inline scripts |
| Clickjacking | Spoofing | X-Frame-Options: DENY prevents framing |
| MIME sniffing attacks | Tampering | X-Content-Type-Options: nosniff |
| HTTPS downgrade | Tampering | HSTS with preload forces HTTPS |
| Auth bypass via subrequest header | Spoofing | CVE-2025-29927 patched in Next.js 14.2.25+/15.2.3+; project on v16.0.10 is safe |

**Note:** X-XSS-Protection header is deprecated and can introduce vulnerabilities. Remove it — CSP + X-Content-Type-Options provide better protection.

## Sources

### Primary (HIGH confidence)
- [VERIFIED: nextjs.org/docs/app/guides/content-security-policy] - official CSP nonce pattern for Next.js 16 + proxy.ts
- [VERIFIED: nextjs.org/docs/messages/middleware-to-proxy] - middleware → proxy migration, why and how
- [VERIFIED: nextjs.org/docs/app/api-reference/file-conventions/proxy] - proxy.ts file convention API reference
- [VERIFIED: npmjs.com] - package registry verification for all existing packages

### Secondary (MEDIUM confidence)
- [VERIFIED: Build output — typed error message] — `local-store.ts:104` TypeScript error: `scanHistory` not found
- [VERIFIED: Build output — deprecation warning] — middleware→proxy deprecation confirmed in build

### Tertiary (LOW confidence)
- [CITED: MDN X-XSS-Protection docs] — header is deprecated, removed from modern browsers
- [CITED: caniuse.com] — X-XSS-Protection support ended in Chrome 78, Safari 15.4, Edge 17

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Project dependencies confirmed, Next.js 16 behavior verified by build
- Architecture: HIGH - Proxy pattern and CSP nonce pattern from official Next.js documentation
- Pitfalls: HIGH - All verified against CSP spec and Next.js 16 behavior

**Research date:** 2026-06-11
**Valid until:** Next.js minor version changes could affect proxy.ts behavior (currently v16.0.10)
