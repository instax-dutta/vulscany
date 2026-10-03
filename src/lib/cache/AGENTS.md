## Purpose

In-memory caches for scan results and shared cache utilities.

## Ownership

Owns `src/lib/cache/**`: `scan-cache.ts`, `index.ts`.

## Local Contracts

- Process-local only; no Redis. Entries keyed by repo identity (owner/repo/commit-ish).
- Cache invalidation is explicit; never rely on TTL alone for security-relevant data.

## Work Guidance

- New caches should export a small get/set/clear surface like `scan-cache.ts`.

## Verification

- `npx vitest run src/lib/cache` (add tests when extending)

## Child DOX Index

- (none yet)
