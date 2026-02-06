# Plan - Fix Viewport Bug and Add Navbar

The goal is to fix the viewport bug on the Features page (ensuring it starts at the top) and add the Navbar to the Why page (and other landing pages for consistency).

## Phase 1: Debugging & Planning
- [x] Explore codebase to identify relevant files.
- [x] Identify the cause of the viewport bug (Lenis scroll persistence).
- [x] Create detailed implementation steps.

## Phase 2: Implementation
### 1. Fix Viewport Bug
- [x] Modify `src/components/SmoothScroll.tsx` to reset scroll position on route changes using `useLenis` and `usePathname`.
- [x] Added `scroll-mt-24` to landing sections (`PricingSection`, `FeaturesSection`, `WhySection`) to handle anchor link offsets correctly.

### 2. Add Navbar to Missing Pages
- [x] Update `src/app/why/page.tsx` to include `Navbar` and `Footer`.
- [x] Update `src/app/features/page.tsx` to include `Navbar` and `Footer`.
- [x] Update `src/app/pricing/page.tsx` to include `Navbar` and `Footer`.
- [x] Update `src/app/terms/page.tsx` and `src/app/privacy/page.tsx` for consistency.
- [x] Standardized layout structure (`flex flex-col min-h-screen`) across all landing pages.

## Phase 3: Verification
- [x] Verify navigation from home to subpages starts at the top.
- [x] Verify anchor link scrolling (e.g., clicking logo or navigating to sections) doesn't overlap the sticky Navbar.
- [x] Verify layout responsiveness and footer placement.

## Agents Involved
- **Project Planner**: Task breakdown and planning.
- **Frontend Specialist**: UI implementation and Navbar integration.
- **Debugger**: Root cause analysis and fix for the scroll bug.
- **Test Engineer**: Final verification.
