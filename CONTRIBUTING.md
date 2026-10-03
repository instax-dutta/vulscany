# Contributing

## Setup

```bash
npm install
npm run dev
```

## Development loop

1. Pick an issue or propose a change in a discussion.
2. Write a failing test next to the code (colocated `*.test.ts`).
3. Implement until `npm run test:run` passes.
4. Run `npm run lint` and `npm run build` before opening a PR.
5. Reference the relevant `src/**/AGENTS.md` contract when touching a subtree.

## Architecture map

See the root `AGENTS.md` Child DOX Index and `.unlazy/modernize/MODERNIZATION.md` for the modernization roadmap.

## Pull requests

- One feature per PR; keep diffs reviewable.
- Update docs when contracts change.
