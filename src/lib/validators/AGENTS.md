## Purpose

Input validation for API requests and AI-generated code.

## Ownership

Owns `src/lib/validators/**`: `api-validators.ts` (zod schemas for request payloads, size limits, sanitization), `code-validator.ts` (heuristic validation of AI-generated fixes).

## Local Contracts

- Every API route validates its body with a zod schema from `api-validators.ts`.
- AI-generated code must pass `validateGeneratedCode` before being shown or applied.
- Payload sizes are capped (e.g. 5000 chars) to prevent abuse.

## Work Guidance

- New endpoints: add a schema here first, then use it in the route.

## Verification

- `npx vitest run src/lib/validators`

## Child DOX Index

- (none yet)
