## Purpose

GitHub API access and repository metadata detection.

## Ownership

Owns `src/lib/github/**`: `client.ts` (Octokit wrapper: file contents, directory listing), `stack-detector.ts` (framework/dependency detection, risky dependency flags), `pr-creator.ts` (automated fix PRs).

## Local Contracts

- All GitHub REST calls go through `client.ts`; the access token is passed per call.
- Stack detection returns `WebAppProjectInfo` consumed by the scanner.
- PR creation is the only write path back to GitHub.

## Work Guidance

- Handle GitHub rate limits and 404s explicitly; never leak tokens into logs.

## Verification

- `npx vitest run src/lib/github`
- New client behavior needs a colocated test; `client.test.ts` guards token handling and repo filtering (mutation-tested, must stay above 70% statement coverage)

## Child DOX Index

- (none yet)
