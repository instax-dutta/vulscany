## Purpose

Threat intelligence: match dependencies against CVEs and GitHub advisories, score risk.

## Ownership

Owns `src/lib/threat-intel/**`: `cve-fetcher.ts`, `github-advisories.ts`, `risk-analyzer.ts`, `memory-cache.ts`, `types.ts`, `index.ts`.

## Local Contracts

- Network fetches (CVE feeds, GitHub advisories) are cached in-memory via `memory-cache.ts`.
- `risk-analyzer.ts` produces the `threatIntelligence` block embedded in scan results.
- External sources are optional: failures must not break scans, only omit the intel block.

## Work Guidance

- Keep cache TTLs explicit; document any new external source here.

## Verification

- `npx vitest run src/lib/threat-intel`

## Child DOX Index

- (none yet)
