# PLAN: Rebrand PR System to Aeglyn

## Objective
Update the automated PR generation system to reflect the new "Aeglyn" branding, replacing "VullScanny". ensure backward compatibility with existing "VullScanny" PRs to avoid duplication.

## Files to Modify

### 1. `src/lib/github/pr-creator.ts`
*   **Function: `hasExistingSecurityPR`**
    *   Update logic to check for BOTH `vullscanny/security-fixes-` AND `aeglyn/security-fixes-` branch prefixes.
    *   This ensures we don't open a new Aeglyn PR if a VullScanny PR is already open.
*   **Function: `createSecurityFixPR`**
    *   Update new branch creation to use `aeglyn/security-fixes-${timestamp}`.
    *   Update labels to use `['security', 'aeglyn', 'automated']`.
*   **Function: `generatePRBody`**
    *   Replace "VullScanny" with "Aeglyn" in the title and description.
    *   Update links to `https://aeglyn.sdad.pro`.

### 2. `src/lib/ai/prompts.ts`
*   **Function: `generateMasterFixPrompt`**
    *   Update the title to `# Aeglyn Master Security Fix Mission`.

## Execution Steps

1.  **Frontend Specialist (Text Updates)**: Update `prompts.ts` and the textual parts of `pr-creator.ts`.
2.  **Backend Specialist (Logic Updates)**: Update the branching logic in `pr-creator.ts` to handle the graceful transition (dual-checking prefixes).
3.  **Test Engineer**: Verify the code compiles and logic looks sound (dry run).

## Verification
*   Check that `hasExistingSecurityPR` uses OR logic for branch names.
*   Check that new branches use `aeglyn`.
*   Check that no "VullScanny" visible text remains in the PR body.
