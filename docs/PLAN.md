# PLAN: Nested Project Discovery (Option A)

This plan implements recursive manifest search (Max Depth 2) to accurately identify web application stacks in repositories where the project files are not in the root directory.

## 1. Information Gathering & Discovery

- [x] **Identify Current Logic**: Root-only check in `src/lib/github/stack-detector.ts`.
- [x] **API Support**: `src/lib/github/client.ts` supports `getDirectoryContents`.
- [ ] **Identify Vulnerable Points**:
    - `detectStack` returns `null` if root `package.json` is missing.
    - `scanRepository` (in `src/lib/scanner/index.ts`) might also need path adjustments if it assumes root.

## 2. Implementation Strategy

### Phase 1: Stack Detection Enhancement
- Update `detectStack` in `src/lib/github/stack-detector.ts`.
- If root `package.json` is missing:
    - List root directory contents.
    - Identify subdirectories (excluding hidden ones like `.github`, `node_modules`).
    - Attempt to fetch `package.json` from each subdirectory.
    - If found, use that subdirectory for stack identification.
- Store the detected `projectRoot` (relative path) in the `WebAppProjectInfo` interface.

### Phase 2: Scanner Alignment
- Update `src/lib/scanner/index.ts` to respect the `projectRoot` from `WebAppProjectInfo`.
- Ensure file fetches for vulnerability scanning (regex checks, etc.) use the correct base path.

## 3. Implementation Details

### File: `src/lib/github/stack-detector.ts`
- Add `projectRoot: string` to `WebAppProjectInfo`.
- Add recursive search logic inside `detectStack`.

### File: `src/lib/scanner/index.ts`
- Pass `stackInfo.projectRoot` when fetching files for scanning.

## 4. Verification Plan

- [ ] **Manual Test**: Simulate a nested repo structure (e.g., `oneshotai/package.json`).
- [ ] **Unit Tests**: Add tests for recursive detection.
- [ ] **Safety Checks**: Ensure recursion doesn't hit GitHub rate limits (limit to first 5 subdirectories or specific folder depth).

## 5. Timeline & Delivery
- **Step 1**: Backend Implementation (Backend Specialist)
- **Step 2**: Security/Path Verification (Security Auditor)
- **Step 3**: Final Verification (Test Engineer)
