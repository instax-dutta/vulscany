# Plan: Fix Failing Test Suite and Logic

The goal is to resolve 14 failing tests identified in `npm run test:coverage`, focusing on AI fix generation mocks and code validation logic, while ensuring no real API keys are required for testing.

## Phase 1: Planning & Analysis 
- [x] Identify root cause of `fetch` mocking failure in `fix-generator.test.ts`. 
- [x] Identify logic errors in `code-validator.ts` for parentheses and placeholders.
- [ ] Create this `docs/PLAN.md` (Current).

## Phase 2: Implementation (Orchestrated)

### 1. Fix AI Fix Generator Tests (`backend-specialist` + `test-engineer`)
- **Task**: Fix `fetch` mocking in `src/lib/ai/fix-generator.test.ts`.
- **Details**: 
    - Use `vi.stubGlobal('fetch', vi.fn())` or ensure `global.fetch` is correctly intercepted in the Node environment.
    - Verify that all AI fallback logic works correctly without network access.
    - Ensure `MISTRAL_API_KEYS` are pooled and used without needing real values.

### 2. Fix Code Validator Logic (`backend-specialist`)
- **Task**: Fix `src/lib/validators/code-validator.ts`.
- **Details**:
    - **Balanced Parentheses**: Fix the regex or counting logic that is causing `should detect unbalanced parentheses` to fail (received `true` for valid instead of `false` for invalid).
    - **Placeholder Detection**: Update the `incompletePatterns` check to correctly identify `/* rest of code */` and other markers while avoiding false positives.

### 3. Verification & Coverage (`test-engineer`)
- **Task**: Run full test suite with coverage.
- **Details**:
    - Run `npm run test:run` to confirm all 47 tests pass.
    - Run `npm run test:coverage` to ensure high coverage without regressions.
    - Verify that no external calls are made during tests (enforced by MSW and global fetch mocks).

## Phase 3: Final Synthesis
- Summarize changes and confirm the health of the codebase.

---
**Approved by User?** (Pending)
