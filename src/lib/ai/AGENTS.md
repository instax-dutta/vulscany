## Purpose

AI integration for vulnerability explanations and fix generation.

## Ownership

Owns `src/lib/ai/**`: provider clients (`mistral.ts`, `ollama.ts`), `fix-generator.ts`, `prompts.ts`, `rotation.ts` (provider failover), `response-cache.ts`, `pr-context.ts`.

## Local Contracts

- Two providers: Mistral (API key via `MISTRAL_API_KEY`) and Ollama (local). Rotation handles fallback.
- Responses cached in-memory via `response-cache.ts` to avoid repeat calls.
- Prompts centralized in `prompts.ts`; keep prompt changes reviewable.
- AI is optional: features must degrade gracefully when no provider is configured.

## Work Guidance

- Never hardcode model names outside the provider modules.
- New AI features go through `fix-generator.ts`-style orchestration, not raw provider calls from routes.

## Verification

- `npx vitest run src/lib/ai`

## Child DOX Index

- (none yet)
