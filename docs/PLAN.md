# PLAN: Randomized Hero Text Implementation

## 1. Overview
The goal is to implement a randomized hero section in the `vulscany` landing page. Every time a visitor lands on the page, they should see one of the 20 provided hero text/subheadline combinations. The implementation must be smooth, intelligent, and maintain the existing design's responsiveness.

## 2. Technical Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Components**: React (Client Component)
- **Animations**: CSS Transitions or Framer Motion (for smooth switching)

## 3. Data Definition
Create a constant array `HERO_COMBOS` containing the 20 text pairs.

## 4. Implementation Steps

### Phase 1: Preparation
- Define the `HERO_COMBOS` array in a separate file (e.g., `src/constants/hero-texts.ts`) or within `Hero.tsx`.

### Phase 2: Randomization Logic
- Use `useEffect` and `useState` to select a random index on the client side to avoid hydration mismatch.
- Default to the current hardcoded text for the initial server-side render.

### Phase 3: Component Update
- Update `Hero.tsx` to use the state-driven hero text and subheadline.
- Add smooth fade-in animations for the text to prevent "jumping" when the random text is set.

### Phase 4: Styling & Responsiveness
- Ensure the containers for the text can handle varying lengths of headlines without breaking the layout.
- Verify scaling on mobile, tablet, and desktop.

## 5. Verification Plan
- **Visual Check**: Refresh the page multiple times to verify randomization.
- **Responsiveness**: Test on various screen sizes.
- **Performance**: Ensure no significant layout shift (CLS).
- **Accessibility**: Verify screen readers can still read the hero text.

## 6. Agents Involved
- `project-planner`: Initial planning and breakdown.
- `frontend-specialist`: Implementation of the randomized hero component.
- `performance-optimizer`: Ensuring smooth transitions and minimal layout shift.
- `test-engineer`: Verification and testing.
