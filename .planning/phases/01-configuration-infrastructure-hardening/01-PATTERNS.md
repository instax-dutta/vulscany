# Phase 1: Configuration & Infrastructure Hardening - Pattern Map

**Mapped:** 2026-06-11
**Files analyzed:** 9 (all modifications/renames)
**Analogs found:** 9 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/proxy.ts` (renamed from middleware.ts) | middleware/proxy | request-response | `src/middleware.ts` | exact |
| `next.config.ts` | config | static/build-time | `next.config.ts` (self) | exact |
| `src/lib/threat-intel/memory-cache.ts` (renamed from redis-cache.ts) | utility | utility (in-memory cache) | `src/lib/cache/scan-cache.ts` + `redis-cache.ts` | exact |
| `src/lib/threat-intel/index.ts` | service | CRUD (cache orchestration) | itself (import-only change) | exact |
| `src/lib/threat-intel/cve-fetcher.ts` | service | CRUD + external API fetch | itself (import-only change) | exact |
| `src/lib/threat-intel/github-advisories.ts` | service | CRUD + external API fetch | itself (import-only change) | exact |
| `src/lib/ai/response-cache.ts` | service | CRUD (cache management) | itself (import-only change) | exact |
| `src/lib/github/client.ts` | service | request-response (GitHub API) | itself (single-line fix) | exact |
| `src/lib/local-store.ts` | service | CRUD (file I/O persistence) | itself (single-line fix) | exact |

## Pattern Assignments

### `src/proxy.ts` (middleware/proxy, request-response)

**Analog:** `src/middleware.ts` (the file being renamed/transformed)

**Imports pattern** (lines 1-2):
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
```

**Current middleware export pattern** (lines 4-5):
```typescript
export function middleware(request: NextRequest) {
    // 1. Security Headers
    const response = NextResponse.next()
```

**Auth check pattern** (lines 18-23):
```typescript
    // 2. Auth Check for Dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('github_token')
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }
```

**Response return pattern** (line 25):
```typescript
    return response
}
```

**Matcher config pattern** (lines 28-33):
```typescript
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/:path*',
    ],
}
```

**Transform (per RESEARCH.md):**
- Rename export from `middleware` to `proxy`
- Move static security headers (lines 8-15) to `next.config.ts`
- Replace CSP with nonce-based CSP (per official Next.js pattern)
- Keep auth check block unchanged
- Add `x-nonce` header passing
- Expand matcher to cover all routes (not just `/dashboard` + `/api`)

---

### `next.config.ts` (config, static/build-time)

**Analog:** itself (modify existing file)

**Imports pattern** (line 1):
```typescript
import type { NextConfig } from "next";
```

**Config structure pattern** (lines 3-4):
```typescript
const nextConfig: NextConfig = {
  /* Production configuration */
  reactStrictMode: true,
```

**Headers pattern** (lines 15-38):
```typescript
  /* Headers for security and SEO */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // ...
        ],
      },
    ];
  },
```

**Redirects pattern** (lines 42-44):
```typescript
  /* Redirects */
  async redirects() {
    return [];
  },
```

**typeScript config pattern** (lines 46-48):
```typescript
  typescript: {
    ignoreBuildErrors: true,
  },
```

**Default export pattern** (line 51):
```typescript
export default nextConfig;
```

**Transform (per RESEARCH.md):**
- Remove `typescript.ignoreBuildErrors` block entirely
- Consolidate static headers: add `Strict-Transport-Security`, `Permissions-Policy`, fix `X-Frame-Options` to `DENY`, fix `Referrer-Policy` to `strict-origin-when-cross-origin`, remove `X-XSS-Protection`, remove `Content-Security-Policy` (moved to proxy.ts)

---

### `src/lib/threat-intel/memory-cache.ts` (utility, in-memory cache)

**Analog:** `src/lib/threat-intel/redis-cache.ts` (renamed, no content changes) + `src/lib/cache/scan-cache.ts`

**Imports pattern** — none (standalone utility).

**Cache data structure pattern** (redis-cache.ts line 5):
```typescript
const memoryCache = new Map<string, { data: any; expiry: number }>();
```

**Get function pattern** (lines 7-13):
```typescript
export async function getCachedThreatData(key: string): Promise<any | null> {
    const cached = memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }
    return null;
}
```

**Set function pattern** (lines 25-34):
```typescript
export async function setCachedThreatData(
    key: string,
    data: any,
    ttlSeconds: number = 86400
): Promise<void> {
    memoryCache.set(key, {
        data,
        expiry: Date.now() + ttlSeconds * 1000,
    });
}
```

**Delete function pattern** (lines 36-38):
```typescript
export async function deleteCachedThreatData(key: string): Promise<void> {
    memoryCache.delete(key);
}
```

**Key search pattern** (lines 40-43):
```typescript
export async function getCachedKeys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(memoryCache.keys()).filter(k => regex.test(k));
}
```

**Cleanup interval pattern** (lines 45-52):
```typescript
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
        if (value.expiry <= now) {
            memoryCache.delete(key);
        }
    }
}, 3600000);
```

**Analog note from scan-cache.ts** (lines 95-103 — same cleanup pattern):
```typescript
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
        if (value.expiry <= now) {
            memoryCache.delete(key);
        }
    }
}, 3600000); // Every hour
```

---

### `src/lib/threat-intel/index.ts` (service, CRUD — import-only change)

**Analog:** itself

**Imports pattern** (line 9 — change this):
```typescript
import { getCachedThreatData, setCachedThreatData } from './redis-cache';
```

**→ Change to:**
```typescript
import { getCachedThreatData, setCachedThreatData } from './memory-cache';
```

**Cache-first service pattern** (lines 21-26, example from `getLatestThreats`):
```typescript
    const cacheKey = 'threats:latest:react';
    const cached = await getCachedThreatData(cacheKey);

    if (cached) {
        return cached;
    }
```

---

### `src/lib/threat-intel/cve-fetcher.ts` (service, CRUD + external API — import-only change)

**Analog:** itself

**Imports pattern** (line 7 — change this):
```typescript
import { getCachedThreatData, setCachedThreatData } from './redis-cache';
```

**→ Change to:**
```typescript
import { getCachedThreatData, setCachedThreatData } from './memory-cache';
```

**Service error handling pattern** (lines 64-67):
```typescript
    } catch (error: any) {
        console.error('[NVD] Fetch error:', error.message);
        return [];
    }
```

---

### `src/lib/threat-intel/github-advisories.ts` (service, CRUD + external API — import-only change)

**Analog:** itself

**Imports pattern** (line 7 — change this):
```typescript
import { getCachedThreatData, setCachedThreatData } from './redis-cache';
```

**→ Change to:**
```typescript
import { getCachedThreatData, setCachedThreatData } from './memory-cache';
```

**Service error handling pattern** (lines 65-68):
```typescript
    } catch (error: any) {
        console.error('[GitHub] Fetch error:', error.message);
        return [];
    }
```

---

### `src/lib/ai/response-cache.ts` (service, CRUD — 2 import sites)

**Analog:** itself

**Import site 1** (line 7 — change this):
```typescript
import { getCachedThreatData, setCachedThreatData, getMultipleCachedThreatData } from '../threat-intel/redis-cache';
```

**→ Change to:**
```typescript
import { getCachedThreatData, setCachedThreatData, getMultipleCachedThreatData } from '../threat-intel/memory-cache';
```

**Import site 2** (line 186 — dynamic import):
```typescript
        const { getCachedKeys } = await import('../threat-intel/redis-cache');
```

**→ Change to:**
```typescript
        const { getCachedKeys } = await import('../threat-intel/memory-cache');
```

**AI cache TTL pattern** (line 20):
```typescript
const AI_CACHE_TTL = 604800; // 7 days in seconds
```

---

### `src/lib/github/client.ts` (service, request-response — single-line fix)

**Analog:** itself

**User-agent string** (line 35 — change this):
```typescript
        userAgent: 'VulnScany/1.0.0',
```

**→ Change to:**
```typescript
        userAgent: 'vulscany/1.0.0',
```

**Octokit client creation pattern** (lines 32-37):
```typescript
export function createGitHubClient(accessToken: string): Octokit {
    return new Octokit({
        auth: accessToken,
        userAgent: 'VulnScany/1.0.0',
    });
}
```

---

### `src/lib/local-store.ts` (service, CRUD file I/O — single-line fix)

**Analog:** itself

**TypeScript bug fix** (lines 103-104 — change):
```typescript
  const history = await getScanHistory(githubId);
  return { user, scanHistory };
```

**→ Change to:**
```typescript
  const scanHistory = await getScanHistory(githubId);
  return { user, scanHistory };
```

**File I/O pattern** (lines 40-52):
```typescript
async function readData(): Promise<StorageData> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultData();
  }
}

async function writeData(data: StorageData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
```

## Shared Patterns

### Import Conventions

**Within `src/lib/` subdirectories — relative imports:**
```typescript
// Same-directory imports use './'
import { getCachedThreatData } from './redis-cache';

// Sibling directory imports use '../'
import { getCachedThreatData } from '../threat-intel/redis-cache';
```

**Within `src/app/api/` routes — path alias `@/`:**
```typescript
import { fetchUserRepositories } from '@/lib/github/client';
import { rateLimit } from '@/lib/rate-limit';
```

### Error Handling in Services
**Source:** All service files (`cve-fetcher.ts`, `github-advisories.ts`, `response-cache.ts`, `local-store.ts`, `client.ts`)

**Pattern — return default/safe value on error:**
```typescript
    } catch (error: any) {
        console.error('[Prefix] Descriptive message:', error.message);
        return []; // or null / { error }
    }
```

### Auth Pattern in API Routes
**Source:** `src/app/api/scan/route.ts` lines 27-33, `src/app/api/ai/explain/route.ts` lines 15-20

```typescript
    const cookieStore = await cookies();
    const token = cookieStore.get('github_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
```

### Cache Service Pattern (cache-first)
**Source:** `src/lib/threat-intel/cve-fetcher.ts` (lines 12-18), `github-advisories.ts` (lines 12-18)

```typescript
    const cacheKey = `nvd:react:recent:${limit}`;
    const cached = await getCachedThreatData(cacheKey);

    if (cached) {
        console.log('[NVD] Using cached React CVEs');
        return cached;
    }

    // ... fetch from API ...
```

### Config Default Export Pattern
**Source:** `next.config.ts` and `vitest.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... config properties ...
};

export default nextConfig;
```

## No Analog Found

All 9 files have exact analogs within the codebase (the files themselves being modified, or the files being renamed). No files require patterns from outside the project.

| File | Role | Data Flow | Analog Found |
|------|------|-----------|--------------|
| `src/proxy.ts` | middleware/proxy | request-response | `src/middleware.ts` (same file, renamed) |
| `next.config.ts` | config | static/build-time | itself (self-modification) |
| `src/lib/threat-intel/memory-cache.ts` | utility | utility (in-memory cache) | `redis-cache.ts` (same file, renamed) + `scan-cache.ts` (pattern match) |
| All import-update files | service | various | themselves (self-modification) |

## Metadata

**Analog search scope:** `src/` directory, `next.config.ts`, `vitest.config.ts`
**Files scanned:** 74 source files (all `.ts`/`.tsx` in `src/` plus root config files)
**Pattern extraction date:** 2026-06-11
