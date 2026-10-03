## Purpose

React components for the vulscany UI: landing page, dashboard, and shared ui primitives.

## Ownership

Owns `src/components/**`. Grouped as: `landing/` (marketing site sections), `dashboard/` (scan results UI), `DashboardFeatures/` (gamified/educational widgets), `ui/` (primitives: button, card, input), plus top-level feature components (FixFeedCard, MasterFixDrawer, ThreatIntelligencePanel, Onboarding, etc.).

## Local Contracts

- Tailwind CSS v4 for styling; `cn()` from `src/lib/utils.ts` for class merging.
- Radix UI primitives underpin `ui/`; framer-motion and lenis for animation/scroll.
- Client components must declare `'use client'`; keep them out of server-only lib imports.

## Work Guidance

- Match the existing section-per-file pattern in `landing/`.
- Dashboard feature panels are registered in `DashboardFeatures/index.ts`.

## Verification

- `npm run lint`
- Component tests via Vitest + Testing Library (`*.test.tsx`)

## Child DOX Index

- (none yet - add per-group docs if a group gains its own contracts)
