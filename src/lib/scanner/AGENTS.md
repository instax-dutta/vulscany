## Purpose

Static code security heuristics that produce the vulnerability list.

## Ownership

Owns `src/lib/scanner/**`: `index.ts` (`scanRepository` orchestrator, `Vulnerability`/`ScanResult` types), `ssr-detector.ts` (SSR injection heuristics, snippet extraction).

## Local Contracts

- Scanner is heuristic/regex-based; input is repo files fetched via `lib/github/client.ts`.
- Output is the shared `Vulnerability`/`ScanResult` shape consumed by API routes and UI.
- Vulnerability `type` is a closed union: version, dangerous-api, ssr-injection, markdown-xss, dependency, xss-vulnerable-attribute, code-execution-pattern, obfuscation, secret-exposure.

## Work Guidance

- New detectors should be pure functions over file contents, separately testable.
- Every new rule needs a colocated test case.

## Verification

- `npx vitest run src/lib/scanner`

## Child DOX Index

- (none yet)
