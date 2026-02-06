# Plan: Master Fix UX Enhancement (Option A)

Enhance the user experience for the "Master Fix" feature by implementing a side drawer, success notifications, and guidance.

## Task
When the user clicks "Generate Auto-Fix PR" or "Master Fix" (depending on the context), the generated prompt should be announced and easily accessible via a side drawer, rather than just appearing at the bottom of the page.

## Proposed Changes

### 1. Planning & Prep (done by orchestrator)
- Map existing `masterPrompt` usage in `Dashboard` component.
- Identify `DashboardFeatures` components that might need updating.

### 2. Frontend Implementation (`frontend-specialist`)
- **Success Toast**: Add a `showSuccess` toast when the Master Fix prompt is successfully generated.
- **Side Drawer**: Create a `MasterFixDrawer` component (using Framer Motion) that slides in from the right when `masterPrompt` is present.
- **Drawer Content**:
    - Header with "AI Security Patch Protocol".
    - Instructions: "Paste this into your IDE or AI assistant (Claude/ChatGPT/Cursor)."
    - Scrollable code block for the prompt.
    - Large "Copy to Clipboard" button.
- **Dashboard Hooks**:
    - Add `isDrawerOpen` state.
    - Update `generateMasterFix` to open the drawer automatically on completion.

### 3. Verification (`test-engineer`)
- **Manual Verification**: Trigger a scan, click Master Fix, and verify:
    - Toast appears.
    - Drawer slides in.
    - Prompt text is correct.
    - "Copy" button works and provides feedback.
- **Linting**: Run `lint_runner.py` to ensure code quality.

## Deliverables
- [ ] Updated `Dashboard` component with `MasterFixDrawer` and state logic.
- [ ] Integration of success toast in prompt generation flow.
- [ ] Verification report.
