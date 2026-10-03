## Purpose

Repository automation and community health files for vulscany.

## Ownership

Owns `.github/**`: `workflows/` (CI and secret scanning), `dependabot.yml`, `ISSUE_TEMPLATE/`, and `PULL_REQUEST_TEMPLATE.md`.

## Local Contracts

- `workflows/ci.yml` runs exactly four npm scripts plus the detection benchmark: `lint`, `typecheck`, `test:run`, `build`. If a script is renamed in `package.json`, CI must be updated in the same change.
- Every job declares `permissions:` and `timeout-minutes:`; workflows use least privilege.
- Every job that needs a secret reads it through `${{ secrets.NAME }}`. Secrets are never committed, printed, or passed as build args.
- No workflow step may reference a file or artifact that does not exist in the repository. A step that silently passes is worse than no step.
- Issue and PR templates tell reporters to use GitHub Security Advisories for vulnerabilities, never a public issue.

## Work Guidance

- Keep CI close to local tooling: run the gate command locally before pushing.
- Node 20 in CI; the project supports Node 18.18+.
- Prefer one workflow per concern (build verification, secret scanning) so a failure names the concern.

## Verification

- `node .unlazy/oss-readiness/scripts/verify-ci.mjs` asserts every npm script CI calls exists, and that triggers, permissions, and timeouts are declared.
- `node .unlazy/oss-readiness/scripts/verify-ci.mjs --dependabot` validates the Dependabot config.
- Full local parity: `npm run lint && npm run typecheck && npm run test:run && npm run build`

## Child DOX Index

- (none yet - add per-workflow docs only if a workflow gains non-obvious contracts)