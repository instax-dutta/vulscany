## Purpose

Core logic for vulscany: scanning, AI fix generation, threat intelligence, GitHub integration, local storage, caching, validation, and shared utilities.

## Ownership

Owns `src/lib/**`. This is the server-side heart of the app - no React here (except pure helpers).

## Local Contracts

- All persistence goes through `local-store.ts` (JSON file at `.vulscany/data.json`); no external DB.
- Caches are in-memory (`cache/`, per-module caches).
- AI access is abstracted: `ai/mistral.ts`, `ai/ollama.ts`, with rotation and response caching.
- GitHub access centralized in `github/client.ts` (Octokit); PR creation in `github/pr-creator.ts`.
- Scan heuristics live in `scanner/`; threat intel in `threat-intel/`.

## Work Guidance

- Keep modules framework-agnostic so they can be tested with Vitest without Next.js.
- Add tests next to the module (`*.test.ts`).

## Verification

- `npm run test:run`
- `npm run lint`

## Child DOX Index

- `ai/` — Mistral/Ollama providers, fix generation, prompts, rotation, response cache (see `ai/AGENTS.md`)
- `cache/` — in-memory scan cache (see `cache/AGENTS.md`)
- `github/` — Octokit client, stack detection, PR creator (see `github/AGENTS.md`)
- `scanner/` — repository scan engine, SSR/markdown-XSS heuristics (see `scanner/AGENTS.md`)
- `threat-intel/` — CVE + GitHub advisory matching, risk scoring (see `threat-intel/AGENTS.md`)
- `user/` — user stats aggregation
- `utils/` — shared async helpers; `validators/` — zod schemas for API input and code checks
